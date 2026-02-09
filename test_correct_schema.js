const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wzhdlsljrjvashslanyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6aGRsc2xqcmp2YXNoc2xhbnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NzMxOTYsImV4cCI6MjA4NTI0OTE5Nn0.0GoPypRAlm1Z-AyiI_LoiN9yKv-5P08Vg4ZIISH9fN0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsertCorrect() {
    console.log('Testing insert with correct schema...\n');

    const testAsset = {
        name: 'AC AUDITORIUM RA 999',
        location: 'AUDITORIUM',
        sku: 'RA 999',
        brand: 'SPLITE',
        pk: '2 PK',
        status: 'good',
        qr_code: 'RA999',
        purchase_date: '2024-01-01',
        last_maintenance_date: null,
        next_maintenance_date: '2026-01-16',
        maintenance_interval_days: 90,
        is_active: true,
        useful_life_years: 5,
        residual_value: 0,
        purchase_price: 0
    };

    console.log('Inserting:', testAsset);

    const { data, error } = await supabase
        .from('assets')
        .insert([testAsset])
        .select();

    if (error) {
        console.log('\n❌ Insert failed:', error);
    } else {
        console.log('\n✅ Insert successful!');
        console.log('Inserted data:', data);

        // Delete test data
        console.log('\nCleaning up test data...');
        await supabase.from('assets').delete().eq('sku', 'RA 999');
        console.log('✅ Test data cleaned up');
    }
}

testInsertCorrect().catch(console.error);
