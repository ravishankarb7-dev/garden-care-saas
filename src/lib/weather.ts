
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
