<?php
use App\Models\MenuPermission;
use App\Models\Role;

$roles = Role::whereIn('name', ['admin', 'super_admin'])->get();

if ($roles->isEmpty()) {
    echo "Roles admin/super_admin not found!\n";
} else {
    foreach ($roles as $role) {
        $menu = MenuPermission::updateOrCreate(
            [
                'role_id' => $role->id,
                'menu_route' => '/admin/vendors'
            ],
            [
                'menu_label' => 'Manajemen Vendor',
                'menu_icon' => 'truck',
                'sort_order' => 12,
                'is_visible' => true,
                'is_active' => true,
            ]
        );
        echo "Granted /admin/vendors permission to role: {$role->name} (ID: {$role->id})\n";
    }
}
