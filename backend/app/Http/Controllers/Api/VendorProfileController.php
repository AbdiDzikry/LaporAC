<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VendorProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class VendorProfileController extends Controller
{
    /**
     * Display a listing of vendor profiles
     */
    public function index()
    {
        $vendors = VendorProfile::with('user')
            ->orderBy('rating', 'desc')
            ->get();

        return response()->json($vendors);
    }

    /**
     * Get active vendors only
     */
    public function activeVendors()
    {
        $vendors = VendorProfile::getActiveVendors();
        return response()->json($vendors);
    }

    /**
     * Store a newly created vendor profile
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            // User fields
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:vendor',
            'nik' => 'nullable|string|unique:users,nik',

            // Vendor profile fields
            'company_name' => 'nullable|string|max:255',
            'company_address' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
            'vendor_email' => 'nullable|email',
            'npwp' => 'nullable|string|max:50',
            'bank_name' => 'nullable|string|max:100',
            'bank_account' => 'nullable|string|max:50',
            'account_holder' => 'nullable|string|max:100',
            'specialties' => 'nullable|array',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,suspended',
        ]);

        // Create user with vendor role
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'vendor',
            'nik' => $validated['nik'] ?? null,
        ]);

        // Create vendor profile
        $vendorProfile = VendorProfile::create([
            'user_id' => $user->id,
            'company_name' => $validated['company_name'] ?? null,
            'company_address' => $validated['company_address'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? $user->email,
            'npwp' => $validated['npwp'] ?? null,
            'bank_name' => $validated['bank_name'] ?? null,
            'bank_account' => $validated['bank_account'] ?? null,
            'account_holder' => $validated['account_holder'] ?? null,
            'specialties' => $validated['specialties'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'status' => $validated['status'] ?? 'active',
        ]);

        // --- NEW: Trigger the Onboarding Email Notification ---
        try {
            if (!empty($vendorProfile->email)) {
                \Illuminate\Support\Facades\Mail::to($vendorProfile->email)->queue(new \App\Mail\VendorOnboardingMail($user, $vendorProfile, $validated['password']));
            } elseif (!empty($user->email)) {
                \Illuminate\Support\Facades\Mail::to($user->email)->queue(new \App\Mail\VendorOnboardingMail($user, $vendorProfile, $validated['password']));
            }
        } catch (\Exception $e) {
            // Log silent error for invalid SMTP config
            \Illuminate\Support\Facades\Log::error('Failed to send vendor onboarding email: ' . $e->getMessage());
        }

        return response()->json($vendorProfile->load('user'), 201);
    }

    /**
     * Display the specified vendor profile
     */
    public function show($id)
    {
        $vendor = VendorProfile::with(['user', 'spks', 'completedSpks'])->findOrFail($id);
        return response()->json($vendor);
    }

    /**
     * Get vendor profile by user ID
     */
    public function showByUser($userId)
    {
        $vendor = VendorProfile::with(['user', 'spks'])
            ->where('user_id', $userId)
            ->firstOrFail();

        return response()->json($vendor);
    }

    /**
     * Update the specified vendor profile
     */
    public function update(Request $request, $id)
    {
        $vendor = VendorProfile::findOrFail($id);

        $validated = $request->validate([
            // User fields
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($vendor->user_id)],
            'password' => 'nullable|string|min:8',
            'nik' => ['sometimes', 'nullable', 'string', Rule::unique('users')->ignore($vendor->user_id)],

            // Vendor profile fields
            'company_name' => 'nullable|string|max:255',
            'company_address' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
            'vendor_email' => 'nullable|email',
            'npwp' => 'nullable|string|max:50',
            'bank_name' => 'nullable|string|max:100',
            'bank_account' => 'nullable|string|max:50',
            'account_holder' => 'nullable|string|max:100',
            'specialties' => 'nullable|array',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,suspended',
        ]);

        $credentialsChanged = false;
        $plainPassword = null;

        // Update user if provided
        if (isset($validated['name'])) {
            $vendor->user->name = $validated['name'];
        }
        if (isset($validated['email']) && $vendor->user->email !== $validated['email']) {
            $vendor->user->email = $validated['email'];
            $credentialsChanged = true;
        }
        // Only trigger update if password is not empty
        if (!empty($validated['password'])) {
            $vendor->user->password = Hash::make($validated['password']);
            $plainPassword = $validated['password'];
            $credentialsChanged = true;
        }
        if (isset($validated['nik'])) {
            $vendor->user->nik = $validated['nik'];
        }

        if ($vendor->user->isDirty()) {
            $vendor->user->save();
        }

        // Update vendor profile
        $updateFields = [
            'company_name',
            'company_address',
            'phone',
            'email',
            'npwp',
            'bank_name',
            'bank_account',
            'account_holder',
            'specialties',
            'notes',
            'status'
        ];

        foreach ($updateFields as $field) {
            if (array_key_exists($field, $validated)) {
                $vendor->$field = $validated[$field];
            }
        }

        $vendor->save();

        if ($credentialsChanged) {
            try {
                if (!empty($vendor->email)) {
                    \Illuminate\Support\Facades\Mail::to($vendor->email)->queue(new \App\Mail\VendorCredentialUpdateMail($vendor->user, $vendor, $plainPassword));
                } elseif (!empty($vendor->user->email)) {
                    \Illuminate\Support\Facades\Mail::to($vendor->user->email)->queue(new \App\Mail\VendorCredentialUpdateMail($vendor->user, $vendor, $plainPassword));
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Failed to send vendor update email: ' . $e->getMessage());
            }
        }

        return response()->json($vendor->load('user'));
    }

    /**
     * Remove the specified vendor profile
     */
    public function destroy($id)
    {
        $vendor = VendorProfile::findOrFail($id);

        // Delete the user (cascade will delete vendor profile)
        $vendor->user->delete();

        return response()->json(null, 204);
    }

    /**
     * Update vendor rating
     */
    public function updateRating($id)
    {
        $vendor = VendorProfile::findOrFail($id);
        $vendor->updateRating();

        return response()->json($vendor);
    }

    /**
     * Get vendor statistics
     */
    public function statistics($id)
    {
        $vendor = VendorProfile::findOrFail($id);

        $stats = [
            'total_spks' => $vendor->spks()->count(),
            'completed_spks' => $vendor->completedSpks()->count(),
            'pending_spks' => $vendor->spks()->whereIn('status', ['draft', 'sent', 'accepted'])->count(),
            'in_progress_spks' => $vendor->spks()->where('status', 'repairing')->count(),
            'total_earnings' => $vendor->spks()->where('status', 'completed')->sum('total_cost'),
            'average_rating' => $vendor->rating,
        ];

        return response()->json($stats);
    }
}
