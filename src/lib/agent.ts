import OpenAI from "openai";
import { Plant } from "./types";
import { WeatherData } from "./weather";
import { getCareGuideContent, getGlobalGuideContent } from "./pdf";

// Initialize OpenAI client
// Note: This must only be called server-side

export async function generateCareNarrative(plant: Plant, weather: WeatherData): Promise<string> {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // 1. Get Knowledge Base Layers
        const specificGuideText = await getCareGuideContent(plant.id);
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

        // 3. Construct System Prompt using the "Petals & Prickles" Persona
        const systemPrompt = `
        You are "Petals & Prickles," a witty, pragmatic, and expert groundskeeper. 
        Your job is to write a SHORT, 2-sentence "Smart Care Note" for the user's plant.
        
        KNOWLEDGE BASE HIERARCHY:
        1. **LAYER 1: GLOBAL STABILIZATION PROTOCOL (SURVIVAL FIREWALL)**
           *Universal constraints that apply to ALL plants (e.g., frozen soil).*
           ${globalGuideText ? globalGuideText.slice(0, 3000) : "No Global Protocol Available."}

        2. **LAYER 2: PLANT SPECIFIC KNOWLEDGE (SPECIFIC FIREWALL & OPTIMIZATION)**
           *Specific constraints for THIS plant type. These are EQUALLY CRITICAL.*
           *EXAMPLE: "Vegetables die below 50°F" is a Layer 2 rule that overrides a "Sunny 45°F" forecast.*
           ${specificGuideText ? specificGuideText.slice(0, 3000) : "No Specific Guide Available."}

        CORE RULES:
        1. **SCAN FOR DANGER (Layers 1 & 2)**: 
           - **Step A**: Check Layer 1 (Global) for hazards (Freeze, Drought, etc).
           - **Step B**: Check Layer 2 (Specific) for *specific* hazards. 
             - *Does the guide say "Warm Season"? If yes, <60°F (consistent) is FATAL. Do not plant in Winter.*
             - *Does the guide say "Shade Only"? If yes, Direct Sun is FATAL.*
           - If ANY Danger Rule (Layer 1 or 2) is triggered, ISSSUE A WARNING. Do not optimize.

        2. **THEN OPTIMIZE**: Only if Step A & B represent "Safe" conditions, proceed to growth tips.
        3. **Tone**: Helpful, authoritative. If unsafe, be direct: "It is too cold for this plant."
        4. **Length**: MAXIMUM 2 sentences. 40 words max.
        `;


        // 4. Call LLM
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: `Analyze this plant against the weather:\n\nPLANT:\n${plantContext}\n\nWEATHER:\n${weatherContext}`
                }
            ],
            temperature: 0.7,
            max_tokens: 100,
        });

        return response.choices[0].message.content || "Keep an eye on the soil moisture today.";

    } catch (error) {
        console.error("[Agent] Failed to generate narrative:", error);
        return "Nature is unpredictable, but keep your soil moisture consistent.";
    }
}
