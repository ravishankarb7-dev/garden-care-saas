export type CareTask = {
    day: number; // Day relative to purchase (0, 1, 2...)
    action: string; // "Water", "Fertilize", "Prune"
    description: string;
};

export type TroubleshootingItem = {
    symptom: string; // e.g., "Yellow leaves"
    diagnosis: string; // "Overwatering"
    action: string; // "Allow soil to dry out"
};

export type Plant = {
    id: string; // The "slug" or key (e.g. 'aglaonema-silver-bay')
    uuid?: string; // The database primary key
    skuId?: string; // The specific SKU ID from store_skus
    name: string; // Common name
    botanicalName: string;
    imageUrl?: string;
    careSchedule: CareTask[];
    troubleshooting: TroubleshootingItem[];
    // Instance-specific properties (from receipt)
    purchasePrice?: number;
    potSize?: string;
    quantity?: number;
};

export type WeatherAlert = {
    type: "frost" | "heat" | "rain" | "none";
    message: string;
    severity: "low" | "medium" | "high";
};
