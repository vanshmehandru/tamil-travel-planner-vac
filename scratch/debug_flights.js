const fs = require('fs');
const content = fs.readFileSync('backend/src/data/seed.js', 'utf8');

const flightRegex = /\{[\s\S]*?type:\s*'flight'[\s\S]*?\}/g;
const flights = content.match(flightRegex);

if (flights) {
    flights.forEach((f, i) => {
        console.log(`--- Flight ${i + 1} ---`);
        console.log(f);
    });
} else {
    console.log('No flights found');
}
