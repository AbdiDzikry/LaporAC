<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PricelistItem;
use App\Models\PricelistLog;
use App\Models\VendorProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PricelistItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();

        if ($user && $user->role === 'vendor') {
            $vendorProfile = VendorProfile::where('user_id', $user->id)->first();
            if ($vendorProfile) {
                return PricelistItem::with('vendor')->where('vendor_id', $vendorProfile->id)->get();
            }
            return response()->json([]);
        }

        return PricelistItem::with('vendor')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'type' => 'required|in:jasa,sparepart',
            'category' => 'nullable|string',
            'price' => 'required|numeric',
            'old_price' => 'nullable|numeric',
            'unit' => 'nullable|string',
            'vendor_id' => 'nullable|exists:vendor_profiles,id',
            'image' => 'nullable|image|max:2048',
        ]);

        $user = auth()->user();
        if ($user && $user->role === 'vendor') {
            $vendorProfile = VendorProfile::where('user_id', $user->id)->first();
            if ($vendorProfile) {
                $validated['vendor_id'] = $vendorProfile->id;
            }
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('pricelists', 'public');
            $validated['image_path'] = $path;
        }

        $item = PricelistItem::create($validated);

        PricelistLog::create([
            'pricelist_item_id' => $item->id,
            'user_id' => auth()->id(), // Admin or Vendor
            'action' => 'created',
            'new_price' => $item->price,
        ]);

        return response()->json($item->load('vendor'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return PricelistItem::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $item = PricelistItem::findOrFail($id);
        $user = auth()->user();

        // Security check for vendor role
        if ($user && $user->role === 'vendor') {
            $vendorProfile = VendorProfile::where('user_id', $user->id)->first();
            if (!$vendorProfile || $item->vendor_id !== $vendorProfile->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $validated = $request->validate([
            'name' => 'sometimes|string',
            'type' => 'sometimes|in:jasa,sparepart',
            'category' => 'nullable|string',
            'price' => 'sometimes|numeric',
            'old_price' => 'nullable|numeric',
            'unit' => 'nullable|string',
            'vendor_id' => 'nullable|exists:vendor_profiles,id',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($user && $user->role === 'vendor') {
            unset($validated['vendor_id']); // block vendor from changing ownership
        }

        if ($request->hasFile('image')) {
            if ($item->image_path) {
                Storage::disk('public')->delete($item->image_path);
            }
            $path = $request->file('image')->store('pricelists', 'public');
            $validated['image_path'] = $path;
        }

        $oldPrice = $item->price;
        $item->update($validated);

        if (isset($validated['price']) && $oldPrice != $validated['price']) {
            PricelistLog::create([
                'pricelist_item_id' => $item->id,
                'user_id' => auth()->id(),
                'action' => 'updated',
                'old_price' => $oldPrice,
                'new_price' => $item->price,
            ]);
        }

        return response()->json($item->load('vendor'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $item = PricelistItem::findOrFail($id);

        PricelistLog::create([
            'pricelist_item_id' => $item->id,
            'user_id' => auth()->id(),
            'action' => 'deleted',
            'old_price' => $item->price,
        ]);

        $item->delete();
        return response()->json(null, 204);
    }

    /**
     * Get logs for a specific item
     */
    public function getLogs(string $id)
    {
        $item = PricelistItem::findOrFail($id);
        return $item->logs()->with('user')->orderBy('created_at', 'desc')->get();
    }
}
