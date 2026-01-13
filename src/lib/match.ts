import { Plant } from "./types";

/**
 * Calculates the Levenshtein distance between two strings.
 * Lower distance means strings are more similar.
 */
function levenshteinDistance(a: string, b: string): number {
    const matrix = [];

    // Increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // Increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Finds plants that match the query with some tolerance for spelling errors.
 * Returns sorted list of matches, best first.
 */
export function findMatchingPlants(query: string, plants: Plant[], maxDistance: number = 3): Plant[] {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return [];

    const matches = plants.map(plant => {
        const name = plant.name.toLowerCase();
        const botanical = plant.botanicalName ? plant.botanicalName.toLowerCase() : "";

        // Check for direct substring matches first (score 0 = perfect match)
        if (name.includes(normalizedQuery) || botanical.includes(normalizedQuery)) {
            // Prioritize exact starts-with matches slightly higher effectively
            const isStart = name.startsWith(normalizedQuery) || botanical.startsWith(normalizedQuery);
            return {
                plant,
                distance: isStart ? 0 : 0.5 // 0.5 ensures included strings come before generic fuzzy matches
            };
        }

        const nameDist = levenshteinDistance(normalizedQuery, name);
        const botanicalDist = botanical ? levenshteinDistance(normalizedQuery, botanical) : 100;

        const bestDist = Math.min(nameDist, botanicalDist);

        return {
            plant,
            distance: bestDist
        };
    });

    // Filter by max distance and sort by closest match
    return matches
        .filter(m => m.distance <= maxDistance || m.distance < 1) // Keep exact/substring matches
        .sort((a, b) => a.distance - b.distance)
        .map(m => m.plant);
}
