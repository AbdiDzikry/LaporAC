<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MenuPermission;
use App\Models\Role;

class MenuPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define all available menus
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
            ['route' => '/admin/berita-acara', 'label' => 'Berita Acara', 'icon' => 'berita-acara'],
            ['route' => '/admin/vendors', 'label' => 'Manajemen Vendor', 'icon' => 'vendors'],
        ];

        // Get roles or create them if they don't exist
        $roles = [
            'super_admin' => null,
            'admin' => null,
            'section_head' => null,
            'technician' => null,
            'vendor' => null,
            'staff' => null,
        ];

        foreach ($roles as $roleName => $roleId) {
            $role = Role::firstOrCreate(
                ['name' => $roleName],
                ['description' => $this->getRoleDescription($roleName)]
            );
            $roles[$roleName] = $role->id;
        }

        // Super Admin - All menus
        $this->createPermissions($roles['super_admin'], $menus, true);

        // Admin - Most menus (now including vendor management)
        $this->createPermissions($roles['admin'], $menus, true);

        // Technician - Limited access
        $technicianMenus = array_filter($menus, fn($m) => in_array($m['route'], [
            '/dashboard',
            '/admin/analytics',
            '/admin/assets',
            '/admin/tickets',
            '/admin/history',
        ]));
        $this->createPermissions($roles['technician'], $technicianMenus, true);

        // Vendor - Only SPK/Tickets
        $vendorMenus = array_filter($menus, fn($m) => in_array($m['route'], [
            '/dashboard',
            '/admin/tickets', // For SPK
        ]));
        $this->createPermissions($roles['vendor'], $vendorMenus, true);

        // Section Head - SPK approval + Berita Acara
        $sectionHeadMenus = array_filter($menus, fn($m) => in_array($m['route'], [
            '/dashboard',
            '/admin/spk',
            '/admin/berita-acara',
            '/admin/tickets',
            '/admin/history',
        ]));
        $this->createPermissions($roles['section_head'], $sectionHeadMenus, true);

        // Staff - Only report form (no admin access)
        // No menu permissions needed as staff uses public report form
    }

    private function createPermissions(int $roleId, array $menus, bool $isActive): void
    {
        foreach ($menus as $index => $menu) {
            MenuPermission::firstOrCreate(
                [
                    'role_id' => $roleId,
                    'menu_route' => $menu['route'],
                ],
                [
                    'menu_label' => $menu['label'],
                    'menu_icon' => $menu['icon'],
                    'sort_order' => $index,
                    'is_visible' => true,
                    'is_active' => $isActive,
                ]
            );
        }
    }

    private function getRoleDescription(string $roleName): string
    {
        $descriptions = [
            'super_admin' => 'Full system access with all permissions',
            'admin' => 'Administrative access for daily operations',
            'technician' => 'Technical staff for maintenance and repairs',
            'vendor' => 'External vendor for specialized repairs',
            'staff' => 'Regular staff with reporting access only',
        ];

        return $descriptions[$roleName] ?? '';
    }
}
