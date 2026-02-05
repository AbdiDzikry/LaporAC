const fs = require('fs');

const jsonPath = 'maintenance_schedule_jan2026.json';
const outPath = 'seed_json_data.sql';

try {
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    // The file might contain just the JSON object or be a mix. 
    // Based on the user's input, it's likely a JSON file.
    const data = JSON.parse(rawData);

    let sql = `-- SEED DATA FROM JSON (JANUARY 2026)\n\n`;
    sql += `BEGIN;\n\n`;

    // 1. Prepare Asset Upserts
    sql += `-- 1. UPSERT ASSETS\n`;
    sql += `INSERT INTO public.assets (name, sku, location, pk, brand, status) VALUES\n`;

    const assets = [];
    const schedules = [];

    if (data.schedule && Array.isArray(data.schedule)) {
        data.schedule.forEach(item => {
            // "NO": "1", "RUANGAN_LOKASI": "AUDITORIUM", "NO_AC": "RA 001", "JENIS": "SPLITE", "PK": "2 PK", "JADWAL_SERVICE": [16]
            const sku = item.NO_AC;
            const location = item.RUANGAN_LOKASI;
            const type = item.JENIS;
            const pk = item.PK;
            const scheduleDays = item.JADWAL_SERVICE;

            if (!sku || sku === 'NO AC') return; // Skip header or invalid rows

            const safeName = `AC ${location} ${sku}`.replace(/'/g, "''");
            const safeLoc = location ? location.replace(/'/g, "''") : 'Unknown';
            const safeSku = sku.replace(/'/g, "''");
            const safePk = pk ? pk.replace(/'/g, "''") : '';
            const safeBrand = type ? type.replace(/'/g, "''") : 'Unknown';

            // We upsert assets to ensure they exist
            assets.push(`('${safeName}', '${safeSku}', '${safeLoc}', '${safePk}', '${safeBrand}', 'good')`);

            // Schedules
            if (Array.isArray(scheduleDays)) {
                scheduleDays.forEach(day => {
                    // JANUARI 2026
                    const dateStr = `2026-01-${day.toString().padStart(2, '0')}`;
                    // Use subquery for ID. Status 'scheduled' for initial load.
                    schedules.push(`((SELECT id FROM public.assets WHERE sku = '${safeSku}' LIMIT 1), '${dateStr}', 'scheduled')`);
                });
            }
        });
    }

    if (assets.length > 0) {
        sql += assets.join(',\n');
        sql += `\nON CONFLICT (sku) DO UPDATE SET 
            location = EXCLUDED.location, 
            pk = EXCLUDED.pk, 
            brand = EXCLUDED.brand;\n\n`;
    }

    // 2. Insert Schedules
    if (schedules.length > 0) {
        sql += `-- 2. INSERT SCHEDULES\n`;
        // Optional: Delete existing schedules for Jan 2026 to avoid duplicates if re-running without unique constraint
        // sql += `DELETE FROM public.maintenance_schedules WHERE scheduled_date >= '2026-01-01' AND scheduled_date <= '2026-01-31';\n`;
        // Update: Let's assume we want to purely append or explicit conflict? 
        // For safety, let's just Insert. If duplicates, we might want to clean up manually or assume DB handles it (no unique constraint on schedule yet?)
        // Let's safe guard by deleting Jan 2026 data first for these assets? No, that's risky.
        // Let's just insert.

        sql += `INSERT INTO public.maintenance_schedules (asset_id, scheduled_date, status) VALUES\n`;
        sql += schedules.join(',\n');
        sql += `;\n`;
    }

    sql += `\nCOMMIT;\n`;

    fs.writeFileSync(outPath, sql);
    console.log(`Generated ${outPath} with ${assets.length} assets and ${schedules.length} schedules.`);

} catch (err) {
    console.error('Error:', err);
}
