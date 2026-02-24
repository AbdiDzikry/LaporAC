<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\MaintenanceSchedule;
use App\Models\Asset;

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
}
