
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
                    1. Store Name & Zip/Postal Code (e.g. 5 digits US, alphanum UK/Canada).
                    2. Receipt Number / Transaction ID (if visible).
                    3. Purchase Date (YYYY-MM-DD) - Default to today if not found.
                    4. Transaction Total Amount
                    5. List of line items, extracting:
                       - Description
                       - Price (per item)
                       - Pot Size (e.g. "1 GAL", "4 IN", "2.5 QT") if visible in description or sku.
                       - Quantity
                    
                    Return ONLY raw JSON with this structure:
                    {
                        "storeName": "string",
                        "storeZip": "string or null",
                        "receiptNumber": "string or null",
                        "purchaseDate": "string",
                        "totalAmount": number or null,
                        "items": [
                            {
                                "description": "string",
                                "price": number or null,
                                "pot_size": "string or null",
                                "quantity": number
                            }
                        ]
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
            max_tokens: 1000,
        });

        const content = response.choices[0].message.content;

        // Clean markdown code blocks if present
        const jsonStr = content?.replace(/```json/g, "").replace(/```/g, "").trim();

        if (!jsonStr) {
            throw new Error("No JSON returned from AI");
        }

        const data = JSON.parse(jsonStr);

        // Fuzzy Match Logic (Server-Side)
        const scannedItems = data.items.map((rawItem: any) => {
            // rawItem is now an object: { description, price, pot_size, quantity }
            const cleanLine = rawItem.description.toLowerCase().replace(/[^a-z0-9\s]/g, '');
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
                originalText: rawItem.description,
                matchedPlant: match || undefined,
                price: rawItem.price || null,
                potSize: rawItem.pot_size || null,
                quantity: rawItem.quantity || 1
            };
        });

        // Use extracted ID or fallback
        const finalReceiptId = data.receiptNumber || `REC-${Math.floor(Math.random() * 100000)}`;

        return NextResponse.json({
            receiptId: finalReceiptId,
            storeName: data.storeName || "Unknown Store",
            storeZip: data.storeZip || null,
            purchaseDate: data.purchaseDate || new Date().toISOString().split('T')[0],
            transactionTotal: data.totalAmount || null,
            items: scannedItems
        });

    } catch (error: any) {
        console.error("Scan Error:", error);
        return NextResponse.json({ error: error.message || "Failed to scan receipt" }, { status: 500 });
    }
}
