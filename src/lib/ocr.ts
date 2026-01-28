
export type ScannedItem = {
    originalText: string;
    matchedPlant?: {
        id: string;
        name: string;
    };
    price: number | null;
    potSize: string | null;
    quantity: number;
    isPlanted?: boolean;
    plantingDate?: string; // New: Per-plant date
};

export type ScannedReceiptData = {
    receiptId: string;
    purchaseDate: string;
    storeName: string;
    storeZip: string | null;
    transactionTotal: number | null;
    items: ScannedItem[];
};

export async function scanReceipt(file: File): Promise<ScannedReceiptData> {
    // 1. Convert File to Base64
    const base64Image = await toBase64(file);

    // 2. Call API Route
    const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to scan receipt");
    }

    // 3. Return Data
    return await response.json();
}

// Helper to convert File to Base64 Data URL
function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
}
