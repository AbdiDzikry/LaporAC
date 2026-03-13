<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\MaintenanceSchedule;
use App\Models\Asset;
use App\Models\Spk;
use App\Models\AppConfig;

class MaintenanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = MaintenanceSchedule::with(['asset', 'ticket']);

        if ($request->has('period_id')) {
            $query->where('period_id', $request->period_id);
        }
        
        // Security logic for Vendor - only see their own APPROVED schedules
        $user = auth()->user();
        if ($user && $user->role === 'vendor') {
            $query->whereHas('ticket.spks', function ($spkQuery) use ($user) {
                // Ensure SPK belongs to this vendor and has been approved by section head (assigned status)
                $spkQuery->where('vendor_id', $user->id)
                         ->whereNotIn('status', ['draft', 'pending_approval', 'rejected']);
            });
        }

        return response()->json($query->orderBy('scheduled_date', 'asc')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'asset_id' => 'required|exists:assets,id',
            'scheduled_date' => 'required|date',
            'status' => 'nullable|string',
            'ticket_id' => 'nullable|exists:tickets,id',
            'period_id' => 'nullable|integer',
        ]);

        if (empty($validated['status'])) {
            $validated['status'] = 'scheduled';
        }

        $schedule = MaintenanceSchedule::create($validated);

        return response()->json($schedule->load(['asset']), 201);
    }

    /**
     * Complete a maintenance schedule
     */
    public function markComplete(Request $request, $id)
    {
        $schedule = MaintenanceSchedule::findOrFail($id);

        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        $schedule->update([
            'status' => 'completed',
            'completed_date' => now(),
            'technician_notes' => $validated['notes'] ?? null,
        ]);

        // Automatically update asset next_maintenance_date
        $asset = Asset::find($schedule->asset_id);
        if ($asset && $asset->maintenance_interval_days) {
            $asset->update([
                'last_maintenance_date' => now(),
                'next_maintenance_date' => now()->addDays($asset->maintenance_interval_days),
            ]);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $schedule = MaintenanceSchedule::findOrFail($id);

        $validated = $request->validate([
            'scheduled_date' => 'sometimes|date',
            'status' => 'sometimes|string',
            'technician_notes' => 'nullable|string',
            'period_id' => 'nullable|integer',
        ]);

        $schedule->update($validated);
        return response()->json($schedule->fresh(['asset']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $schedule = MaintenanceSchedule::findOrFail($id);
        $schedule->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    /**
     * Generate SPK for a maintenance schedule (manual trigger by admin)
     */
    public function generateSpk(Request $request, string $id)
    {
        $schedule = MaintenanceSchedule::with('asset')->findOrFail($id);

        $validated = $request->validate([
            'vendor_id' => 'required|exists:users,id',
        ]);

        // Auto-create Ticket if not exists
        if (!$schedule->ticket_id) {
            $ticket = \App\Models\Ticket::create([
                'title' => 'Maintenance Rutin: ' . ($schedule->asset->name ?? 'Aset'),
                'description' => 'Jadwal Pemeliharaan Rutin untuk aset ' . ($schedule->asset->name ?? '') . ' pada ' . $schedule->scheduled_date,
                'issue_category' => 'AC',
                'asset_id' => $schedule->asset_id,
                'status' => 'waiting_for_spk_approval',
                'action_type' => 'vendor',
                'assigned_vendor_id' => $validated['vendor_id'],
            ]);
            
            $schedule->update(['ticket_id' => $ticket->id]);
            $schedule = $schedule->fresh(); // Reload with ticket
        }

        // Check if SPK already exists for this schedule
        $existingSpk = Spk::where('ticket_id', $schedule->ticket_id)
            ->where('spk_type', 'maintenance')
            ->first();

        if ($existingSpk) {
            return response()->json(['error' => 'SPK maintenance sudah pernah diterbitkan untuk jadwal ini'], 422);
        }

        // Create maintenance SPK as pending_approval
        $spk = Spk::create([
            'spk_number' => 'SPK-MT-' . date('Ymd') . '-' . rand(1000, 9999),
            'ticket_id' => $schedule->ticket_id,
            'vendor_id' => $validated['vendor_id'],
            'status' => 'pending_approval', // Section Head needs to approve first
            'is_warranty_claim' => false,
            'spk_type' => 'maintenance',
            'work_start_date' => $schedule->scheduled_date,
        ]);

        return response()->json([
            'message' => 'SPK maintenance berhasil dibuat dan menunggu persetujuan',
            'spk' => $spk->load(['vendor', 'ticket.asset']),
        ], 201);
    }
}
