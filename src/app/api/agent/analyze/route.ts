import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const { messages, deviceId } = await req.json();

        if (!messages || !deviceId) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        // 1. Lightweight Analysis (Heuristic Classifier)
        // In production, you would send this to gpt-4o-mini for better accuracy.
        const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || "";
        const lowerMsg = String(lastUserMessage).toLowerCase();

        let intent = "general_inquiry";
        let sentiment = "neutral";
        let verified_issue = false;

        // Intent Detection
        if (lowerMsg.includes("water") || lowerMsg.includes("dry") || lowerMsg.includes("wet")) intent = "watering";
        if (lowerMsg.includes("bug") || lowerMsg.includes("eat") || lowerMsg.includes("hole")) {
            intent = "pest_control";
            verified_issue = true;
            sentiment = "concerned";
        }
        if (lowerMsg.includes("yellow") || lowerMsg.includes("wilt") || lowerMsg.includes("die")) {
            intent = "plant_health";
            verified_issue = true;
            sentiment = "concerned";
        }
        if (lowerMsg.includes("thank") || lowerMsg.includes("great")) sentiment = "positive";

        // 2. Persist ONLY Metadata (No PII, No raw text)
        const { error } = await supabase
            .from("user_insights")
            .insert({
                receipt_id: deviceId,
                intent,
                sentiment,
                verified_issue,
                // We don't extract plant name reliably with regex, so leaving null for now
            } as any);

        if (error) {
            console.error("Failed to log insight:", error);
            // Non-blocking error, don't fail the client
        }

        return NextResponse.json({ success: true });

    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
