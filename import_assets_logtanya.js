const fs = require('fs');
const path = require('path');

const inputFile = 'logtanya.txt';
const outputFile = 'SEED_ASSETS_FULL.sql';

try {
    const rawData = fs.readFileSync(inputFile, 'utf8');
    const lines = rawData.split(/\r?\n/);

    let sql = `-- SEED FULL ASSETS FROM LOGTANYA.TXT\n`;
    sql += `-- Generated on ${new Date().toISOString()}\n\n`;
    sql += `BEGIN;\n\n`;
    sql += `-- UPSERT ASSETS (Insert new, update existing)\n`;
    sql += `INSERT INTO public.assets (name, sku, location, pk, brand, status) VALUES\n`;

    const values = [];
    const skipped = [];
    const seenSkus = new Set();

    lines.forEach((line, index) => {
        // Skip empty lines or headers
        if (!line.trim() || line.includes('PT DHARMA POLIMETAL') || line.includes('DATA  SERVICE') || line.includes('RUANGAN / LOKASI')) {
            return;
        }

        // Structure seems to be: NO <tab> LOCATION <tab> SKU <tab> TYPE <tab> PK ...
        // Using strict tab splitting might be safer if the file is truly tab-separated.
        // Let's try splitting by tab first.
        const parts = line.split('\t').map(p => p.trim());

        // We expect at least 5 parts for a valid asset row:
        // 0: NO (e.g., "1")
        // 1: LOCATION (e.g., "AUDITORIUM")
        // 2: SKU (e.g., "RA 001")
        // 3: TYPE (e.g., "SPLITE")
        // 4: PK (e.g., "2 PK")

        if (parts.length < 5) {
            // Try to rescue lines that might use spaces instead of tabs or have empty columns
            // But looking at the file, it seems consistently tab-separated or fixed width.
            // Let's log skipped lines to be sure.
            if (line.trim().length > 0) skipped.push(`Line ${index + 1}: ${line}`);
            return;
        }

        const no = parts[0];
        const location = parts[1];
        const sku = parts[2];
        const type = parts[3];
        const pk = parts[4];

        // Basic validation
        if (!sku || sku === 'NO AC' || !/^[A-Z0-9\s]+$/i.test(sku)) {
            // Skip if SKU is invalid or header
            return;
        }

        // Check if it's a "GEDUNG" header line
        if (line.trim().startsWith('GEDUNG') || line.trim().startsWith('RUANG BAWAH') || line.trim().startsWith('TOTAL')) {
            return;
        }

        // Clean up data
        const safeSku = sku.replace(/\s+/g, '').toUpperCase(); // Normalize SKU (remove spaces) -> actually, existing data might have spaces. Let's keep original format if possible, or normalize? 
        // NOTE: The previous script used `sku` directly.
        // Line 8: "RA 001". Line 55: "RA048".
        // To avoid duplicates if "RA 001" and "RA001" are the same, we should probably normalize?
        // However, the `maintenance_schedules` table links by asset_id. If we change SKU, we might break links if we don't handle it.
        // The previous "generate_json_seed.js" kept the SKU as is: `const safeSku = sku.replace(/'/g, "''");`
        // So "RA 001" became "RA 001".
        // Let's stick to the file's SKU to be safe and match existing data.

        const dbSku = sku.replace(/'/g, "''");

        if (seenSkus.has(dbSku)) {
            console.warn(`Duplicate SKU found in file: ${dbSku} (Line ${index + 1})`);
            return;
        }
        seenSkus.add(dbSku);

        const name = `AC ${location} ${sku}`.replace(/'/g, "''");
        const safeLoc = location.replace(/'/g, "''");
        const safeType = type.replace(/'/g, "''"); // Brand/Type
        const safePk = pk.replace(/'/g, "''");

        values.push(`('${name}', '${dbSku}', '${safeLoc}', '${safePk}', '${safeType}', 'good')`);
    });

    if (values.length > 0) {
        sql += values.join(',\n');
        sql += `\nON CONFLICT (sku) DO UPDATE SET 
    location = EXCLUDED.location, 
    pk = EXCLUDED.pk, 
    brand = EXCLUDED.brand,
    name = EXCLUDED.name;\n\n`;
    }

    sql += `COMMIT;\n`;

    fs.writeFileSync(outputFile, sql);
    console.log(`Generated ${outputFile} with ${values.length} assets.`);
    if (skipped.length > 0) {
        console.log(`Skipped ${skipped.length} lines (check if important):`);
        skipped.slice(0, 5).forEach(s => console.log(s));
    }

} catch (err) {
    console.error('Error:', err);
}
