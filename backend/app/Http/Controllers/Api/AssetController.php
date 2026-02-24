<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Asset;

class AssetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Asset::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'sku' => 'required|string|unique:assets',
            'location' => 'nullable|string',
            'brand' => 'nullable|string',
            'category' => 'nullable|string',
            'model_number' => 'nullable|string',
            'serial_number' => 'nullable|string',
            'purchase_date' => 'nullable|date',
            'warranty_expiry' => 'nullable|date',
            'last_maintenance_date' => 'nullable|date',
            'next_maintenance_date' => 'nullable|date',
            'maintenance_interval_days' => 'nullable|integer',
            'status' => 'nullable|string',
            'image_url' => 'nullable|string',
            'pk' => 'nullable|string',
        ]);

        $asset = Asset::create($validated);
        return response()->json($asset, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $asset = Asset::findOrFail($id);
        return response()->json($asset);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $asset = Asset::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string',
            'sku' => 'sometimes|string|unique:assets,sku,' . $asset->id,
            'location' => 'nullable|string',
            'brand' => 'nullable|string',
            'category' => 'nullable|string',
            'model_number' => 'nullable|string',
            'serial_number' => 'nullable|string',
            'purchase_date' => 'nullable|date',
            'warranty_expiry' => 'nullable|date',
            'last_maintenance_date' => 'nullable|date',
            'next_maintenance_date' => 'nullable|date',
            'maintenance_interval_days' => 'nullable|integer',
            'status' => 'nullable|string',
            'image_url' => 'nullable|string',
            'pk' => 'nullable|string',
        ]);

        $asset->update($validated);
        return response()->json($asset);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $asset = Asset::findOrFail($id);
        $asset->delete();
        return response()->json(['message' => 'Asset deleted successfully']);
    }
}
