
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(__dirname, '../.env.local') });

import { getPlants, getPlantById } from '../src/lib/queries';

async function main() {
    console.log("--- 1. Fetching All Plants ---");
    const plants = await getPlants();
    console.log(`Found ${plants.length} plants.`);

    // Find a SKU-based plant (one with a dash usually, or check logic)
    // We know 'vegetable-starts' is a category.
    // Let's look for something that ISN'T a basic category key.
    const skuPlant = plants.find(p => p.id !== 'vegetable-starts' && p.name.includes("Tomato"));

    if (!skuPlant) {
        console.error("Could not find a 'Tomato' plant to test.");
        // print all names
        plants.forEach(p => console.log(`- ${p.name} (${p.id})`));
        return;
    }

    console.log(`\n--- 2. Testing Lookup for SKU: ${skuPlant.name} (ID: ${skuPlant.id}) ---`);
    const resolved = await getPlantById(skuPlant.id);

    if (resolved) {
        console.log("✅ RESOLVED SUCCESSFULLY");
        console.log("Name:", resolved.name);
        console.log("Parent Category UUID:", resolved.uuid);
        console.log("Schedule Items:", resolved.careSchedule.length);
        console.log("First Task:", resolved.careSchedule[0]);
    } else {
        console.error("❌ FAILED TO RESOLVE");
    }
}

main().catch(console.error);
