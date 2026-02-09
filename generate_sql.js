const fs = require('fs');

// Parse CSV
function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    const assets = [];
    const schedules = [];

    for (const line of lines) {
        // Skip headers, empty lines, and separator lines
        if (!line.trim() ||
            line.includes('NO;RUANGAN') ||
            line.includes('DATA  SERVICE') ||
            line.includes('PT DHARMA') ||
            line.includes('NOTE') ||
            line.startsWith(';;;')) {
            continue;
        }

        const parts = line.split(';');

        // Must have at least: NO, LOCATION, SKU, TYPE, PK
        if (parts.length < 5) continue;

        const no = parts[0]?.trim();
        const location = parts[1]?.trim();
        const sku = parts[2]?.trim();
        const type = parts[3]?.trim() || 'CHILLER'; // Default for AICOOL units
        const pk = parts[4]?.trim();

        // Skip if missing critical data (but allow empty type)
        if (!no || !location || !sku || !pk) continue;

        // Find maintenance date (marked with 'v')
        let maintenanceDay = null;
        for (let i = 5; i < parts.length; i++) {
            if (parts[i]?.includes('v')) {
                maintenanceDay = i - 4; // Column 5 = Day 1
                break;
            }
        }

        assets.push({
            name: `AC ${location} ${sku}`,
            location: location,
            sku: sku,
            brand: type,
            pk: pk,
            maintenanceDay: maintenanceDay
        });

        if (maintenanceDay) {
            schedules.push({
                sku: sku,
                scheduled_date: `2026-01-${String(maintenanceDay).padStart(2, '0')}`
            });
        }
    }

    return { assets, schedules };
}

// Generate SQL
function generateSQL() {
    const { assets, schedules } = parseCSV('logtanya.txt');

    let sql = `-- ============================================================
-- AC DATA IMPORT SQL SCRIPT
-- PT Dharma Polimetal Tbk - January 2026 Schedule
-- Total AC Units: ${assets.length}
-- Total Schedules: ${schedules.length}
-- Generated: ${new Date().toISOString()}
-- ============================================================

-- Step 1: Delete existing data
-- ============================================================

-- Delete existing tickets (foreign key to assets)
DELETE FROM tickets;

-- Delete existing maintenance schedules
DELETE FROM maintenance_schedules;

-- Delete existing assets
DELETE FROM assets;


-- Step 2: Insert AC Assets
-- ============================================================

INSERT INTO assets (
  name,
  location,
  sku,
  brand,
  pk,
  status,
  purchase_date,
  last_maintenance_date,
  next_maintenance_date,
  maintenance_interval_days,
  is_active,
  useful_life_years,
  residual_value,
  purchase_price
) VALUES
`;

    // Generate INSERT values for assets
    const assetValues = assets.map((a, i) => {
        const name = a.name.replace(/'/g, "''");
        const location = a.location.replace(/'/g, "''");
        const sku = a.sku.replace(/'/g, "''");
        const brand = a.brand.replace(/'/g, "''");
        const pk = a.pk.replace(/'/g, "''");
        const nextMaintenance = a.maintenanceDay ? `'2026-01-${String(a.maintenanceDay).padStart(2, '0')}'` : 'NULL';

        return `  ('${name}', '${location}', '${sku}', '${brand}', '${pk}', 'good', '2024-01-01', NULL, ${nextMaintenance}, 90, true, 5, 0, 0)`;
    });

    sql += assetValues.join(',\n');
    sql += ';\n\n';

    // Generate INSERT for schedules
    sql += `-- Step 3: Insert Maintenance Schedules
-- ============================================================

INSERT INTO maintenance_schedules (
  asset_id,
  scheduled_date,
  status,
  notes
)
SELECT 
  a.id,
  s.scheduled_date::date,
  'scheduled',
  'Imported from CSV - January 2026 Schedule'
FROM (VALUES
`;

    // Generate schedule values
    const scheduleValues = schedules.map((s, i) => {
        const sku = s.sku.replace(/'/g, "''");
        return `  ('${sku}', '${s.scheduled_date}')`;
    });

    sql += scheduleValues.join(',\n');
    sql += `
) AS s(sku, scheduled_date)
JOIN assets a ON a.sku = s.sku;


-- Step 4: Verification Queries
-- ============================================================

-- Check total assets
SELECT COUNT(*) AS total_assets FROM assets;
-- Expected: ${assets.length}

-- Check total schedules
SELECT COUNT(*) AS total_schedules FROM maintenance_schedules WHERE status = 'scheduled';
-- Expected: ${schedules.length}

-- Check schedule distribution by date
SELECT 
  scheduled_date,
  COUNT(*) AS ac_count
FROM maintenance_schedules
WHERE status = 'scheduled'
GROUP BY scheduled_date
ORDER BY scheduled_date;

-- Sample assets
SELECT id, name, sku, brand, pk, location, next_maintenance_date
FROM assets
ORDER BY sku
LIMIT 10;

-- ============================================================
-- END OF SCRIPT
-- ============================================================
`;

    return sql;
}

// Main
const sql = generateSQL();
fs.writeFileSync('import_ac_data.sql', sql, 'utf-8');

console.log('✅ SQL script generated: import_ac_data.sql');
console.log('\n📋 Next steps:');
console.log('1. Open Supabase Dashboard');
console.log('2. Go to SQL Editor');
console.log('3. Copy and paste the content of import_ac_data.sql');
console.log('4. Run the script');
console.log('5. Check verification queries at the end');
