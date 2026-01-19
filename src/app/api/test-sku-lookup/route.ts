
import { NextResponse } from "next/server";
import { getPlants, getPlantById } from "@/lib/queries";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        const plants = await getPlants();
        const skuPlant = plants.find(p => p.id !== 'vegetable-starts' && p.name.toLowerCase().includes("tomato"));

        if (!skuPlant) {
            return NextResponse.json({ error: "No Tomato SKU found in DB checks." });
        }

        const id = skuPlant.id;

        // Try simpler query
        const { data: rawSku, error: rawError } = await supabase
            .from('store_skus')
            .select(`*`)
            .eq('sku', id); // Try exact match on 'sku' column

        const resolved = await getPlantById(id);

        return NextResponse.json({
            status: "Success",
            testSku: id,
            // Force boolean checks
            foundRawSku: !!rawSku && rawSku.length > 0,
            rawSkuCount: rawSku ? rawSku.length : 0,
            firstRawSku: rawSku && rawSku[0] ? rawSku[0] : "null",
            rawErrorMsg: rawError ? rawError.message : "null",
            resolvedHelper: resolved ? "FOUND" : "UNDEFINED",
            resolvedData: resolved || "null"
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
