<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Spk;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\SpkNotification;

class SpkController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $query = Spk::with(['vendor', 'ticket.asset', 'items.pricelistItem']);

        if ($user && $user->role === 'vendor') {
            $query->where('vendor_id', $user->id);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ticket_id' => 'required|exists:tickets,id',
            'vendor_id' => 'required|exists:users,id',
            'status' => 'nullable|string',
            'completion_notes' => 'nullable|string',
            'is_warranty_claim' => 'nullable|boolean',
        ]);

        $ticket = Ticket::with('asset')->findOrFail($validated['ticket_id']);

        // Auto check warranty flag based on asset logic unless explicitly passed
        $isWarranty = $validated['is_warranty_claim'] ?? false;

        if (!isset($validated['is_warranty_claim']) && $ticket->asset && $ticket->asset->warranty_expiry) {
            $expiryDate = \Carbon\Carbon::parse($ticket->asset->warranty_expiry);
            if (now()->lessThanOrEqualTo($expiryDate)) {
                $isWarranty = true;
            }
        }

        $spk = Spk::create(array_merge($validated, [
            'spk_number' => 'SPK-' . date('Ymd') . '-' . rand(1000, 9999),
            'status' => $validated['status'] ?? 'draft',
            'is_warranty_claim' => $isWarranty,
        ]));

        $ticket->update([
            'assigned_vendor_id' => $spk->vendor_id,
        ]);

        $spkWithVendor = $spk->load(['vendor', 'ticket']);

        try {
            if ($spkWithVendor->vendor && $spkWithVendor->vendor->email) {
                Mail::to($spkWithVendor->vendor->email)->queue(new SpkNotification($spkWithVendor));
            }
        } catch (\Exception $e) {
            // Log error silently
        }

        return response()->json($spkWithVendor, 201);
    }

    public function show(string $id)
    {
        return response()->json(Spk::with(['vendor', 'ticket.asset', 'items.pricelistItem'])->findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $spk = Spk::with('ticket.asset')->findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|string',
            'completion_notes' => 'sometimes|string',
            'items' => 'sometimes|array',
            'photos' => 'sometimes|array',
        ]);

        DB::beginTransaction();
        try {
            if (isset($validated['items'])) {
                $spk->items()->delete();
                $totalCost = 0;

                foreach ($validated['items'] as $item) {
                    $totalPrice = $item['qty'] * $item['price_per_item'];
                    $spk->items()->create([
                        'pricelist_item_id' => $item['pricelist_item_id'] ?? null,
                        'item_name' => $item['item_name'],
                        'qty' => $item['qty'],
                        'price_per_item' => $item['price_per_item'],
                        'total_price' => $totalPrice,
                    ]);
                    $totalCost += $totalPrice;
                }

                $spk->total_cost = $spk->is_warranty_claim ? 0 : $totalCost;
            }

            if (isset($validated['photos'])) {
                $spk->photos = $validated['photos'];
            }

            if (isset($validated['status'])) {
                $spk->status = $validated['status'];

                // Warranty Extension Logic on Completion
                if ($spk->status === 'completed' && $spk->isDirty('status')) {
                    if ($spk->ticket && $spk->ticket->asset) {
                        $warrantyMonths = \App\Models\AppConfig::where('identifier', 'warranty_duration_months')->value('value') ?? 3;
                        $asset = $spk->ticket->asset;
                        $currentExpiry = $asset->warranty_expiry ? \Carbon\Carbon::parse($asset->warranty_expiry) : now();
                        $newExpiry = now()->addMonths((int) $warrantyMonths);

                        // Only extend if the new expiry is greater than the current one
                        if ($newExpiry->greaterThan($currentExpiry)) {
                            $asset->update(['warranty_expiry' => $newExpiry->toDateString()]);
                        }
                    }
                }
            }

            if (isset($validated['completion_notes'])) {
                $spk->completion_notes = $validated['completion_notes'];
            }

            $spk->save();
            DB::commit();

            return response()->json($spk->load('items'));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy(string $id)
    {
        Spk::findOrFail($id)->delete();
        return response()->json(null, 204);
    }

    public function downloadSpk(string $id)
    {
        $spk = Spk::with(['vendor', 'ticket.asset', 'items'])->findOrFail($id);

        // Ensure DomPDF is loaded
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.spk', compact('spk'));

        return $pdf->download("SPK_{$spk->spk_number}.pdf");
    }
}
