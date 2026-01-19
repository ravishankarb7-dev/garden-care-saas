import { PDF_STATIC_DATA } from './pdf_data_static';

const FILE_MAPPING: Record<string, string> = {
    'annual-flowering-plants': 'Annual_Flowering_Plants_Agent_Grade_Priority.pdf',
    'plant_annual_flowering': 'Annual_Flowering_Plants_Agent_Grade_Priority.pdf',

    'deciduous-flowering-shrubs': 'Deciduous_Flowering_Shrubs_Agent_Grade_Priority.pdf',
    'shrub_deciduous_flowering': 'Deciduous_Flowering_Shrubs_Agent_Grade_Priority.pdf',

    'evergreen-shrubs': 'Evergreen_Shrubs_Agent_Grade_Priority.pdf',
    'shrub_evergreen': 'Evergreen_Shrubs_Agent_Grade_Priority.pdf',

    'perennial-flowering-plants': 'Perennial_Flowering_Plants_Agent_Grade_Priority.pdf',
    'plant_perennial_flowering': 'Perennial_Flowering_Plants_Agent_Grade_Priority.pdf',

    'vegetable-starts': 'Vegetable_Starts_Agent_Grade_Priority.pdf',
    'plant_vegetable_start': 'Vegetable_Starts_Agent_Grade_Priority.pdf',
    'tomato': 'Vegetable_Starts_Agent_Grade_Priority.pdf',
    'pepper': 'Vegetable_Starts_Agent_Grade_Priority.pdf',
    'cucumber': 'Vegetable_Starts_Agent_Grade_Priority.pdf',
    'lettuce': 'Vegetable_Starts_Agent_Grade_Priority.pdf'
};

export async function getCareGuideContent(plantId: string, plantName?: string): Promise<string | null> {
    let filename: string | undefined;

    // 1. Try ID Match
    if (FILE_MAPPING[plantId]) {
        filename = FILE_MAPPING[plantId];
    } else {
        const key = Object.keys(FILE_MAPPING).find(k => plantId.includes(k));
        if (key) filename = FILE_MAPPING[key];
    }

    // 2. Try Name Match (Fallback)
    if (!filename && plantName) {
        const normalizedName = plantName.toLowerCase();
        // Check for specific keywords in name
        if (normalizedName.includes('tomato') || normalizedName.includes('pepper') || normalizedName.includes('vegetable')) {
            filename = 'Vegetable_Starts_Agent_Grade_Priority.pdf';
        } else if (normalizedName.includes('rose') || normalizedName.includes('hydrangea') || normalizedName.includes('shrub')) {
            // Very rough fallback, better than nothing, but risky? 
            // Better to check specific shrub keywords if possible.
            if (normalizedName.includes('deciduous')) filename = 'Deciduous_Flowering_Shrubs_Agent_Grade_Priority.pdf';
            if (normalizedName.includes('evergreen') || normalizedName.includes('boxwood')) filename = 'Evergreen_Shrubs_Agent_Grade_Priority.pdf';
        } else if (normalizedName.includes('boxwood') || normalizedName.includes('pine') || normalizedName.includes('yew')) {
            filename = 'Evergreen_Shrubs_Agent_Grade_Priority.pdf';
        }

        // Comprehensive Keyword Check using keys from FILE_MAPPING
        if (!filename) {
            const key = Object.keys(FILE_MAPPING).find(k => normalizedName.includes(k));
            if (key) filename = FILE_MAPPING[key];
        }
    }

    if (!filename) {
        console.warn(`[PDF] No matching care guide found for plant ID: ${plantId}, Name: ${plantName}`);
        return null; // Agent will fall back to Global Rules
    }

    // Static Lookup
    if (PDF_STATIC_DATA[filename]) {
        return PDF_STATIC_DATA[filename];
    }

    console.warn(`[PDF] Static data missing for file: ${filename}`);
    return null;
}

export async function getGlobalGuideContent(): Promise<string | null> {
    const filename = "28_Day_Stabilization_Primary_Advisory_v2.pdf";
    if (PDF_STATIC_DATA[filename]) {
        return PDF_STATIC_DATA[filename];
    }
    console.warn(`[PDF] Static data missing for global guide: ${filename}`);
    return null;
}
