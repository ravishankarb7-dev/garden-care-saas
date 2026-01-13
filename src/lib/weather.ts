import { WeatherAlert } from "./types";

// Mock implementation: Deterministic based on generic zip logic for demo
// Real implementation would fetch from OpenWeatherMap etc.
export async function getWeatherAlert(location: string): Promise<WeatherAlert> {
    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simple hash for demo string input
    const val = location.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);

    if (val % 3 === 0) {
        return {
            type: "frost",
            message: "Frost Advisory: Cover sensitive plants tonight!",
            severity: "high",
        };
    } else if (val % 3 === 1) {
        return {
            type: "heat",
            message: "Heat Wave: Water extra early in the morning.",
            severity: "medium",
        };
    }

    return {
        type: "none",
        message: "Weather looks good for gardening.",
        severity: "low",
    };
}
