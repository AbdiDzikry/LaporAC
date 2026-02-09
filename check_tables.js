const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wzhdlsljrjvashslanyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6aGRsc2xqcmp2YXNoc2xhbnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NzMxOTYsImV4cCI6MjA4NTI0OTE5Nn0.0GoPypRAlm1Z-AyiI_LoiN9yKv-5P08Vg4ZIISH9fN0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log('Checking database tables...\n');

    // Try to query assets table
    const { data: assets, error: assetsError } = await supabase
        .from('assets')
        .select('*')
        .limit(1);

    if (assetsError) {
        console.log('❌ assets table:', assetsError.message);
    } else {
        console.log('✅ assets table exists, sample:', assets);
    }

    // Try to query maintenance_schedules table
    const { data: schedules, error: schedulesError } = await supabase
        .from('maintenance_schedules')
        .select('*')
        .limit(1);

    if (schedulesError) {
        console.log('❌ maintenance_schedules table:', schedulesError.message);
    } else {
        console.log('✅ maintenance_schedules table exists, sample:', schedules);
    }
}

checkTables().catch(console.error);
