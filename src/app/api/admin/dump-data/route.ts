import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        const { data, error } = await supabase
            .from("care_sessions")
            .select(`
                *,
                care_category:care_categories(label),
                store_sku:store_skus(*)
            `)
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Return pretty-printed JSON
        return new NextResponse(JSON.stringify(data, null, 2), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="care_sessions_dump_${new Date().toISOString().split('T')[0]}.json"`
            }
        });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
