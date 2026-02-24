const fs = require('fs');
const path = require('path');

const csvPath = 'c:/5. Magang Dharma/4. LaporAC/26 Jadwal AC.csv';
const content = fs.readFileSync(csvPath, 'utf8');

const lines = content.split('\n');

let parsedRows = [];
for (const line of lines) {
    const parts = line.split(';');
    const no = parts[0]?.trim();

    if (no && !isNaN(parseInt(no))) {
        const id = parseInt(no);
        const location = parts[1]?.trim() || '';
        const sku = parts[2]?.trim() || '';
        const type = parts[3]?.trim() || '';
        const pk = parts[4]?.trim() || '';

        let scheduledDay = null;
        for (let i = 5; i <= 35; i++) {
            if (parts[i] && parts[i].trim().toLowerCase() === 'v') {
                scheduledDay = i - 4; // Because day 1 is at index 5
                break;
            }
        }

        parsedRows.push({
            id, location, sku, type, pk, scheduledDay
        });
    }
}

let usedSkus = new Set();
let assetsCode = '        // 3. Assets\n        $assets = [];\n';
let schedulesCode = '        // 6. Maintenance Schedules\n';

parsedRows.forEach((row, index) => {
    let finalSku = row.sku || `UNKNOWN-${index}`;
    if (usedSkus.has(finalSku)) {
        let counter = 1;
        while (usedSkus.has(`${finalSku}-${counter}`)) {
            counter++;
        }
        finalSku = `${finalSku}-${counter}`;
    }
    usedSkus.add(finalSku);

    assetsCode += `        $assets[] = Asset::create([
            'name' => 'AC ${row.type} ${row.pk} - ${finalSku}',
            'sku' => '${finalSku}',
            'location' => '${row.location}',
            'brand' => 'Unknown',
            'category' => 'Air Conditioner',
            'maintenance_interval_days' => 30,
            'status' => 'active',
        ]);\n`;

    if (row.scheduledDay) {
        let dayStr = row.scheduledDay.toString().padStart(2, '0');
        schedulesCode += `        MaintenanceSchedule::create([
            'asset_id' => $assets[${index}]->id,
            'scheduled_date' => '2026-01-${dayStr}',
            'status' => 'scheduled',
            'period_id' => $period1->id,
        ]);\n`;
    }
});

let finalCode = `<?php

namespace Database\\Seeders;

use App\\Models\\User;
use App\\Models\\Role;
use App\\Models\\Permission;
use App\\Models\\Asset;
use App\\Models\\MaintenancePeriod;
use App\\Models\\Ticket;
use App\\Models\\MaintenanceSchedule;
use Illuminate\\Database\\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Roles & Permissions
        $adminRole = Role::create(['name' => 'admin', 'description' => 'Administrator System']);
        $techRole = Role::create(['name' => 'technician', 'description' => 'Field Technician']);

        $perm1 = Permission::create(['code' => 'manage_users', 'description' => 'Can manage users']);
        $perm2 = Permission::create(['code' => 'manage_assets', 'description' => 'Can manage assets']);

        $adminRole->permissions()->attach([$perm1->id, $perm2->id]);

        // 2. Users
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin123',
            'password' => bcrypt('admin123'),
            'nik' => 'ADMIN001',
            'role' => 'admin',
        ]);

        $tech = User::create([
            'name' => 'Technician User',
            'email' => 'tech@dharma.com',
            'password' => bcrypt('password123'),
            'nik' => 'TECH001',
            'role' => 'technician',
        ]);

${assetsCode}

        // 4. Periods
        $period1 = MaintenancePeriod::create(['name' => 'Januari 2026', 'month' => 1, 'year' => 2026, 'status' => 'completed']);
        $period2 = MaintenancePeriod::create(['name' => 'Februari 2026', 'month' => 2, 'year' => 2026, 'status' => 'active']);

        // 5. Tickets
        $ticket1 = Ticket::create([
            'title' => 'AC Kurang Dingin',
            'description' => 'AC di ruang meeting kurang dingin.',
            'status' => 'open',
            'issue_category' => 'repair',
            'priority' => 'high',
            'asset_id' => $assets[0]->id,
            'reporter_name' => 'Budi',
            'assigned_technician_id' => $tech->id,
            'assigned_technician_name' => $tech->name,
        ]);

${schedulesCode}

        $this->command->info('Dummy and Real data seeded successfully! Login with admin123 / admin123');
    }
}
`;

fs.writeFileSync('c:/5. Magang Dharma/4. LaporAC/backend/database/seeders/DatabaseSeeder.php', finalCode);
console.log('Seeder generated successfully.');
