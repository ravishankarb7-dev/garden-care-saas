
import { WeatherData, WeatherAlert } from "./weather";

export interface GardeningContext {
    headline: string;
    subtext: string;
    action?: string;
    type: 'success' | 'warning' | 'error' | 'info';
}

/**
 * Filter out alerts that are irrelevant to gardening.
 * e.g. Marine, Traffic, Bridge Wind, Rip Current
 */
export function filterIrrelevantAlerts(alerts: WeatherAlert[]): WeatherAlert[] {
    const IGNORE_KEYWORDS = [
        "marine", "beach", "surf", "rip current", "small craft", "gale",
        "traffic", "bridge", "driving", "transit", "highway"
    ];

    return alerts.filter(a => {
        const text = (a.event + " " + a.description).toLowerCase();
        // If it's specifically about "Fire Weather" or "Wind" for land, keep it.
        // But remove specific marine/transit ones.
        return !IGNORE_KEYWORDS.some(k => text.includes(k));
    });
}

/**
 * Generates a gardening-specific advice/context based on weather conditions.
 */
export function getGardeningContext(weather: WeatherData): GardeningContext {
    // 1. Process Alerts (Filtered)
    const validAlerts = filterIrrelevantAlerts(weather.alerts || []);
    const priorityAlert = validAlerts.length > 0 ? validAlerts[0] : null;

    if (priorityAlert) {
        // Rewrite specific known alert types
        if (priorityAlert.event.includes("Freeze") || priorityAlert.event.includes("Frost")) {
            return {
                headline: "Freeze Risk Detected",
                subtext: "Temperatures are dropping dangerously low. Most plants will need protection tonight.",
                action: "Cover sensitive plants or bring pots indoors.",
                type: 'error'
            };
        }
        if (priorityAlert.event.includes("Heat")) {
            return {
                headline: "Extreme Heat Caution",
                subtext: "High temperatures can distress plants quickly.",
                action: "Water deeply in the morning. Provide shade if possible.",
                type: 'warning'
            };
        }
        if (priorityAlert.event.includes("Wind") || priorityAlert.event.includes("Tornado") || priorityAlert.event.includes("Hurricane")) {
            return {
                headline: "High Wind Alert",
                subtext: "Strong winds may damage tall plants or dry out soil.",
                action: "Secure tall plants. Check soil moisture.",
                type: 'warning'
            };
        }
        if (priorityAlert.event.includes("Fire")) {
            return {
                headline: "Fire Weather Watch",
                subtext: "Extremely dry conditions. Avoid any open flames or sparks near dry vegetation.",
                action: "Ensure clearing around structures.",
                type: 'warning'
            };
        }

        // Generic Alert Fallback
        return {
            headline: priorityAlert.event,
            subtext: priorityAlert.description ? priorityAlert.description.slice(0, 150) + "..." : "Severe weather reported.",
            type: 'warning'
        };
    }

    // 2. No Alerts - Analyze Conditions
    const { temp, condition, iconCode } = weather;

    // Cold
    if (temp < 40) {
        return {
            headline: "Cold Growing Conditions",
            subtext: "It's chilly. Growth will be slow and sensitive plants may need watching.",
            type: 'info'
        };
    }

    // Hot
    if (temp > 90) {
        return {
            headline: "High Heat Stress",
            subtext: "Plants lose water rapidly at these temperatures.",
            action: "Check moisture daily. Water deeply.",
            type: 'warning'
        };
    }

    // Rain
    if (iconCode === 'rain' || iconCode === 'thunder') {
        return {
            headline: "Nature is Watering",
            subtext: "Rain is in the forecast. You can likely skip manual watering today.",
            type: 'info' // Using info instead of success (blue-ish)
        };
    }

    // Good
    if (temp >= 60 && temp <= 85) {
        return {
            headline: "Optimal Growing Weather",
            subtext: "Conditions are great for photosynthesis and root growth.",
            type: 'success'
        };
    }

    // Default
    return {
        headline: "Normal Conditions",
        subtext: "No major weather impacts expected. Stick to your routine.",
        type: 'success'
    };
}
