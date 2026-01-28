import { NextRequest, NextResponse } from "next/server";
import { generateCareNarrative } from "@/lib/agent";
import { getPlantById } from "@/lib/data";
import { getWeatherData } from "@/lib/weather";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { plantId, plantName, zip, isPlanted, weatherContext } = body;

        if (!plantId || !zip) {
            return NextResponse.json({ error: "Missing plantId or zip" }, { status: 400 });
        }

        // 1. Get Plant Data
        let plant: any = getPlantById(plantId);

        // Fallback for custom/unknown plants
        if (!plant && plantName) {
            console.log(`[API] Plant ID ${plantId} not found, using fallback name: ${plantName}`);
            plant = {
                id: plantId,
                name: plantName,
                botanicalName: "Unknown",
                careSchedule: [],
                troubleshooting: []
            };
        }

        if (!plant) {
            return NextResponse.json({ error: `Plant not found: ${plantId}` }, { status: 404 });
        }

        // Add context
        plant.isPlanted = !!isPlanted;

        // 2. Get Weather Data
        // 2. Get Weather Data
        const weather = await getWeatherData(zip);

        // 3. Get Recent Care Logs (Context Injection)
        const { getCareLogs } = await import("@/lib/queries");
        const logs = await getCareLogs(plantId);

        // Format logs for agent consumption
        const cleanLogs = logs.map((l: any) => ({
            date: l.log_date,
            action: l.action_type,
            status: l.status,
            note: l.note
        }));

        // 4. Generate Narrative
        const agentResponse = await generateCareNarrative(plant, weather, weatherContext, cleanLogs);

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
