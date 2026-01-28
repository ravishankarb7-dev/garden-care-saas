require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(url, key);

async function check() {
    console.log("Checking for 'is_planted' column...");
    const { data, error } = await supabase
        .from('care_sessions')
        .select('is_planted')
        .limit(1);

    if (error) {
        console.error("Error (Column likely missing):", error.message);
        process.exit(1);
    } else {
        console.log("Success: Column exists. Data:", data);
        process.exit(0);
    }
}

check();
