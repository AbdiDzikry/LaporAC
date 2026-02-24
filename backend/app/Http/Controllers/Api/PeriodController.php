<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\MaintenancePeriod;
use App\Models\MaintenanceSchedule;
use Illuminate\Support\Facades\DB;

class PeriodController extends Controller
{
    public function index(Request $request)
    {
        $query = MaintenancePeriod::query()
            ->withCount('schedules as total_schedules')
            ->withCount([
                'schedules as completed_schedules' => function ($query) {
                    $query->where('status', 'completed');
                }
            ]);

        if ($request->has('year')) {
            $query->where('year', $request->year);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        return response()->json($query->orderBy('month', 'asc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer',
            'status' => 'nullable|string',
        ]);

        if (MaintenancePeriod::where('month', $validated['month'])->where('year', $validated['year'])->exists()) {
            return response()->json(['error' => 'Period already exists'], 400);
        }

        $validated['created_by'] = $request->user()->id;
        $period = MaintenancePeriod::create($validated);

        return response()->json($period, 201);
    }

    public function show(string $id)
    {
        $period = MaintenancePeriod::withCount('schedules as total_schedules')
            ->withCount([
                'schedules as completed_schedules' => function ($query) {
                    $query->where('status', 'completed');
                }
            ])
            ->findOrFail($id);

        return response()->json($period);
    }

    public function update(Request $request, string $id)
    {
        $period = MaintenancePeriod::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|string',
            'name' => 'sometimes|string',
        ]);

        $period->update($validated);
        return response()->json($period);
    }

    public function destroy(string $id)
    {
        $period = MaintenancePeriod::findOrFail($id);
        $period->delete();
        return response()->json(['message' => 'Period deleted successfully']);
    }

    public function availableYears()
    {
        $years = MaintenancePeriod::select('year')->distinct()->pluck('year');
        return response()->json($years->isEmpty() ? [date('Y')] : $years);
    }

    public function stats(Request $request)
    {
        $year = $request->query('year', date('Y'));

        $periods = MaintenancePeriod::where('year', $year)->get();
        $periodIds = $periods->pluck('id');

        $totalSchedules = MaintenanceSchedule::whereIn('period_id', $periodIds)->count();
        $completedSchedules = MaintenanceSchedule::whereIn('period_id', $periodIds)->where('status', 'completed')->count();

        return response()->json([
            'total_periods' => $periods->count(),
            'active_periods' => $periods->where('status', 'active')->count(),
            'total_schedules' => $totalSchedules,
            'completed_schedules' => $completedSchedules,
            'completion_rate' => $totalSchedules > 0 ? round(($completedSchedules / $totalSchedules) * 100) : 0,
        ]);
    }

    public function recalculateStats(string $id)
    {
        return response()->json(['message' => 'Not implemented. Stats computed on the fly for MVP.']);
    }

    public function syncStatuses()
    {
        return response()->json(['message' => 'Not implemented. Auto-sync disabled for MVP.']);
    }
}
