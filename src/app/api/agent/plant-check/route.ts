
import { NextRequest, NextResponse } from "next/server";
import { getWeatherData } from "@/lib/weather";
import OpenAI from "openai";
import { Plant } from "@/lib/types";

// Define response structure
interface PlantCheckResponse {
    safe: boolean;
    message: string;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { plants, zip } = body;

        if (!plants || !zip || plants.length === 0) {
            return NextResponse.json({ error: "Missing plants or zip" }, { status: 400 });
        }

        // 1. Get Weather
        const weather = await getWeatherData(zip);

        // 2. AI Analysis
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const plantNames = plants.map((p: Plant) => p.name).join(", ");

        const systemPrompt = `
        You are an expert groundskeeper advising on PLANTING SAFETY.
        
        CONTEXT:
        Location: ${weather.city} (${zip})
        Current Weather: ${weather.condition}, ${weather.temp}°F
        Wind: ${weather.windSpeed} mph
        Alerts: ${weather.alerts.map(a => a.event).join(", ") || "None"}

        PLANTS TO PLANT: ${plantNames}

        TASK:
        Analyze if it is safe to plant these specfic plants in the ground RIGHT NOW based on the conditions.
        
        RULES:
        - HEAT: If temp > 85°F, it is generally RISKY/CAUTION for new transplants (heat stress).
        - COLD: If temp < 40°F, it is RISKY (frost shock).
        - EXTREME: If severe weather alerts exist (Freeze, Flood, Storm), it is UNSAFE.
        
        OUTPUT JSON:
        {
            "safe": boolean, // true if conditions are generally okay, false if risky
            "message": "A 1-sentence concise advice string. E.g. 'Green light! conditions are mild.' or '⚠️ Hold off! It is too hot (90°F) for new roots.'"
        }
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Is it safe?" }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1, // Low temp for strict safety
        });

        const result = JSON.parse(response.choices[0].message.content || "{}");

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Plant check failed:", error);
        return NextResponse.json({
            safe: true, // Default to safe to not block user, but warn
            message: "Unable to check weather right now. Use your best judgment."
        });
    }
}
