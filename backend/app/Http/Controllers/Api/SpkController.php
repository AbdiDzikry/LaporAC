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
            'status' => $validated['status'] ?? 'pending_approval',
            'is_warranty_claim' => $isWarranty,
        ]));

        // Set ticket to waiting_for_spk_approval
        $ticket->update([
            'assigned_vendor_id' => $spk->vendor_id,
            'status' => 'waiting_for_spk_approval',
        ]);

        $spkWithVendor = $spk->load(['vendor', 'ticket']);

        return response()->json($spkWithVendor, 201);
    }

    public function show(string $id)
    {
        return response()->json(Spk::with(['vendor', 'ticket.asset', 'items.pricelistItem'])->findOrFail($id));
    }

    /**
     * Section Head approves SPK
     */
    public function approveBySectionHead(Request $request, string $id)
    {
        $spk = Spk::with('ticket')->findOrFail($id);
        $user = auth()->user();

        if (!$user || $user->role !== 'section_head') {
            return response()->json(['error' => 'Hanya Section Head yang berhak menyetujui SPK'], 403);
        }

        if ($spk->status !== 'pending_approval') {
            return response()->json(['error' => 'SPK tidak dalam status pending_approval'], 422);
        }

        $spk->update([
            'status' => 'assigned',
            'approved_by_id' => $user->id,
            'approved_at' => now(),
            // Remove proposed date logic, assume immediate work
            'work_start_date' => now()->toDateString(),
        ]);

        if ($spk->ticket) {
            $spk->ticket->update(['status' => 'vendor_assigned']);
        }

        $spkWithVendor = $spk->load(['vendor', 'ticket.asset']);

        // Send email to vendor after approval
        try {
            if ($spkWithVendor->vendor && $spkWithVendor->vendor->email) {
                Mail::to($spkWithVendor->vendor->email)->queue(new SpkNotification($spkWithVendor));
            }
        } catch (\Exception $e) {
            // Log error silently, proceed
        }

        return response()->json(['message' => 'SPK disetujui', 'spk' => $spkWithVendor], 200);
    }

    /**
     * Section Head rejects SPK
     */
    public function rejectBySectionHead(Request $request, string $id)
    {
        $spk = Spk::with('ticket')->findOrFail($id);
        $user = auth()->user();

        if (!$user || $user->role !== 'section_head') {
            return response()->json(['error' => 'Hanya Section Head yang berhak menolak SPK'], 403);
        }

        if ($spk->status !== 'pending_approval') {
            return response()->json(['error' => 'SPK tidak dalam status pending_approval'], 422);
        }

        $validated = $request->validate([
            'admin_schedule_notes' => 'required|string|max:500', // using this field as rejection notes
        ]);

        $spk->update([
            'status' => 'draft', // or appropriate rejected status back to admin
            'admin_schedule_notes' => 'Ditolak Section Head: ' . $validated['admin_schedule_notes'],
        ]);

        if ($spk->ticket) {
            $spk->ticket->update(['status' => 'validated']); // back to validated pool
        }

        return response()->json(['message' => 'SPK ditolak', 'spk' => $spk->load(['vendor', 'ticket.asset'])], 200);
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

    /**
     * Admin verifies completed SPK work → status becomes 'resolved'
     */
    public function verifyCompletion(Request $request, string $id)
    {
        $spk = Spk::with('ticket')->findOrFail($id);
        $user = auth()->user();

        if (!$user || !in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json(['error' => 'Hanya Admin yang berhak memverifikasi penyelesaian SPK'], 403);
        }

        if ($spk->status !== 'completed') {
            return response()->json(['error' => 'SPK belum berstatus completed'], 422);
        }

        $validated = $request->validate([
            'verification_notes' => 'nullable|string|max:1000',
        ]);

        $spk->update([
            'status' => 'resolved',
            'admin_verification_notes' => $validated['verification_notes'] ?? null,
            'verified_by_id' => $user->id,
            'verified_at' => now(),
        ]);

        if ($spk->ticket) {
            $spk->ticket->update([
                'status' => 'resolved',
                'date_resolved' => now(),
            ]);
        }

        return response()->json(['message' => 'SPK diverifikasi dan ditutup', 'spk' => $spk->load(['vendor', 'ticket.asset'])], 200);
    }

    /**
     * Get resolved SPKs for Berita Acara generation (with optional date range filter)
     */
    public function getResolved(Request $request)
    {
        $query = Spk::with(['vendor', 'ticket.asset', 'items.pricelistItem'])
            ->where('status', 'resolved');

        if ($request->has('from')) {
            $query->whereDate('updated_at', '>=', $request->from);
        }
        if ($request->has('to')) {
            $query->whereDate('updated_at', '<=', $request->to);
        }

        return response()->json($query->orderBy('updated_at', 'desc')->get());
    }

    /**
     * Generate collective Berita Acara PDF for selected SPKs
     */
    public function generateBeritaAcara(Request $request)
    {
        $validated = $request->validate([
            'spk_ids' => 'required|array|min:1',
            'spk_ids.*' => 'exists:spks,id',
        ]);

        $spks = Spk::with(['vendor', 'ticket.asset', 'items.pricelistItem'])
            ->whereIn('id', $validated['spk_ids'])
            ->where('status', 'resolved')
            ->orderBy('updated_at', 'asc')
            ->get();

        if ($spks->isEmpty()) {
            return response()->json(['error' => 'Tidak ada SPK resolved yang dipilih'], 422);
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.berita-acara', compact('spks'))
            ->setPaper('a4', 'portrait');

        return $pdf->stream('Berita_Acara_' . now()->format('Ymd_His') . '.pdf');
    }
}
