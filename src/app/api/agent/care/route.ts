import { NextRequest, NextResponse } from "next/server";
import { generateCareNarrative } from "@/lib/agent";
import { getPlantById } from "@/lib/data";
import { getWeatherData } from "@/lib/weather";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { plantId, plantName, zip } = body;

        if (!plantId || !zip) {
            return NextResponse.json({ error: "Missing plantId or zip" }, { status: 400 });
        }

        // 1. Get Plant Data
        let plant = getPlantById(plantId);

        // Fallback for custom/unknown plants (e.g. from receipt scan that aren't in static DB yet)
        if (!plant && plantName) {
            console.log(`[API] Plant ID ${plantId} not found, using fallback name: ${plantName}`);
            plant = {
                id: plantId,
                name: plantName,
                botanicalName: "Unknown",
                careSchedule: [], // No schedule needed for Agent to generate narrative via PDF
                troubleshooting: []
            };
        }

        if (!plant) {
            return NextResponse.json({ error: `Plant not found: ${plantId}` }, { status: 404 });
        }

        // 2. Get Weather Data (Direct function call instead of HTTP fetch)
        const weather = await getWeatherData(zip);

        // 3. Generate Narrative (Structured)
        const agentResponse = await generateCareNarrative(plant, weather);

        return NextResponse.json(agentResponse);

    } catch (error: any) {
        console.error("[API] Care Agent Error:", error);
        // Return detailed error for debugging
        return NextResponse.json({
            error: error.message || "Failed to generate narrative",
            details: error.toString()
        }, { status: 500 });
    }
}
