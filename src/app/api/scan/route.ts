
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { PLANTS } from "@/lib/data";

// Initialize OpenAI inside handler to avoid build-time errors if key is missing
// const openai = new OpenAI(...);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { image } = body;

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: "OpenAI API Key not configured" }, { status: 500 });
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Call OpenAI Vision
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Cost-effective model for receipt scanning
            messages: [
                {
                    role: "system",
                    content: `You are a receipt scanner for a gardening app. 
                    Analyze the receipt image and extract:
                    1. Store Name
                    2. Purchase Date (YYYY-MM-DD) - Default to today if not found.
                    3. List of distinct items purchased.
                    
                    Return ONLY raw JSON with this structure:
                    {
                        "storeName": "string",
                        "purchaseDate": "string",
                        "items": ["string", "string"]
                    }`
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Scan this receipt." },
                        {
                            type: "image_url",
                            image_url: {
                                "url": image, // Base64 data url from client
                            },
                        },
                    ],
                },
            ],
            max_tokens: 500,
        });

        const content = response.choices[0].message.content;

        // Clean markdown code blocks if present
        const jsonStr = content?.replace(/```json/g, "").replace(/```/g, "").trim();

        if (!jsonStr) {
            throw new Error("No JSON returned from AI");
        }

        const data = JSON.parse(jsonStr);

        // Fuzzy Match Logic (Server-Side)
        const scannedItems = data.items.map((rawItem: string) => {
            const cleanLine = rawItem.toLowerCase().replace(/[^a-z0-9\s]/g, '');
            let match = null;

            for (const plant of PLANTS) {
                const plantName = plant.name.toLowerCase();
                // Check if plant name is in the item text OR item text is in the plant name
                if (cleanLine.includes(plantName) || plantName.includes(cleanLine)) {
                    // Heuristic: Match should be substantial (e.g. > 3 chars)
                    if (cleanLine.length > 3) {
                        match = { id: plant.id, name: plant.name };
                        break; // Take first match
                    }
                }
            }

            return {
                originalText: rawItem,
                matchedPlant: match || undefined
            };
        });

        return NextResponse.json({
            receiptId: `REC-${Math.floor(Math.random() * 100000)}`,
            storeName: data.storeName || "Unknown Store",
            purchaseDate: data.purchaseDate || new Date().toISOString().split('T')[0],
            items: scannedItems
        });

    } catch (error: any) {
        console.error("Scan Error:", error);
        return NextResponse.json({ error: error.message || "Failed to scan receipt" }, { status: 500 });
    }
}
