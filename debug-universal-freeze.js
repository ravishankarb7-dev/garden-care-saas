
// Native fetch used

async function testCategory(id, name, zip) {
    try {
        console.log(`\nTesting ${name} (${id}) in Zip ${zip}...`);

        const res = await fetch('http://localhost:3000/api/agent/care', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plantId: id, zip: zip })
        });

        if (!res.ok) {
            console.error("Error:", res.status, await res.text());
            return;
        }

        const data = await res.json();
        console.log(`[AGENT Advice for ${name}]: ${data.narrative}`);

    } catch (e) {
        console.error(e);
    }
}

async function run() {
    // Test 1: Vegetable (Tomato) in Freezing (30041)
    await testCategory('plant_vegetable_start', 'Vegetable Start', '30041');

    // Test 2: Evergreen Shrub in Freezing (30041) - Should also get survival advice, NOT "water deep"
    await testCategory('shrub_evergreen', 'Evergreen Shrub', '30041');

    // Test 3: Annual Flower in Freezing (30041) - Should be told it will die/bring inside
    await testCategory('plant_annual_flowering', 'Annual Flower', '30041');
}

run();
