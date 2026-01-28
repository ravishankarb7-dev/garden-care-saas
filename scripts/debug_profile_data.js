require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugSessions() {
    console.log("Fetching sessions...");
    const { data: sessions, error } = await supabase
        .from('care_sessions')
        .select(`
            id,
            planted_at,
            care_category:care_categories(label),
            store_sku:store_skus(display_name, sku)
        `)
        .order('planted_at', { ascending: false });

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log(`Found ${sessions.length} sessions.`);
    sessions.forEach(s => {
        const catName = s.care_category?.label;
        const skuName = s.store_sku?.display_name;
        const date = s.planted_at;
        console.log(`[${s.id}] Date: ${date} | Cat: ${catName} | SKU: ${skuName}`);
    });
}

debugSessions();
