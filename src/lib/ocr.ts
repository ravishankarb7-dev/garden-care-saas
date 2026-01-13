export type ScannedReceiptData = {
    receiptId: string;
    purchaseDate: string; // ISO Date string YYYY-MM-DD
    storeName: string;
    detectedPlants: string[]; // List of plant names or SKUs detected
};

export async function mockScanReceipt(file: File): Promise<ScannedReceiptData> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock data generation
    // In a real app, we would send 'file' to an OCR API (e.g. Google Cloud Vision, AWS Textract)

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    const mockPlants = [
        "Fiddle Leaf Fig",
        "Snake Plant",
        "Monstera Deliciosa",
        "Peace Lily",
        "ZZ Plant"
    ];

    // Pick 1-3 random plants from the list to simulate detection
    const shuffled = mockPlants.sort(() => 0.5 - Math.random());
    const detected = shuffled.slice(0, Math.floor(Math.random() * 3) + 1);

    return {
        receiptId: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
        purchaseDate: formattedDate,
        storeName: "Green Thumb Garden Center",
        detectedPlants: detected
    };
}
