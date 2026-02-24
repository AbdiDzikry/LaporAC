<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Ticket;

class TicketController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Ticket::with(['assets', 'assignedTechnician', 'validatedBy']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('issue_category')) {
            $query->where('issue_category', $request->issue_category);
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
        $ticket = Ticket::with(['assets', 'assignedTechnician', 'validatedBy'])->findOrFail($id);
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

        $ticket->update($validated);
        return response()->json($ticket->fresh(['assets', 'assignedTechnician', 'validatedBy']));
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
