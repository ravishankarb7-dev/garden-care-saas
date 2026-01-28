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
    tips?: {
        water: string;
        light: string;
        fertilizer: string;
    }
}

// Update signature to accept optional context and logs
export async function generateCareNarrative(
    plant: Plant & { isPlanted?: boolean },
    weather: WeatherData,
    weatherContext?: string,
    careLogs: any[] = [] // Default to empty array
): Promise<AgentResponse> {
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
            Do Not Release/Frost Sensitive: ${plant.frostSensitive ? "YES" : "NO"}
            Standard Schedule: ${JSON.stringify(plant.careSchedule)}
        `;

        const weatherDataStr = `
            Current Date: ${new Date().toLocaleDateString()}
            Location: ${weather.city}
            Target Condition: ${weather.condition} (${weather.temp}°F)
            Wind: ${weather.windSpeed} mph
            Alerts: ${weather.alerts.length > 0 ? weather.alerts.map(a => a.event).join(", ") : "None"}
        `;

        // Format Log Context
        const logContext = careLogs.length > 0
            ? careLogs.slice(0, 5).map(log => `[${log.date}] Action: ${log.action}, Status: ${log.status}, Note: ${log.note}`).join("\n")
            : "No recent care logs.";

        // 3. Construct System Prompt
        // CRITICAL: We enforce a "Unified Weather Description" if provided, so all cards match.
        const systemPrompt = `
        You are "Petals & Prickles," a pragmatic groundskeeper.
        
        CONTEXT:
        The plant is ${plant.isPlanted ? "ALREADY PLANTED (Established)" : "NOT YET PLANTED (New Arrival)"}.
        ${weatherContext ? `OFFICIAL WEATHER REPORT: "${weatherContext}".` : ""}
        
        RECENT HEALTH HISTORY (USER LOGS):
        ${logContext}

        KNOWLEDGE BASE:
        1. GLOBAL RULES: ${globalGuideText ? globalGuideText.slice(0, 1500) : "No Global Protocol."}
        2. PLANT RULES: ${specificGuideText ? specificGuideText.slice(0, 1500) : "No Specific Guide."}

        CORE CANON (NON-NEGOTIABLE):
        1. NO WEATHER REPETITION: The user already sees the weather forecast. DO NOT say "It is 25F" or "Cloudy conditions detected."
        2. FOCUS ON THE PLANT: Only mention weather if it specifically endangers THIS plant species.
           - Bad: "It is freezing. Cover your plant." (Too generic)
           - Good: "Neem trees are tropical and will die tonight. Move indoors immediately." (Specific)
           - Good: "Boxwoods are hardy. No action needed despite the frost." (Specific)
        3. BREVITY: Keep it under 2 sentences.
        4. FACTUALITY: "tips" (water/light/feed) MUST be grounded in the provided KNOWLEDGE BASE (Global or Plant Rules).
           - Do NOT hallucinate specific values (e.g. "6 hours sun") unless explicitly in the text.
           - If unknown, return "General advice: Check guide."

        PRIORITY LEVELS:
        - P1 (Survival-Critical): FREEZE, HEAT (>90F). Action: PROTECT.
        - P2 (Stabilization): Default. Action: MOISTURE MGMT.

        TASK:
        Analyze conditions for this plant. Return a JSON object:
        {
            "narrative": "A concise, plant-specific note. Do NOT repeat the weather report.",
            "riskLevel": "HIGH" | "LOW" | "NONE",
            "action": "POSTPONE" | "PROCEED",
            "tips": {
                "water": "e.g. Keep soil moist but not wet.",
                "light": "e.g. Full sun to partial shade.",
                "fertilizer": "e.g. Monthly balanced feed."
            }
        }

        LOGIC:
        - RISK ASSESSMENT:
            - Temp < 32F: HIGH RISK (Freeze). Action: POSTPONE. 
                - SENSITIVE: "CRITICAL: Tropical specimen. Bring indoors or heat immediately."
                - HARDY: "Frost hardy. Ensure soil is moist to insulate roots, otherwise no action."
            - Temp > 90F: HIGH RISK (Heat). Action: POSTPONE. "Heat stress risk. checks soil daily."
        - IF NOT PLANTED: Check weather for planting safety.
        
        SAFETY: Do NOT use the phrase "Care Paused". Give direct protective instructions.
        `;

        // 4. Call LLM with JSON Mode
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: `Analyze:\nPLAINT: ${plantContext}\nWEATHER DATA: ${weatherDataStr}`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.5,
            max_tokens: 250,
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
            action: "PROCEED",
            tips: {
                water: "General advice: Monitor soil moisture.",
                light: "General advice: Ensure adequate light.",
                fertilizer: "General advice: Avoid over-fertilizing."
            }
        };
    }
}
