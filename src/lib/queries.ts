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
    const PLANTS = STATIC_DATA;


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
    const PLANTS = STATIC_DATA;

    if (n.includes('tomato') || n.includes('pepper') || n.includes('vegetable')) {
        return PLANTS.find((p: any) => p.id === 'vegetable-starts')?.troubleshooting || [];
    }
    return [];
}

export async function getPlantById(id: string): Promise<Plant | undefined> {
    // 1. First try to fetch from DB by key (Category Match)
    let { data: category, error } = await supabase
        .from('care_categories')
        .select('*')
        .eq('key', id)
        .maybeSingle<CareCategory>(); // Explicit generic here or type assignment below

    // Force type for mutable variable
    let matchedCategory: CareCategory | null = category;

    // 2. If not found as a Category, try as a SKU
    if (!matchedCategory) {
        // Define the shape manually to satisfy TS for the join
        type StoreSkuWithCategory = StoreSku & {
            care_category: CareCategory | null
        };

        const { data: skuData, error: skuError } = await supabase
            .from('store_skus')
            .select(`
                *,
                care_category:care_categories(*)
            `)
            .eq('sku', id) // Only check SKU column to avoid UUID error
            .maybeSingle();

        if (skuData) {
            const sku = skuData as unknown as StoreSkuWithCategory;

            if (sku.care_category) {
                // Found it! Use the parent category for the logic
                matchedCategory = sku.care_category;

                // NOTE: We verified logic: The user wants to use the SKU name for display, 
                // but the Category's static data for care.

                const staticData = STATIC_DATA.find((p) => p.id === matchedCategory!.key);

                return {
                    id: sku.sku, // Keep ID as the SKU for consistency
                    uuid: sku.care_category_id,
                    name: sku.display_name || sku.sku, // Use SKU name
                    botanicalName: sku.sku, // Storing SKU in botanical for ref
                    imageUrl: staticData?.imageUrl || "/images/placeholder.png",
                    careSchedule: staticData?.careSchedule?.length ? staticData.careSchedule : assignDefaultSchedule(matchedCategory!.label || ""),
                    troubleshooting: staticData?.troubleshooting?.length ? staticData.troubleshooting : assignDefaultTroubleshooting(matchedCategory!.label || ""),
                };
            }
        }
    }

    if (error && !matchedCategory) {
        console.warn(`Plant ${id} not found in DB or error:`, error.message);
        // Fallback to local data (last resort for dev/offline)
        return STATIC_DATA.find(p => p.id === id);
    }

    if (!matchedCategory) return undefined;

    const staticData = STATIC_DATA.find((p) => p.id === matchedCategory.key);

    return {
        id: matchedCategory.key,
        uuid: matchedCategory.id,
        name: matchedCategory.label,
        botanicalName: staticData?.botanicalName || "",
        imageUrl: staticData?.imageUrl || "/images/placeholder.png",
        careSchedule: staticData?.careSchedule?.length ? staticData.careSchedule : assignDefaultSchedule(matchedCategory.label || ""),
        troubleshooting: staticData?.troubleshooting?.length ? staticData.troubleshooting : assignDefaultTroubleshooting(matchedCategory.label || ""),
    };
}

export async function createCareSessions(
    receiptId: string, // Used for logging/deduplication context, or mapped to receipt_id in some schemas
    plants: Plant[],
    plantingDate: string,
    zip: string,
    deviceId: string,
    purchaseDate?: string
): Promise<boolean> {
    // Hardcoded Store ID (Store S1) for prototype, unless we have real store logic later
    const STORE_ID = "87661f59-fae5-5d6f-98fa-5880f4a14a42";

    const sessions = plants.map(plant => ({
        store_id: STORE_ID,
        store_sku_id: plant.skuId || null,
        care_category_id: plant.uuid!, // Assert UUID exists
        receipt_id: deviceId, // Device ID as key
        planted_at: new Date(plantingDate).toISOString(),
        zip: zip,
        session_token: null,
        token_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        window_days: 7,

        // Granular Data (New Columns)
        purchase_price: plant.purchasePrice || null,
        pot_size: plant.potSize || null,
        purchase_date: purchaseDate ? new Date(purchaseDate).toISOString() : null,
        // We could also save 'quantity' here if we expanded the table to specific item rows, 
        // but for now 1 row = 1 plant logic implies we create multiple sessions or just track the first one.
        // If query sends array of duplicate plants, we handle them.
    }));

    // 1. Fetch existing sessions for this device to prevent duplicates
    const { data: existing } = await supabase
        .from('care_sessions')
        .select('care_category_id, planted_at, store_sku_id')
        .eq('receipt_id', deviceId) as { data: any[] };

    // Create a Set of "ID|SKU|DATE" keys for efficient lookup
    const existingSet = new Set(
        existing?.map(e => {
            const dateStr = new Date(e.planted_at).toISOString().split('T')[0];
            return `${e.care_category_id}|${e.store_sku_id || 'null'}|${dateStr}`;
        })
    );

    // 2. Filter out sessions that already exist (Same Plant, Same Date)
    const newSessions = sessions.filter(s => {
        const dateStr = new Date(s.planted_at).toISOString().split('T')[0];
        const key = `${s.care_category_id}|${s.store_sku_id || 'null'}|${dateStr}`;

        if (existingSet.has(key)) {
            console.log(`Skipping duplicate (same day check): ${key}`);
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

// --- Gamification Logic ---

export interface UserStats {
    device_id: string;
    xp: number;
    level: number;
    streak_days: number;
    last_active_date: string | null;
    badges: string[];
}

import { calculateLevel, calculateWordCountXP, calculateNewStreak } from './gamification_logic';

export async function getUserStats(deviceId: string): Promise<UserStats> {
    const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('device_id', deviceId)
        .maybeSingle();

    if (error && error.code !== 'PGRST116') {
        console.warn("Error fetching user stats:", error);
    }

    if (!data) {
        // Initialize if not exists
        return {
            device_id: deviceId,
            xp: 0,
            level: 1,
            streak_days: 0,
            last_active_date: null,
            badges: []
        };
    }

    return data as UserStats;
}

export async function awardXP(deviceId: string, amount: number, activityDate: string = new Date().toISOString().split('T')[0]): Promise<void> {
    // Fetch current stats
    let stats = await getUserStats(deviceId);

    // Update XP
    stats.xp += amount;
    const newLevel = calculateLevel(stats.xp);

    // Update Streak
    const today = activityDate;
    const newStreak = calculateNewStreak(stats.streak_days, stats.last_active_date, today);

    // Persist
    const { error } = await supabase
        .from('user_stats')
        .upsert({
            device_id: deviceId,
            xp: stats.xp,
            level: newLevel,
            streak_days: newStreak,
            last_active_date: today,
            badges: stats.badges // TODO: Add logic to push new badges
        } as any);

    if (error) console.error("Failed to update XP:", error);
}

// --- Care Logs (Check-ins) ---

export async function logCareAction(
    sessionId: string,
    actionType: string,
    logDate: string,
    status: 'THRIVING' | 'CONCERN' | 'CRITICAL',
    note: string,
    soilMoisture?: 'WET' | 'MOIST' | 'DRY',
    pestDetected?: boolean
): Promise<boolean> {
    const { error } = await supabase
        .from('care_logs')
        .upsert({
            care_session_id: sessionId,
            action_type: actionType,
            log_date: logDate,
            status,
            note,
            soil_moisture: soilMoisture,
            pest_detected: pestDetected
        } as any, { onConflict: 'care_session_id, action_type, log_date' });

    if (error) {
        console.error("Error logging care:", error);
        return false;
    }

    // Gamification Hook: Award XP
    // 1. Get Device ID from Session
    const { data: session } = await supabase
        .from('care_sessions')
        .select('receipt_id')
        .eq('id', sessionId)
        .single();

    if ((session as any)?.receipt_id) {
        // Calculate Points
        const baseXP = 10;
        const qualityXP = calculateWordCountXP(note);
        await awardXP((session as any).receipt_id, baseXP + qualityXP, logDate);
    }

    return true;
}

export async function getCareLogs(sessionId: string): Promise<any[]> {
    const { data, error } = await supabase
        .from('care_logs')
        .select('*')
        .eq('care_session_id', sessionId);

    if (error) {
        console.error("Error fetching logs:", error);
        return [];
    }
    return data || [];
}

export async function getAllCareLogs(deviceId: string): Promise<any[]> {
    if (!deviceId) return [];

    // Join care_logs with care_sessions to filter by receipt_id (deviceId)
    const { data, error } = await supabase
        .from('care_logs')
        .select(`
            *,
            care_session:care_sessions!inner(
                care_category:care_categories(label),
                store_sku:store_skus(display_name, sku)
            )
        `)
        .eq('care_session.receipt_id', deviceId)
        .order('log_date', { ascending: false })
        .limit(20); // Limit to recent 20 logs for context window

    if (error) {
        console.error("Error fetching all logs:", error);
        return [];
    }

    // Flatten for the AI
    return data.map((log: any) => ({
        date: log.log_date,
        plant: log.care_session?.store_sku?.display_name || log.care_session?.store_sku?.sku || log.care_session?.care_category?.label || "Unknown Plant",
        status: log.status,
        note: log.note
    }));
}

// --- App Feedback ---

export async function logAppFeedback(
    text: string,
    category: 'FEATURE' | 'BUG' | 'UI' | 'CONTENT' | 'GENERAL',
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
): Promise<boolean> {
    const { error } = await supabase
        .from('app_feedback')
        .insert({
            feedback_text: text,
            category,
            sentiment
        } as any);

    if (error) {
        console.error("Error logging feedback:", error);
        return false;
    }
    return true;
}
