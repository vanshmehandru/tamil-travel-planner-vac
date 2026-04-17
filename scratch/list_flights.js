const fs = require('fs');
const content = fs.readFileSync('backend/src/data/seed.js', 'utf8');

// Use a regex to find flight objects
const flightRegex = /\{[\s\S]*?type:\s*'flight'[\s\S]*?\}/g;
const flights = content.match(flightRegex);

if (flights) {
    flights.forEach((f, i) => {
        const sourceMatch = f.match(/source:\s*['"](.*?)['"]/);
        const destMatch = f.match(/destination:\s*['"](.*?)['"]/);
        console.log(`Flight ${i + 1}: ${sourceMatch ? sourceMatch[1] : 'unknown'} -> ${destMatch ? destMatch[1] : 'unknown'}`);
    });
} else {
    console.log('No flights found');
}
