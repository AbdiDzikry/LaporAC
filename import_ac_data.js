const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Supabase config
const supabaseUrl = 'https://wzhdlsljrjvashslanyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6aGRsc2xqcmp2YXNoc2xhbnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NzMxOTYsImV4cCI6MjA4NTI0OTE5Nn0.0GoPypRAlm1Z-AyiI_LoiN9yKv-5P08Vg4ZIISH9fN0';
const supabase = createClient(supabaseUrl, supabaseKey);

// Parse CSV
function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    const assets = [];
    const schedules = [];

    console.log(`Total lines: ${lines.length}`);

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
        const type = parts[3]?.trim();
        const pk = parts[4]?.trim();

        // Skip if missing critical data
        if (!no || !location || !sku || !type || !pk) continue;

        // Find maintenance date (marked with 'v')
        let maintenanceDay = null;
        for (let i = 5; i < parts.length; i++) {
            if (parts[i]?.includes('v')) {
                maintenanceDay = i - 4; // Column 5 = Day 1
                break;
            }
        }

        // Map type names
        let mappedType = type;
        if (type.toUpperCase() === 'SPLITE') mappedType = 'Split';
        else if (type.toUpperCase() === 'CASSET') mappedType = 'Cassette';

        // Create asset object matching actual database schema
        const asset = {
            name: `AC ${location} ${sku}`,
            location: location,
            sku: sku,
            brand: type,  // Use 'brand' column, not 'type'
            pk: pk,       // Use 'pk' column, not 'capacity'
            status: 'good',
            qr_code: sku.replace(/\s/g, ''),
            purchase_date: '2024-01-01',
            last_maintenance_date: null,
            next_maintenance_date: maintenanceDay ? `2026-01-${String(maintenanceDay).padStart(2, '0')}` : null,
            maintenance_interval_days: 90,
            is_active: true,
            useful_life_years: 5,
            residual_value: 0,
            purchase_price: 0
        };

        assets.push(asset);

        // Create schedule object
        if (maintenanceDay) {
            schedules.push({
                sku: sku,
                scheduled_date: `2026-01-${String(maintenanceDay).padStart(2, '0')}`,
                status: 'scheduled',
                notes: 'Imported from CSV - January 2026 Schedule'
            });
        }
    }

    return { assets, schedules };
}

// Insert assets
async function insertAssets(assets) {
    console.log(`\nInserting ${assets.length} assets...`);

    // Insert in batches of 50
    const batchSize = 50;
    const insertedAssets = [];

    for (let i = 0; i < assets.length; i += batchSize) {
        const batch = assets.slice(i, i + batchSize);
        console.log(`  Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} assets`);

        const { data, error } = await supabase
            .from('assets')
            .upsert(batch, { onConflict: 'sku' })
            .select();

        if (error) {
            console.error(`  ❌ Error in batch ${Math.floor(i / batchSize) + 1}:`, error);
            throw error;
        }

        insertedAssets.push(...data);
        console.log(`  ✅ Inserted ${data.length} assets`);
    }

    return insertedAssets;
}

// Insert schedules
async function insertSchedules(schedules, assetMap) {
    console.log(`\nInserting ${schedules.length} schedules...`);

    const schedulesWithIds = schedules.map(s => ({
        asset_id: assetMap[s.sku],
        scheduled_date: s.scheduled_date,
        status: s.status,
        notes: s.notes
    })).filter(s => s.asset_id); // Only include if asset_id exists

    console.log(`  Valid schedules with asset IDs: ${schedulesWithIds.length}`);

    // Insert in batches
    const batchSize = 50;
    const insertedSchedules = [];

    for (let i = 0; i < schedulesWithIds.length; i += batchSize) {
        const batch = schedulesWithIds.slice(i, i + batchSize);
        console.log(`  Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} schedules`);

        const { data, error } = await supabase
            .from('maintenance_schedules')
            .insert(batch)
            .select();

        if (error) {
            console.error(`  ❌ Error in batch ${Math.floor(i / batchSize) + 1}:`, error);
            throw error;
        }

        insertedSchedules.push(...data);
        console.log(`  ✅ Inserted ${data.length} schedules`);
    }

    return insertedSchedules;
}

// Main
async function main() {
    console.log('='.repeat(60));
    console.log('AC DATA IMPORT SCRIPT');
    console.log('PT Dharma Polimetal - January 2026 Schedule');
    console.log('='.repeat(60));

    console.log('\n📄 Parsing CSV from logtanya.txt...');
    const { assets, schedules } = parseCSV('logtanya.txt');

    console.log(`\n📊 Parsed Data Summary:`);
    console.log(`  - AC Units: ${assets.length}`);
    console.log(`  - Maintenance Schedules: ${schedules.length}`);

    // Show sample
    console.log(`\n📋 Sample AC (first 3):`);
    assets.slice(0, 3).forEach((a, i) => {
        console.log(`  ${i + 1}. ${a.name} (${a.sku}) - ${a.brand} ${a.pk}`);
        console.log(`     Location: ${a.location}, Next: ${a.next_maintenance_date}`);
    });

    console.log(`\n🚀 Starting database import...`);

    try {
        // Insert assets
        const insertedAssets = await insertAssets(assets);

        // Create SKU -> ID map
        const assetMap = {};
        insertedAssets.forEach(a => {
            assetMap[a.sku] = a.id;
        });

        console.log(`\n🗺️  Created asset map: ${Object.keys(assetMap).length} entries`);

        // Insert schedules
        const insertedSchedules = await insertSchedules(schedules, assetMap);

        console.log('\n' + '='.repeat(60));
        console.log('✅ IMPORT COMPLETE!');
        console.log('='.repeat(60));
        console.log(`📊 Final Results:`);
        console.log(`  - Assets inserted: ${insertedAssets.length}`);
        console.log(`  - Schedules inserted: ${insertedSchedules.length}`);
        console.log(`\n💡 Next steps:`);
        console.log(`  1. Open http://localhost:4200/admin/assets`);
        console.log(`  2. Verify ${insertedAssets.length} AC units are visible`);
        console.log(`  3. Open http://localhost:4200/admin/maintenance/list`);
        console.log(`  4. Check calendar view for January 2026 schedules`);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ Import failed:', error);
        process.exit(1);
    }
}

main().catch(console.error);
