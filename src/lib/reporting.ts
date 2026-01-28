import { supabase } from "@/lib/supabase";

export interface TimelineEvent {
    date: string;
    type: 'PLANTED' | 'LOG' | 'WEATHER' | 'OUTCOME';
    title: string;
    description: string;
    icon?: string; // Emoji or Lucide name
    severity?: 'info' | 'warning' | 'critical' | 'success';
    metadata?: Record<string, unknown>;
}

// Explicit definition to fix "never[]" inference error
interface SessionData {
    id: string;
    store_id: string;
    zip: string;
    received_at?: string;
    created_at: string;
    // Joined fields need careful typing if returned flattened or nested
    care_categories: { key: string; label: string } | null;
    store_skus: { display_name: string } | null;
    store_name?: string;
    purchase_date?: string;
    starter_size?: string;
}

interface CareLog {
    log_date: string;
    action_type: string;
    status: string;
    note?: string;
    soil_moisture?: string;
    pest_detected?: boolean;
}

interface CareOutcome {
    outcome_at: string;
    outcome_type: string;
    source: string;
    confidence: string;
    notes?: string;
}

interface WeatherObservation {
    date: string;
    temp_max_f: number;
    temp_min_f: number;
    humidity_avg_pct?: number;
    precip_in: number;
    frost_flag?: boolean;
    heat_flag?: boolean;
}

export async function getPlantHistory(sessionId: string): Promise<TimelineEvent[]> {
    const events: TimelineEvent[] = [];

    // Validate Session ID
    if (!sessionId || sessionId === "null" || sessionId === "undefined") {
        console.warn("Invalid Session ID passed to getPlantHistory:", sessionId);
        return [];
    }

    console.log(`Debug: getPlantHistory (v2-fix) for session ${sessionId}`);

    // 1. Fetch Session Details (Planted Date, Zip)
    // We use explicit casting to unknown then SessionData because Supabase types might be out of sync
    const { data: rawSession, error: sessionError } = await supabase
        .from('care_sessions')
        .select(`
            *,
            care_categories(key, label),
            store_skus(display_name),
            store_name,
            purchase_date,
            starter_size
        `)
        .eq('id', sessionId)
        .single();

    if (sessionError || !rawSession) {
        console.error("Failed to fetch session", JSON.stringify(sessionError, null, 2));
        return [];
    }

    // Force cast to our interface
    const session = rawSession as unknown as SessionData;

    const plantedDate = session.received_at || session.created_at; // Fallback
    const plantedISO = new Date(plantedDate).toISOString().split('T')[0];
    const zip = session.zip;

    // EVENT: Planted
    events.push({
        date: plantedISO,
        type: 'PLANTED',
        title: 'Plant Received',
        description: `Added to garden. Location: ${zip || 'Unknown'}.`,
        severity: 'info',
        icon: '🌱',
        metadata: {
            store: session.store_name,
            purchaseDate: session.purchase_date,
            size: session.starter_size,
            skuName: session.store_skus?.display_name,
            categoryName: session.care_categories?.label
        }
    });

    // 2. Fetch Care Logs
    const { data: rawLogs } = await supabase
        .from('care_logs')
        .select('*')
        .eq('care_session_id', sessionId);

    if (rawLogs) {
        // Cast logs
        const logs = rawLogs as unknown as CareLog[];

        logs.forEach((log) => {
            let desc = log.note || "";
            if (log.soil_moisture) desc += ` Soil: ${log.soil_moisture}.`;
            if (log.pest_detected) desc += ` Pest Detected!`;

            events.push({
                date: log.log_date,
                type: 'LOG',
                title: `${log.action_type} - ${log.status}`,
                description: desc,
                severity: log.status === 'CRITICAL' ? 'critical' : log.status === 'CONCERN' ? 'warning' : 'success',
                icon: log.action_type === 'Water' ? '💧' : log.action_type === 'Fertilize' ? '🧪' : '📝'
            });
        });
    }

    // 3. Fetch Outcomes
    const { data: rawOutcomes } = await supabase
        .from('care_outcomes')
        .select('*')
        .eq('care_session_id', sessionId);

    if (rawOutcomes) {
        const outcomes = rawOutcomes as unknown as CareOutcome[];

        outcomes.forEach((out) => {
            const date = new Date(out.outcome_at).toISOString().split('T')[0];
            events.push({
                date: date,
                type: 'OUTCOME',
                title: `Lifecycle Concluded: ${out.outcome_type.replace('_', ' ')}`,
                description: `Source: ${out.source}. Confidence: ${out.confidence}. Note: ${out.notes || 'None'}`,
                severity: out.outcome_type === 'success' ? 'success' : 'critical',
                icon: out.outcome_type === 'success' ? '🏆' : '🏁'
            });
        });
    }

    // 4. Fetch Detailed Weather History (Use Zip)
    if (zip) {
        const { data: rawWeather } = await (supabase.from('weather_observations_daily') as any)
            .select('*')
            .eq('zip', zip)
            .gte('date', plantedISO);

        if (rawWeather) {
            const weather = rawWeather as unknown as WeatherObservation[];

            // Deduplicate by date (take first observation per day)
            const uniqueDays = new Map<string, WeatherObservation>();
            weather.forEach((d) => {
                if (!uniqueDays.has(d.date)) uniqueDays.set(d.date, d);
            });

            uniqueDays.forEach((day) => {
                // Significance Logic
                if (day.frost_flag) {
                    events.push({
                        date: day.date,
                        type: 'WEATHER',
                        title: 'Frost Event ❄️',
                        description: `Temp dropped to ${day.temp_min_f}°F. Frost Risk.`,
                        severity: 'critical',
                        icon: '❄️'
                    });
                } else if (day.heat_flag) {
                    events.push({
                        date: day.date,
                        type: 'WEATHER',
                        title: 'Extreme Heat ☀️',
                        description: `Temp reached ${day.temp_max_f}°F. Heat Risk.`,
                        severity: 'warning',
                        icon: '☀️'
                    });
                } else {
                    // Normal Daily Logic (Requested Feature)
                    // We add it as info, perhaps less prominent in UI via description
                    events.push({
                        date: day.date,
                        type: 'WEATHER',
                        title: `Weather: ${day.temp_max_f}° / ${day.temp_min_f}°`,
                        description: `humidity: ${day.humidity_avg_pct || '?'}%.`,
                        severity: 'info',
                        icon: day.precip_in > 0 ? '🌧️' : '☁️'
                    });
                }
            });
        }
    }

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Helper to conclude session
export async function concludeCareSession(payload: {
    sessionId: string;
    storeId: string;
    type: string;
    source: string;
    confidence: string;
    notes?: string;
}) {
    let { sessionId, storeId } = payload;
    const { type, source, confidence, notes } = payload;

    // Robustness: If storeId is missing (000... constant or empty), try to fetch it from session
    if (!storeId || storeId === '00000000-0000-0000-0000-000000000000') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: rawSession } = await supabase
            .from('care_sessions')
            .select('store_id')
            .eq('id', sessionId)
            .single();

        const session = rawSession as unknown as SessionData;

        if (session && session.store_id) {
            storeId = session.store_id; // Will use inferred type
        }
    }

    // 1. Insert Outcome
    const { error: outcomeError } = await supabase
        .from('care_outcomes')
        .insert({
            care_session_id: sessionId,
            store_id: storeId,
            outcome_type: type,
            source: source,
            confidence: confidence,
            notes: notes
        } as any); // Cast insert as any to bypass strict type check on table existence if needed

    if (outcomeError) throw outcomeError;
    return true;
}
