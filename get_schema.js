const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wzhdlsljrjvashslanyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6aGRsc2xqcmp2YXNoc2xhbnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NzMxOTYsImV4cCI6MjA4NTI0OTE5Nn0.0GoPypRAlm1Z-AyiI_LoiN9yKv-5P08Vg4ZIISH9fN0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function getSchema() {
    console.log('Fetching existing asset to see schema...\n');

    const { data, error } = await supabase
        .from('assets')
        .select('*')
        .limit(1);

    if (error) {
        console.log('❌ Error:', error);
    } else if (data && data.length > 0) {
        console.log('✅ Asset columns:', Object.keys(data[0]));
        console.log('\nSample asset:');
        console.log(JSON.stringify(data[0], null, 2));
    } else {
        console.log('⚠️  No assets found in database');
    }
}

getSchema().catch(console.error);
