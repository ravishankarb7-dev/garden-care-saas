
// Native fetch used

async function test() {
    try {
        console.log("Testing Agent with Stabilization Layer...");
        // Mocking a Rose (Deciduous Shrub) in a generic zip
        const res = await fetch('http://localhost:3000/api/agent/care', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plantId: 'rose-knockout', zip: '90210' })
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

// Check for native fetch
if (!globalThis.fetch) {
    console.error("Node 18+ required for native fetch or install node-fetch");
} else {
    test();
}
