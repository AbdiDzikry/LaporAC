const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wzhdlsljrjvashslanyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6aGRsc2xqcmp2YXNoc2xhbnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NzMxOTYsImV4cCI6MjA4NTI0OTE5Nn0.0GoPypRAlm1Z-AyiI_LoiN9yKv-5P08Vg4ZIISH9fN0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    console.log('Testing single asset insert...\n');

    const testAsset = {
        name: 'TEST AC AUDITORIUM RA 001',
        location: 'AUDITORIUM',
        sku: 'TEST-001',
        type: 'Split',
        capacity: '2 PK',
        status: 'active',
        qr_code: 'TEST001',
        installation_date: '2024-01-01',
        next_maintenance: '2026-01-16'
    };

    const { data, error } = await supabase
        .from('assets')
        .insert([testAsset])
        .select();

    if (error) {
        console.log('❌ Insert failed:', error);
    } else {
        console.log('✅ Insert successful:', data);

        // Delete test data
        await supabase.from('assets').delete().eq('sku', 'TEST-001');
        console.log('✅ Test data cleaned up');
    }
}

testInsert().catch(console.error);
