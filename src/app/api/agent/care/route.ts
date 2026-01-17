import { NextRequest, NextResponse } from "next/server";
import { generateCareNarrative } from "@/lib/agent";
import { getPlantById } from "@/lib/data";
import { getWeatherData } from "@/lib/weather";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { plantId, zip } = body;

        if (!plantId || !zip) {
            return NextResponse.json({ error: "Missing plantId or zip" }, { status: 400 });
        }

        // 1. Get Plant Data
        const plant = getPlantById(plantId);
        if (!plant) {
            return NextResponse.json({ error: "Plant not found" }, { status: 404 });
        }

        // 2. Get Weather Data (Direct function call instead of HTTP fetch)
        const weather = await getWeatherData(zip);

        // 3. Generate Narrative
        const narrative = await generateCareNarrative(plant, weather);

        return NextResponse.json({ narrative });

    } catch (error: any) {
        console.error("[API] Care Agent Error:", error);
        // Return detailed error for debugging
        return NextResponse.json({
            error: error.message || "Failed to generate narrative",
            details: error.toString()
        }, { status: 500 });
    }
}
