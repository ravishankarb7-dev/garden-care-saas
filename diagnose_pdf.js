
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function run() {
    const p = path.join(process.cwd(), 'src', 'docs', '28_Day_Stabilization_Primary_Advisory_v2.pdf');
    console.log(`Checking: ${p}`);

    if (!fs.existsSync(p)) {
        console.error("File does not exist!");
        return;
    }

    const stats = fs.statSync(p);
    console.log(`Size: ${stats.size} bytes`);

    try {
        const buffer = fs.readFileSync(p);
        // Check header
        console.log(`Header: ${buffer.toString('utf8', 0, 5)}`);

        console.log("Attempting parse...");
        const data = await pdf(buffer);
        console.log(`Text Length: ${data.text ? data.text.length : 0}`);
        console.log(`Preview: ${data.text ? data.text.slice(0, 200) : 'NULL'}`);
    } catch (e) {
        console.error("Parse Error:", e);
    }
}

run();
