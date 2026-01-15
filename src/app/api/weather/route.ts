
import { NextResponse } from 'next/server';
import {
    GeoResponse,
    NWSPointsResponse,
    NWSForecastResponse,
    NWSAlertsResponse,
    WeatherData,
    mapNWSIconToCode
} from '@/lib/weather';

export const dynamic = 'force-dynamic'; // Prevent caching so alerts are fresh

// Generic User Agent (Required by NWS)
const USER_AGENT = '(garden-care-app, contact@example.com)';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const zip = searchParams.get('zip');

    if (!zip) {
        return NextResponse.json({ error: 'Zip code is required' }, { status: 400 });
    }

    try {
        console.log(`[Weather] Fetching data for zip: ${zip}`);

        // 1. Geocode Zip -> Lat/Lon (Zippopotam - Free)
        const geoRes = await fetch(`https://api.zippopotam.us/us/${zip}`);
        if (!geoRes.ok) {
            console.error('[Weather] Zippopotam failed:', geoRes.status);
            return NextResponse.json({ error: 'Invalid Zip Code' }, { status: 404 });
        }
        const geoData: GeoResponse = await geoRes.json();

        if (!geoData.places || geoData.places.length === 0) {
            return NextResponse.json({ error: 'Zip code not found' }, { status: 404 });
        }

        const lat = geoData.places[0].latitude;
        const lon = geoData.places[0].longitude;
        const city = geoData.places[0]['place name'];

        console.log(`[Weather] Resolved ${zip} to ${city} (${lat}, ${lon})`);

        // 2. Get NWS Grid Points (Metadata)
        // Must accept generic application/geo+json for NWS
        const pointsRes = await fetch(`https://api.weather.gov/points/${lat},${lon}`, {
            headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/geo+json' }
        });

        if (!pointsRes.ok) {
            console.error('[Weather] NWS Points failed:', pointsRes.status, await pointsRes.text());
            return NextResponse.json({ error: 'Weather unavailable for this location' }, { status: 502 });
        }

        const pointsData: NWSPointsResponse = await pointsRes.json();
        const { forecast, gridId, gridX, gridY } = pointsData.properties;

        // 3. Parallel Fetch: Forecast + Alerts
        const alertsUrl = `https://api.weather.gov/alerts/active?point=${lat},${lon}`;

        console.log(`[Weather] Fetching Forecast: ${forecast}`);
        console.log(`[Weather] Fetching Alerts: ${alertsUrl}`);

        const [forecastRes, alertsRes] = await Promise.all([
            fetch(forecast, { headers: { 'User-Agent': USER_AGENT } }),
            fetch(alertsUrl, { headers: { 'User-Agent': USER_AGENT } })
        ]);

        if (!forecastRes.ok) {
            console.error('[Weather] NWS Forecast failed:', forecastRes.status);
            return NextResponse.json({ error: 'Forecast unavailable' }, { status: 502 });
        }

        const forecastData: NWSForecastResponse = await forecastRes.json();
        const currentPeriod = forecastData.properties.periods[0]; // Current timeframe

        // Process Alerts (Graceful degradation if alerts fail)
        let alerts: any[] = [];
        if (alertsRes.ok) {
            const alertsData: NWSAlertsResponse = await alertsRes.json();
            if (alertsData.features && alertsData.features.length > 0) {
                alerts = alertsData.features.map(f => ({
                    id: f.id,
                    event: f.properties.event,
                    headline: f.properties.headline,
                    description: f.properties.description,
                    severity: f.properties.severity,
                    urgency: f.properties.urgency,
                    instruction: f.properties.instruction
                }));
            }
        }



        const response: WeatherData = {
            temp: currentPeriod.temperature,
            condition: currentPeriod.shortForecast,
            description: currentPeriod.detailedForecast,
            iconCode: mapNWSIconToCode(currentPeriod.icon),
            humidity: 0, // NWS Grid data doesn't prioritize humidity in current period summary, keeping 0 or separate fetch if critical
            windSpeed: parseInt(currentPeriod.windSpeed.split(' ')[0]) || 0,
            city: city, // From Zippopotam
            alerts: alerts
        };

        return NextResponse.json(response);

    } catch (error: any) {
        console.error('[Weather] Internal Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
