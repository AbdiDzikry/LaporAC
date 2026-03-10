<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuPermission;
use App\Models\Role;
use Illuminate\Http\Request;

class MenuPermissionController extends Controller
{
    /**
     * Display a listing of menu permissions for a role
     */
    public function index($roleId)
    {
        $permissions = MenuPermission::where('role_id', $roleId)
            ->orderBy('sort_order')
            ->get();

        return response()->json($permissions);
    }

    /**
     * Get all available menu routes for configuration
     */
    public function availableMenus()
    {
        $menus = [
            ['route' => '/dashboard', 'label' => 'Dashboard', 'icon' => 'dashboard'],
            ['route' => '/admin/analytics', 'label' => 'Analitik', 'icon' => 'analytics'],
            ['route' => '/admin/assets', 'label' => 'Data Aset', 'icon' => 'assets'],
            ['route' => '/admin/maintenance', 'label' => 'Jadwal Maintenance', 'icon' => 'maintenance'],
            ['route' => '/admin/tickets', 'label' => 'Tiket Laporan', 'icon' => 'tickets'],
            ['route' => '/admin/history', 'label' => 'Histori & Laporan', 'icon' => 'history'],
            ['route' => '/admin/users', 'label' => 'Manajemen User', 'icon' => 'users'],
            ['route' => '/admin/users/roles', 'label' => 'Manajemen Roles', 'icon' => 'roles'],
            ['route' => '/admin/logs', 'label' => 'System Logs', 'icon' => 'logs'],
            ['route' => '/admin/configs', 'label' => 'Konfigurasi', 'icon' => 'configs'],
            ['route' => '/admin/pricelist', 'label' => 'Pricelist', 'icon' => 'pricelist'],
            ['route' => '/admin/spk', 'label' => 'Daftar SPK', 'icon' => 'spk'],
            ['route' => '/admin/vendors', 'label' => 'Manajemen Vendor', 'icon' => 'vendors'],
        ];

        return response()->json($menus);
    }

    /**
     * Store or update menu permissions for a role
     */
    public function update(Request $request, $roleId)
    {
        $role = Role::findOrFail($roleId);

        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*.menu_route' => 'required|string',
            'permissions.*.menu_label' => 'required|string',
            'permissions.*.menu_icon' => 'nullable|string',
            'permissions.*.is_visible' => 'boolean',
            'permissions.*.is_active' => 'boolean',
        ]);

        // Delete existing permissions for this role
        MenuPermission::where('role_id', $roleId)->delete();

        // Create new permissions
        $permissions = [];
        foreach ($validated['permissions'] as $index => $permData) {
            $perm = MenuPermission::create([
                'role_id' => $roleId,
                'menu_route' => $permData['menu_route'],
                'menu_label' => $permData['menu_label'],
                'menu_icon' => $permData['menu_icon'] ?? null,
                'sort_order' => $index,
                'is_visible' => $permData['is_visible'] ?? true,
                'is_active' => $permData['is_active'] ?? true,
            ]);
            $permissions[] = $perm;
        }

        return response()->json($permissions);
    }

    /**
     * Get menu permissions for current user's role
     */
    public function myMenus()
    {
        $user = auth()->user();
        $roleId = $user->role_id ?? null;

        // If user doesn't have role_id, try to get role by name
        if (!$roleId) {
            $role = Role::where('name', $user->role)->first();
            $roleId = $role?->id;
        }

        if (!$roleId) {
            return response()->json([]);
        }

        $permissions = MenuPermission::getMenuForRole($roleId);

        return response()->json($permissions);
    }

    /**
     * Check if user has access to a specific menu
     */
    public function checkAccess($menuRoute)
    {
        $user = auth()->user();
        $roleId = $user->role_id ?? null;

        if (!$roleId) {
            $role = Role::where('name', $user->role)->first();
            $roleId = $role?->id;
        }

        if (!$roleId) {
            return response()->json(['has_access' => false]);
        }

        // Super admin has access to everything
        if ($user->role === 'super_admin') {
            return response()->json(['has_access' => true]);
        }

        $hasAccess = MenuPermission::hasAccess($roleId, $menuRoute);

        return response()->json(['has_access' => $hasAccess]);
    }

    /**
     * Delete a specific menu permission
     */
    public function destroy($id)
    {
        $permission = MenuPermission::findOrFail($id);
        $permission->delete();

        return response()->json(null, 204);
    }
}
