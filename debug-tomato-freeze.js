
// Native fetch used

async function test() {
    try {
        console.log("Testing Tomato in Winter (Zip 30041)...");

        // We need to verify what the agent outputs. 
        // Note: We are hitting the local API. The API fetches real weather.
        // If the REAL weather in 30041 isn't freezing right now, this test might be misleading.
        // However, I can't easily mock the weather *inside* the API from here without code changes.
        // Let's first see what the agent says with REAL weather.

        const res = await fetch('http://localhost:3000/api/agent/care', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plantId: 'plant_vegetable_start', zip: '30041' })
        });

        if (!res.ok) {
            console.error("Error:", res.status, await res.text());
            return;
        }

        const data = await res.json();
        console.log("\n--- AGENT RESPONSE ---");
        console.log(data.narrative);
        console.log("----------------------\n");

    } catch (e) {
        console.error(e);
    }
}

test();
