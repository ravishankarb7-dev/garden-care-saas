import OpenAI from "openai";
import { Plant } from "./types";
import { WeatherData } from "./weather";
import { getCareGuideContent, getGlobalGuideContent } from "./pdf";

// Initialize OpenAI client
// Note: This must only be called server-side

// Define the structured response type
export interface AgentResponse {
    narrative: string;
    riskLevel: 'HIGH' | 'LOW' | 'NONE';
    action: 'POSTPONE' | 'PROCEED';
}

export async function generateCareNarrative(plant: Plant, weather: WeatherData): Promise<AgentResponse> {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // 1. Get Knowledge Base Layers
        const specificGuideText = await getCareGuideContent(plant.id, plant.name);
        const globalGuideText = await getGlobalGuideContent();

        // 2. Format Context
        const plantContext = `
            Plant Name: ${plant.name}
            Botanical Name: ${plant.botanicalName}
            Standard Schedule: ${JSON.stringify(plant.careSchedule)}
        `;

        const weatherContext = `
            Location: ${weather.city}
            Target Condition: ${weather.condition} (${weather.temp}°F)
            Wind: ${weather.windSpeed} mph
            Alerts: ${weather.alerts.length > 0 ? weather.alerts.map(a => a.event).join(", ") : "None"}
        `;

        // 3. Construct System Prompt
        const systemPrompt = `
        You are "Petals & Prickles," a pragmatic groundskeeper.
        
        KNOWLEDGE BASE:
        1. GLOBAL RULES: ${globalGuideText ? globalGuideText.slice(0, 1500) : "No Global Protocol."}
        2. PLANT RULES: ${specificGuideText ? specificGuideText.slice(0, 1500) : "No Specific Guide."}

        TASK:
        Analyze conditions for this plant. Return a JSON object:
        {
            "narrative": "A short, 2-sentence care note.",
            "riskLevel": "HIGH" | "LOW" | "NONE",
            "action": "POSTPONE" | "PROCEED" 
        }

        LOGIC:
        - If conditions are UNSAFE (Freeze, Heat Stress, Wrong Season), set "riskLevel": "HIGH" and "action": "POSTPONE".
        - Narrative should be direct: "It is too cold. Do not plant."
        - If SAFE, set "action": "PROCEED" and give care tips.
        `;

        // 4. Call LLM with JSON Mode
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: `Analyze:\nPLAINT: ${plantContext}\nWEATHER: ${weatherContext}`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.5,
            max_tokens: 150,
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("Empty response");

        return JSON.parse(content) as AgentResponse;

    } catch (error) {
        console.error("[Agent] Failed to generate narrative:", error);
        // Safe fallback
        return {
            narrative: "Nature is unpredictable. Check soil moisture manually.",
            riskLevel: "LOW",
            action: "PROCEED"
        };
    }
}
