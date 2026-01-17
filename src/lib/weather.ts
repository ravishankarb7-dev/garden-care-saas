
// Types for NWS API and Internal Use

export interface WeatherData {
    temp: number;
    condition: string; // "Sunny", "Cloudy", "Rain", etc.
    description: string;
    iconCode: string; // We'll map this to Lucide icons
    humidity: number;
    windSpeed: number;
    city: string;
    alerts: WeatherAlert[];
}

export interface WeatherAlert {
    id: string;
    event: string; // "Frost Advisory", "Severe Thunderstorm Warning"
    headline: string;
    description: string;
    severity: string; // "Severe", "Moderate", "Minor"
    urgency: string; // "Immediate", "Expected"
    instruction: string; // "Cover plants..."
}

// Zippopotam Response
export interface GeoResponse {
    "post code": string;
    "places": {
        "place name": string;
        "longitude": string;
        "latitude": string;
        "state abbreviation": string;
    }[];
}

// NWS Points Response
export interface NWSPointsResponse {
    properties: {
        gridId: string;
        gridX: number;
        gridY: number;
        forecast: string; // URL
        forecastHourly: string; // URL
        relativeLocation: {
            properties: {
                city: string;
                state: string;
            }
        }
    }
}

// NWS Grid Forecast Response
export interface NWSForecastResponse {
    properties: {
        periods: {
            number: number;
            name: string;
            startTime: string;
            endTime: string;
            isDaytime: boolean;
            temperature: number;
            temperatureUnit: string;
            temperatureTrend: string;
            windSpeed: string;
            windDirection: string;
            icon: string;
            shortForecast: string;
            detailedForecast: string;
        }[];
    }
}

// NWS Alerts Response
export interface NWSAlertsResponse {
    features: {
        id: string;
        properties: {
            event: string;
            headline: string;
            description: string;
            severity: string;
            urgency: string;
            instruction: string;
        }
    }[];
}


/**
 * Maps NWS Icon URLs to a simplified internal code
 * Example: https://api.weather.gov/icons/land/day/sct?size=medium -> "cloudy"
 */
export function mapNWSIconToCode(iconUrl: string): string {
    if (!iconUrl) return "unknown";

    // NWS icons structure: .../land/day/tsra_sct...
    // key codes: skc (clear), few, sct, bkn, ovc (overcast), rain, snow, tsra (thunder)

    const lower = iconUrl.toLowerCase();

    if (lower.includes('tsra') || lower.includes('lightning')) return 'thunder';
    if (lower.includes('rain') || lower.includes('shower') || lower.includes('drizzle')) return 'rain';
    if (lower.includes('snow') || lower.includes('ice') || lower.includes('sleet') || lower.includes('blizzard')) return 'snow';
    if (lower.includes('fog') || lower.includes('haze') || lower.includes('smoke')) return 'fog';
    if (lower.includes('ovc') || lower.includes('bkn')) return 'cloudy'; // Broken/Overcast
    if (lower.includes('few') || lower.includes('sct')) return 'partly-cloudy'; // Scattered
    if (lower.includes('skc') || lower.includes('clear')) return 'clear';
    if (lower.includes('hot')) return 'clear';

    return 'unknown';
}

const USER_AGENT = '(garden-care-app, contact@example.com)';

export async function getWeatherData(zip: string): Promise<WeatherData> {
    console.log(`[WeatherLib] Fetching data for zip: ${zip}`);

    // 1. Geocode Zip -> Lat/Lon (Zippopotam - Free)
    const geoRes = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!geoRes.ok) {
        throw new Error('Invalid Zip Code');
    }
    const geoData: GeoResponse = await geoRes.json();

    if (!geoData.places || geoData.places.length === 0) {
        throw new Error('Zip code not found');
    }

    const lat = geoData.places[0].latitude;
    const lon = geoData.places[0].longitude;
    const city = geoData.places[0]['place name'];

    console.log(`[WeatherLib] Resolved ${zip} to ${city} (${lat}, ${lon})`);

    // 2. Get NWS Grid Points (Metadata)
    const pointsRes = await fetch(`https://api.weather.gov/points/${lat},${lon}`, {
        headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/geo+json' }
    });

    if (!pointsRes.ok) {
        throw new Error('Weather unavailable for this location (NWS Points failed)');
    }

    const pointsData: NWSPointsResponse = await pointsRes.json();
    const { forecast, gridId, gridX, gridY } = pointsData.properties;

    // 3. Parallel Fetch: Forecast + Alerts
    const alertsUrl = `https://api.weather.gov/alerts/active?point=${lat},${lon}`;

    const [forecastRes, alertsRes] = await Promise.all([
        fetch(forecast, { headers: { 'User-Agent': USER_AGENT } }),
        fetch(alertsUrl, { headers: { 'User-Agent': USER_AGENT } })
    ]);

    if (!forecastRes.ok) {
        throw new Error('Forecast unavailable (NWS Forecast failed)');
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

    return {
        temp: currentPeriod.temperature,
        condition: currentPeriod.shortForecast,
        description: currentPeriod.detailedForecast,
        iconCode: mapNWSIconToCode(currentPeriod.icon),
        humidity: 0,
        windSpeed: parseInt(currentPeriod.windSpeed.split(' ')[0]) || 0,
        city: city,
        alerts: alerts
    };
}
