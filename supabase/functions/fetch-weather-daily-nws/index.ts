
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Init Supabase (Service Role)
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabase = createClient(supabaseUrl, supabaseKey)

        console.log('[WeatherJob] Starting daily weather fetch...')

        // 2. Get distinct active ZIPs
        const { data: locations, error: locError } = await supabase
            .from('care_sessions')
            .select('store_id, zip')
            .not('zip', 'is', null)
            .filter('zip', 'neq', '')

        if (locError) throw locError

        // Unique Map: "store_id:zip" -> { store_id, zip } 
        // (To avoid duplicate fetches if multiple users share a zip/store)
        const uniqueLocs = new Map()
        locations.forEach(loc => {
            const key = `${loc.store_id}:${loc.zip}`
            uniqueLocs.set(key, loc)
        })

        console.log(`[WeatherJob] Found ${uniqueLocs.size} unique locations to update.`)

        const results = []

        for (const [key, loc] of uniqueLocs) {
            const { store_id, zip } = loc
            try {
                // 3. Geocode (Cache Check)
                let lat, lon
                const { data: cached } = await supabase
                    .from('zip_geocodes')
                    .select('*')
                    .eq('zip', zip)
                    .single()

                if (cached) {
                    lat = cached.lat
                    lon = cached.lon
                    console.log(`[${zip}] Cache hit: ${lat}, ${lon}`)
                } else {
                    console.log(`[${zip}] Geocoding...`)
                    const geoRes = await fetch(`https://api.zippopotam.us/us/${zip}`)
                    if (!geoRes.ok) throw new Error('Invalid Zip')
                    const geoData = await geoRes.json()
                    lat = geoData.places[0].latitude
                    lon = geoData.places[0].longitude

                    // Cache it
                    await supabase.from('zip_geocodes').upsert({ zip, lat, lon })
                }

                // 4. Fetch NWS Data
                // Get Grid Points
                const pointsRes = await fetch(`https://api.weather.gov/points/${lat},${lon}`, {
                    headers: { 'User-Agent': '(garden-care-app, contact@example.com)' }
                })
                if (!pointsRes.ok) throw new Error('NWS Points Failed')
                const pointsData = await pointsRes.json()
                const forecastUrl = pointsData.properties.forecast

                // Get Forecast
                const forecastRes = await fetch(forecastUrl, {
                    headers: { 'User-Agent': '(garden-care-app, contact@example.com)' }
                })
                if (!forecastRes.ok) throw new Error('NWS Forecast Failed')
                const forecastData = await forecastRes.json()

                // Extract Today's Data (Period 0 is usually "Today" or "Tonight")
                // We want the *Daytime* period if possible for max temp, but this is a scheduled job running at 2am.
                // If running at 2am, Period 0 is "Overnight" or "Today".
                // Implementation constraint for MVP: Just grab the first period as representative.
                // A more robust implementation would iterate periods to find today's max/min.
                const period = forecastData.properties.periods[0]

                const isDay = period.isDaytime
                const temp = period.temperature

                // Heuristic for daily min/max if we only have one point provided by "Current Forecast"
                // Start with current temp as both, logic can be refined later with history API
                let temp_min_f = temp
                let temp_max_f = temp

                // Alerts Check (Optional enhancement from pointsData, skipping for strict MVP to match previous logic)

                const frost_flag = temp_min_f <= 32
                const heat_flag = temp_max_f >= 90

                // 5. Upsert Observation
                const today = new Date().toISOString().split('T')[0]

                const { error: upsertError } = await supabase
                    .from('weather_observations_daily')
                    .upsert({
                        store_id,
                        zip,
                        date: today,
                        temp_min_f,
                        temp_max_f,
                        precip_in: 0, // NWS Forecast doesn't always give distinct precip inches easily in this endpoint
                        frost_flag,
                        heat_flag,
                        raw_payload: period,
                        source_provider: 'NWS'
                    }, { onConflict: 'store_id, zip, date' })

                if (upsertError) throw upsertError

                results.push({ zip, status: 'ok' })

            } catch (e: any) {
                console.error(`[${zip}] Failed: ${e.message}`)
                results.push({ zip, status: 'error', error: e.message })
            }
        }

        return new Response(JSON.stringify({ success: true, results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
