<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\TicketStatusNotification;

use App\Models\Ticket;
use App\Models\User;

class TicketController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Ticket::with(['assets', 'assignedTechnician', 'validatedBy', 'spks']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('issue_category')) {
            $query->where('issue_category', $request->issue_category);
        }

        if ($request->has('asset_id')) {
            $query->where('asset_id', $request->asset_id);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string',
            'description' => 'required|string',
            'issue_category' => 'nullable|string',
            'priority' => 'nullable|string',
            'location' => 'nullable|string',

            'reporter_name' => 'nullable|string',
            'reporter_nik' => 'nullable|string',

            'asset_id' => 'nullable|exists:assets,id',
            'assigned_technician_id' => 'nullable|exists:users,id',
            'assigned_technician_name' => 'nullable|string',

            'target_date' => 'nullable|date',
            'status' => 'nullable|string',
        ]);

        if (empty($validated['status'])) {
            $validated['status'] = 'open';
        }

        $ticket = Ticket::create($validated);

        return response()->json($ticket->load(['assets', 'assignedTechnician']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $ticket = Ticket::with(['assets', 'assignedTechnician', 'validatedBy', 'spks'])->findOrFail($id);
        return response()->json($ticket);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $ticket = Ticket::findOrFail($id);

        $validated = $request->validate([
            'title' => 'nullable|string',
            'description' => 'nullable|string',
            'status' => 'nullable|string',
            'issue_category' => 'nullable|string',
            'priority' => 'nullable|string',
            'location' => 'nullable|string',

            'asset_id' => 'nullable|exists:assets,id',
            'assigned_technician_id' => 'nullable|exists:users,id',
            'assigned_technician_name' => 'nullable|string',
            'validated_by_id' => 'nullable|exists:users,id',

            'target_date' => 'nullable|date',
            'completion_date' => 'nullable|date',
            'validation_date' => 'nullable|date',
            'date_resolved' => 'nullable|date',

            'action_type' => 'nullable|string',
            'failure_type' => 'nullable|string',
            'initial_diagnosis' => 'nullable|string',
            'root_cause' => 'nullable|string',
            'is_damage_confirmed' => 'nullable|boolean',
            'is_parts_replaced' => 'nullable|boolean',
            'validation_notes' => 'nullable|string',
            'completion_notes' => 'nullable|string',
            'cost' => 'nullable|integer',
        ]);

        $oldStatus = $ticket->status;
        $oldVendor = $ticket->assigned_vendor_id;

        $ticket->update($validated);

        // --- Auto-Generate SPK if Vendor is newly assigned ---
        if (isset($validated['action_type']) && $validated['action_type'] === 'vendor' && isset($validated['assigned_vendor_id'])) {
            // Check if SPK already exists for this vendor and ticket to avoid duplicates
            if ($oldVendor !== $ticket->assigned_vendor_id || !$ticket->spks()->where('vendor_id', $ticket->assigned_vendor_id)->exists()) {

                // Determine warranty status based on asset
                $isWarranty = false;
                if ($ticket->asset_id) {
                    $asset = \App\Models\Asset::find($ticket->asset_id);
                    if ($asset && $asset->warranty_expiry && now()->lessThanOrEqualTo(\Carbon\Carbon::parse($asset->warranty_expiry))) {
                        $isWarranty = true;
                    }
                }

                \App\Models\Spk::create([
                    'spk_number' => 'SPK-' . date('Ymd') . '-' . rand(1000, 9999),
                    'ticket_id' => $ticket->id,
                    'vendor_id' => $ticket->assigned_vendor_id,
                    'status' => 'draft',
                    'is_warranty_claim' => $isWarranty,
                ]);
            }
        }
        // -----------------------------------------------------

        if (isset($validated['status']) && $oldStatus !== $validated['status']) {
            try {
                $reporter = User::where('nik', $ticket->reporter_nik)->first();
                if ($reporter && $reporter->email) {
                    Mail::to($reporter->email)->queue(new TicketStatusNotification($ticket));
                }
            } catch (\Exception $e) {
                // Log error silently
            }
        }

        return response()->json($ticket->fresh(['assets', 'assignedTechnician', 'validatedBy', 'spks']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $ticket = Ticket::findOrFail($id);
        $ticket->delete();
        return response()->json(['message' => 'Ticket deleted successfully']);
    }
}
