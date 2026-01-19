import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getKnowledgeBase } from "@/lib/knowledge";

export async function POST(req: NextRequest) {
    try {
        const { messages, context } = await req.json();
        const { zip, plants, logs } = context || {};

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: "OpenAI Config Missing" }, { status: 500 });
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        // 1. Load Knowledge Base (Live Reload)
        const globalRules = await getKnowledgeBase();

        // 2. Format Plant Context for the Agent
        const plantList = plants ? plants.map((p: any) =>
            `- ${p.name} (Planted: ${p.plantedAt}, ID: ${p.id})`
        ).join("\n") : "No specific plants selected.";

        // 2b. Format Health Logs
        const healthHistory = logs && logs.length > 0 ? logs.map((l: any) =>
            `[${l.date}] ${l.plant}: ${l.status} (${l.note || "No notes"})`
        ).join("\n") : "No recent check-ins.";

        // 3. System Prompt (P1 Guardrails)
        const systemPrompt = `
        You are "Sage," the Consumer Chatbot Care Assistant.
        Your mission: Reduce plant returns by enforcing P1 (Survival-Critical) Logic.

        CORE KNOWLEDGE (THE BIBLE):
        ${globalRules || "Standard 28-Day Stabilization Rules apply."}

        USER CONTEXT:
        Location Zip: ${zip || "Unknown"}
        My Garden:
        ${plantList}

        RECENT HEALTH LOGS (User Check-ins):
        ${healthHistory}

        OPERATIONAL RULES (P1 GUARDRAILS):
        0. **Visual Diagnosis (Sage Eye)**: If the user provides an IMAGE, prioritize analyzing it. precise identification of pests/diseases from visual cues.
        1. **Moisture-First Diagnostics**: If user asks about watering or wilting, YOU MUST ASK: "Is the soil currently wet or dry?" before giving advice.
        2. **Anti-Sipping**: Forbid shallow sprinkling. Always recommend deep watering.
        3. **Fertilizer Safety**: NEVER allow fertilizer on dry soil. No quick-release in heat/drought.
        4. **Installation Integrity**: Check root flare depth & mulch distance.
        5. **Log Awareness**: If the user has "CRITICAL" or "CONCERN" logs in RECENT HEALTH LOGS, acknowledge them immediately (e.g., "I see you noted pests on the Rose yesterday...").
        6. **Reflected Heat**: For Evergreens/Conifers in High Temps, warn about "Reflected Heat" from walls/pavement.

        CONVERSATIONAL FLOW:
        - **Identify**: Plant Category & Day 0-28 window.
        - **Sort Symptoms**: Normal vs. Failure Signals (Stem collapse = Warning).
        - **Weather Check**: If [Zip] indicates Heat Wave, prioritize shade/water.
        - **Tone**: Witty but strict about specific survival rules. 
          *Analogy*: "Fertilizing a stressed plant is like feeding a steak to a flu patient—it hurts them."
          *Analogy*: "Plants don't sip, they drink. Soak the roots, don't sprinkle the leaves."

        You are chatting with the user. Keep responses concise (max 3 sentences unless detailed instructions needed).
        `;

        // 4. Call OpenAI with Tools
        const tools = [
            {
                type: "function" as const, // Cast as const to satisfy OpenAI types
                function: {
                    name: "submit_feedback",
                    description: "Save user feedback about the RootCause app software, features, or UI. Do NOT use this for plant care questions.",
                    parameters: {
                        type: "object",
                        properties: {
                            text: {
                                type: "string",
                                description: "The user's feedback message."
                            },
                            category: {
                                type: "string",
                                enum: ["FEATURE", "BUG", "UI", "CONTENT", "GENERAL"],
                                description: "Category of the feedback."
                            },
                            sentiment: {
                                type: "string",
                                enum: ["POSITIVE", "NEGATIVE", "NEUTRAL"],
                                description: "Sentiment of the feedback."
                            }
                        },
                        required: ["text", "category", "sentiment"]
                    }
                }
            }
        ];

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ],
            tools: tools,
            tool_choice: "auto",
            temperature: 0.7,
            max_tokens: 300
        });

        const msg = response.choices[0].message;

        // 5. Handle Tool Calls
        if (msg.tool_calls && msg.tool_calls.length > 0) {
            const toolCall = msg.tool_calls[0] as any; // Cast to any to avoid complex union type issues
            if (toolCall.function.name === "submit_feedback") {
                const args = JSON.parse(toolCall.function.arguments);

                // Execute Logic
                const { logAppFeedback } = await import("@/lib/queries");
                await logAppFeedback(args.text, args.category, args.sentiment);

                // Option A: Recursive call intended? 
                // For simplicity/speed, we will return a hardcoded "Function Output" simulation
                // But normally we'd feed this back to the LLM. 
                // Let's just return a polite confirmation generated by the Agent in a 2nd turn?
                // Or just manually return a response representing the success.

                // Let's do a 2nd turn to let Sage stay in character
                const followUp = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [
                        { role: "system", content: systemPrompt },
                        ...messages,
                        msg, // The tool call request
                        {
                            role: "tool",
                            tool_call_id: toolCall.id,
                            content: "Feedback saved successfully to database."
                        }
                    ],
                    temperature: 0.7
                });

                return NextResponse.json({
                    message: followUp.choices[0].message.content
                });
            }
        }

        return NextResponse.json({
            message: msg.content
        });

    } catch (error: any) {
        console.error("[Chat] Error:", error);
        return NextResponse.json({
            error: "Sage Error: " + (error.message || "Unknown error"),
            details: JSON.stringify(error)
        }, { status: 500 });
    }
}
