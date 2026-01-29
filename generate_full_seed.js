const fs = require('fs');
const path = require('path');

const csvPath = '26 Jadwal AC.csv';
const outPath = 'seed_full_data.sql';

try {
    const data = fs.readFileSync(csvPath, 'utf8');
    const lines = data.split(/\r?\n/);

    let sql = `-- FULL SEED DATA GENERATED FROM CSV\n\n`;
    sql += `BEGIN;\n\n`;

    // 1. Prepare Asset Insertions
    sql += `-- 1. INSERT ASSETS\n`;
    sql += `INSERT INTO public.assets (name, sku, location, pk, brand, status) VALUES\n`;

    const assets = [];
    const schedules = [];

    lines.forEach(line => {
        // Basic filter for data rows: must start with a number and semicolon
        // Regex: Number at start, semicolon, then some text
        if (!/^\d+;/.test(line)) return;

        const cols = line.split(';');
        if (cols.length < 5) return;

        // Columns based on CSV structure:
        // 0: No
        // 1: Ruangan / Lokasi
        // 2: No AC (SKU)
        // 3: Jenis
        // 4: PK
        // 5-35: Days 1-31

        const no = cols[0].trim();
        const location = cols[1].trim();
        const sku = cols[2].trim();
        const type = cols[3].trim(); // Use as brand/type hint
        const pk = cols[4].trim();

        if (!sku) return;

        // Escape single quotes for SQL
        const safeName = `AC ${location} ${sku}`.replace(/'/g, "''");
        const safeLoc = location.replace(/'/g, "''");
        const safeSku = sku.replace(/'/g, "''");
        const safePk = pk.replace(/'/g, "''");
        const safeBrand = type.replace(/'/g, "''") || 'Unknown';

        assets.push(`('${safeName}', '${safeSku}', '${safeLoc}', '${safePk}', '${safeBrand}', 'good')`);

        // Check for Schedules (Cols 5 to 35)
        // Col 5 = Day 1, Col 6 = Day 2... Col 35 = Day 31
        for (let day = 1; day <= 31; day++) {
            const colIndex = 4 + day; // 5 is day 1
            if (cols[colIndex] && cols[colIndex].toLowerCase().includes('v')) {
                // Found a schedule
                const dateStr = `2026-01-${day.toString().padStart(2, '0')}`;
                // We use a subquery for ID to ensure we get the right asset
                schedules.push(`((SELECT id FROM public.assets WHERE sku = '${safeSku}'), '${dateStr}', 'pending')`);
            }
        }
    });

    if (assets.length > 0) {
        sql += assets.join(',\n');
        sql += `\nON CONFLICT (sku) DO UPDATE SET 
            location = EXCLUDED.location, 
            pk = EXCLUDED.pk, 
            brand = EXCLUDED.brand;\n\n`;
    }

    // 2. Prepare Schedule Insertions
    if (schedules.length > 0) {
        sql += `-- 2. INSERT SCHEDULES\n`;
        sql += `INSERT INTO public.maintenance_schedules (asset_id, scheduled_date, status) VALUES\n`;
        sql += schedules.join(',\n');
        sql += `;\n`;
    }

    sql += `\nCOMMIT;\n`;

    fs.writeFileSync(outPath, sql);
    console.log(`Successfully generated ${outPath} with ${assets.length} assets and ${schedules.length} schedules.`);

} catch (err) {
    console.error('Error processing CSV:', err);
}
