/**
 * Pure functions for Gamification Logic.
 * Decoupled from database for unit testing.
 */

// Level Curve
export const LEVEL_THRESHOLDS = [
    { level: 1, min: 0, max: 200 },
    { level: 2, min: 200, max: 600 },
    { level: 3, min: 600, max: 1500 },
    { level: 4, min: 1500, max: 2500 },
    { level: 5, min: 2500, max: Infinity },
];

export function calculateLevel(xp: number): number {
    if (xp < 0) return 1; // Safety
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (xp >= LEVEL_THRESHOLDS[i].min) {
            return LEVEL_THRESHOLDS[i].level;
        }
    }
    return 1;
}

export function calculateWordCountXP(note: string | null | undefined): number {
    if (!note || !note.trim()) return 0; // No note, no quality bonus (only base)

    // Simple whitespace split
    const words = note.trim().split(/\s+/).filter(w => w.length > 0).length;

    if (words >= 20) return 40; // Master Entry
    if (words >= 5) return 20;  // Field Report
    return 5;                   // Scribble
}

/**
 * Calculates new streak based on activity dates.
 * @param currentStreak Current streak count
 * @param lastActiveDate ISO Date string YYYY-MM-DD
 * @param todayDate ISO Date string YYYY-MM-DD
 */
export function calculateNewStreak(
    currentStreak: number,
    lastActiveDate: string | null,
    todayDate: string
): number {
    // If no history, it's day 1
    if (!lastActiveDate) return 1;

    // If already active today, streak doesn't change
    if (lastActiveDate === todayDate) return currentStreak;

    // Check if last active was yesterday
    const yesterday = new Date(todayDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActiveDate === yesterdayStr) {
        return currentStreak + 1;
    }

    // Otherwise, streak broken
    return 1;
}
