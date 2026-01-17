import { supabase } from './supabase';
import { PLANTS as STATIC_DATA } from './data';
import { Plant } from './types';
import { Database } from './database.types';

type CareCategory = Database['public']['Tables']['care_categories']['Row'];
type StoreSku = Database['public']['Tables']['store_skus']['Row'];

export async function getPlants(): Promise<Plant[]> {
    const { data: categories, error: catError } = await supabase
        .from('care_categories')
        .select('*')
        .eq('is_active', true)
        .returns<CareCategory[]>();

    if (catError) {
        console.error('Error fetching categories:', catError);
        return STATIC_DATA; // Fallback on error
    }

    const { data: skus, error: skuError } = await supabase
        .from('store_skus')
        .select('*')
        .eq('is_active', true)
        .returns<StoreSku[]>();

    if (skuError) {
        console.warn('Error fetching SKUs:', skuError);
    }

    const categoryPlants = (categories || []).map((category) => {
        // Find matching static data for schedules/images by key
        const staticData = STATIC_DATA.find((p) => p.id === category.key);

        return {
            id: category.key, // Use the readable slug as the primary app ID
            uuid: category.id, // Store the real DB UUID
            name: category.label, // DB label is the source of truth for name
            botanicalName: staticData?.botanicalName || "",
            imageUrl: staticData?.imageUrl,
            careSchedule: staticData?.careSchedule || [],
            troubleshooting: staticData?.troubleshooting || [],
        };
    });

    // Map SKUs to Plant objects (linking back to the parent category for care info)
    const skuPlants = (skus || []).map((sku) => {
        const parentCategory = categories?.find(c => c.id === sku.care_category_id);
        const staticData = parentCategory ? STATIC_DATA.find(p => p.id === parentCategory.key) : null;

        return {
            id: sku.sku, // Use SKU as ID for unique selection
            // CRITICAL FIX: The uuid must be the care_category_id for the session table foreign key
            uuid: sku.care_category_id,
            skuId: sku.id, // We might want to track the specific SKU ID if the DB supported it
            name: sku.display_name || sku.sku, // Display Name or SKU
            botanicalName: sku.sku, // Show SKU in botanical name field for visibility
            imageUrl: staticData?.imageUrl,

            careSchedule: staticData?.careSchedule?.length ? staticData.careSchedule : assignDefaultSchedule(sku.display_name || sku.sku || ""),
            troubleshooting: staticData?.troubleshooting?.length ? staticData.troubleshooting : assignDefaultTroubleshooting(sku.display_name || sku.sku || ""),
            // You might add a flag here like isSku: true if needed
        };
    });

    return [...categoryPlants, ...skuPlants];
}

// Helper to fuzzy match schedules based on keywords if exact ID match fails
function assignDefaultSchedule(name: string): any[] {
    const n = name.toLowerCase();
    const { PLANTS } = require('./data'); // Dynamic import to avoid cycle if any, or just import top level

    if (n.includes('tomato') || n.includes('pepper') || n.includes('vegetable') || n.includes('lettuce') || n.includes('cucumber')) {
        return PLANTS.find((p: any) => p.id === 'vegetable-starts')?.careSchedule || [];
    }
    if (n.includes('rose') || n.includes('hydrangea') || n.includes('lilac') || n.includes('azalea')) {
        return PLANTS.find((p: any) => p.id === 'deciduous-flowering-shrubs')?.careSchedule || [];
    }
    if (n.includes('boxwood') || n.includes('holly') || n.includes('yew') || n.includes('juniper') || n.includes('pine')) {
        return PLANTS.find((p: any) => p.id === 'evergreen-shrubs')?.careSchedule || [];
    }
    if (n.includes('petunia') || n.includes('marigold') || n.includes('begonia') || n.includes('geranium') || n.includes('impatiens')) {
        return PLANTS.find((p: any) => p.id === 'annual-flowering-plants')?.careSchedule || [];
    }
    if (n.includes('hosta') || n.includes('peony') || n.includes('daylily') || n.includes('cone') || n.includes('daisy')) {
        return PLANTS.find((p: any) => p.id === 'perennial-flowering-plants')?.careSchedule || [];
    }
    return [];
}

function assignDefaultTroubleshooting(name: string): any[] {
    const n = name.toLowerCase();
    const { PLANTS } = require('./data');

    if (n.includes('tomato') || n.includes('pepper') || n.includes('vegetable')) {
        return PLANTS.find((p: any) => p.id === 'vegetable-starts')?.troubleshooting || [];
    }
    return [];
}

export async function getPlantById(id: string): Promise<Plant | undefined> {
    // First try to fetch from DB by key
    const { data, error } = await supabase
        .from('care_categories')
        .select('*')
        .eq('key', id)
        .single();

    if (error) {
        // Fallback to local data if DB fetch fails or not found (for dev/offline)
        console.warn(`Plant ${id} not found in DB or error:`, error.message);
        return STATIC_DATA.find(p => p.id === id);
    }

    // Explicitly cast data to help TS if needed, usually data is the Row type
    const category = data as CareCategory | null;

    if (!category) return undefined;

    const staticData = STATIC_DATA.find((p) => p.id === category.key);

    return {
        id: category.key,
        uuid: category.id,
        name: category.label,
        botanicalName: staticData?.botanicalName || "",
        imageUrl: staticData?.imageUrl || "/images/placeholder.png",
        careSchedule: staticData?.careSchedule?.length ? staticData.careSchedule : assignDefaultSchedule(category.label || ""),
        troubleshooting: staticData?.troubleshooting?.length ? staticData.troubleshooting : assignDefaultTroubleshooting(category.label || ""),
    };
}

export async function createCareSessions(
    receiptId: string,
    plants: Plant[],
    date: string,
    zip: string,
    deviceId: string
): Promise<boolean> {
    // Hardcoded Store ID (Store S1) for prototype
    const STORE_ID = "87661f59-fae5-5d6f-98fa-5880f4a14a42";

    const sessions = plants.map(plant => ({
        store_id: STORE_ID,
        store_sku_id: plant.skuId || null,
        care_category_id: plant.uuid!, // Assert UUID exists as our logic ensures it for valid selections
        receipt_id: deviceId, // Store Device ID as the Receipt ID (merging all plants to one device-garden)
        planted_at: new Date(date).toISOString(),
        zip: zip,
        session_token: null, // Unused because it requires UUID
        token_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // +1 year
        window_days: 7 // Default window
    }));

    // 1. Fetch existing sessions for this device to prevent duplicates
    const { data: existing } = await supabase
        .from('care_sessions')
        .select('care_category_id, planted_at, store_sku_id')
        .eq('receipt_id', deviceId) as { data: any[] };

    const existingSet = new Set(
        existing?.map(e => `${e.care_category_id}|${e.store_sku_id || 'null'}`)
    );

    // 2. Filter out sessions that already exist (Same Plant Type, ANY Date)
    const newSessions = sessions.filter(s => {
        const key = `${s.care_category_id}|${s.store_sku_id || 'null'}`;
        if (existingSet.has(key)) {
            console.log(`Skipping duplicate (singleton check): ${key}`);
            return false;
        }
        return true;
    });

    if (newSessions.length === 0) {
        console.log("All sessions were duplicates.");
        return true; // Treat as success, just nothing new to add
    }

    console.log("Creating sessions payload:", JSON.stringify(newSessions, null, 2));

    const { error } = await supabase
        .from('care_sessions')
        .insert(newSessions as any);

    if (error) {
        console.error("Error creating sessions raw:", error);
        return false;
    }

    return true;
}

export async function getCareSessionsByReceipt(receiptIds: string[]): Promise<any[]> {
    if (receiptIds.length === 0) return [];

    const { data, error } = await supabase
        .from('care_sessions')
        .select(`
            *,
            care_category:care_categories(*),
            store_sku:store_skus(*)
        `)
        .in('receipt_id', receiptIds)
        .order('planted_at', { ascending: false });

    if (error) {
        console.error("Error fetching sessions:", error);
        return [];
    }

    return data;
}

export async function getCareSessionsByDeviceId(deviceId: string): Promise<any[]> {
    if (!deviceId) return [];

    const { data, error } = await supabase
        .from('care_sessions')
        .select(`
            *,
            care_category:care_categories(*),
            store_sku:store_skus(*)
        `)
        .eq('receipt_id', deviceId) // Query text column
        .order('planted_at', { ascending: false });

    if (error) {
        console.error("Error fetching sessions by device:", JSON.stringify(error, null, 2));
        return [];
    }

    return data;
}

export async function deleteCareSession(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('care_sessions')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting session:", error);
        return false;
    }
    return true;
}
