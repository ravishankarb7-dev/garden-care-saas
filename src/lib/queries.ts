import { supabase } from './supabase';
import { PLANTS as STATIC_DATA } from './data';
import { Plant } from './types';
import { Database } from './database.types';

type CareCategory = Database['public']['Tables']['care_categories']['Row'];

export async function getPlants(): Promise<Plant[]> {
    const { data: categories, error } = await supabase
        .from('care_categories')
        .select('*')
        .eq('is_active', true)
        .returns<CareCategory[]>();

    if (error) {
        console.error('Error fetching plants:', error);
        return STATIC_DATA; // Fallback on error
    }

    if (!categories || categories.length === 0) {
        console.warn('No plants found in DB, using static data.');
        return STATIC_DATA;
    }

    return categories.map((category) => {
        // Find matching static data for schedules/images by key
        // We assume the DB 'key' matches our local 'id' (slug)
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
        careSchedule: staticData?.careSchedule || [],
        troubleshooting: staticData?.troubleshooting || [],
    };
}
