"use client";

const STORAGE_KEY = "garden_device_identifier";

/**
 * Generates a random 4-character alphanumeric code (uppercase).
 * Excludes confusing characters like '0', 'O', '1', 'I' if desired, 
 * but for now we'll stick to simple A-Z 0-9 for max entropy in small space.
 */
export function generateGardenCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed I, 1, 0, O for clarity
    let result = "";
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Retrieves the existing device ID (Garden Code) from local storage,
 * or generates a new one if it doesn't exist.
 */
export function getOrCreateDeviceId(): string {
    if (typeof window === "undefined") return ""; // SSR safety

    // 1. Try Local Storage
    let deviceId = localStorage.getItem(STORAGE_KEY);

    // 2. Try Cookie
    if (!deviceId) {
        const match = document.cookie.match(new RegExp('(^| )' + STORAGE_KEY + '=([^;]+)'));
        if (match) {
            deviceId = match[2];
            // Restore to LS
            localStorage.setItem(STORAGE_KEY, deviceId);
        }
    }

    // 3. Generate New
    if (!deviceId) {
        deviceId = generateGardenCode();
        saveDeviceId(deviceId); // Save to both
    }

    return deviceId;
}

export function saveDeviceId(id: string) {
    if (typeof window === "undefined") return;

    // Save to LS
    localStorage.setItem(STORAGE_KEY, id);

    // Save to Cookie (1 year)
    const date = new Date();
    date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
    document.cookie = `${STORAGE_KEY}=${id}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
}

/**
 * Validates format of a garden code (4 chars, alphanumeric)
 */
export function isValidGardenCode(code: string): boolean {
    return /^[A-Z0-9]{4}$/i.test(code);
}

// --- History Management ---

const HISTORY_KEY = "my_garden_history";

export interface SavedGarden {
    id: string;
    label: string; // e.g. "Zip 90210" or "Garden ABCD"
    lastAccessed: string;
}

export function getGardenHistory(): SavedGarden[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveGardenToHistory(id: string, label?: string) {
    if (typeof window === "undefined") return;

    const history = getGardenHistory();
    const now = new Date().toISOString();

    // Check if exists
    const existingIndex = history.findIndex(g => g.id === id);

    if (existingIndex >= 0) {
        // Update timestamp (and label if provided)
        history[existingIndex].lastAccessed = now;
        if (label) history[existingIndex].label = label;
    } else {
        // Add new
        history.push({
            id,
            label: label || `Garden ${id}`,
            lastAccessed: now
        });
    }

    // Sort by most recently accessed
    history.sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime());

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

/**
 * Searches the local history to see if we already have a garden ID associatd with this Zip Code.
 * This prevents creating multiple IDs for the same Zip on the same device.
 */
export function findGardenIdByZip(zip: string): string | null {
    if (typeof window === "undefined") return null;
    const history = getGardenHistory();
    // Look for labels like "Zip 30041" or just containing "30041"
    const match = history.find(g => g.label.includes(zip));
    return match ? match.id : null;
}
