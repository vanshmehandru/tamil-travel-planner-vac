const fs = require('fs');
const content = fs.readFileSync('backend/src/data/seed.js', 'utf8');

const sourceRegex = /source:\s*['"](.*?)['"]/g;
const destRegex = /destination:\s*['"](.*?)['"]/g;

const sources = new Set();
const dests = new Set();

let m;
while ((m = sourceRegex.exec(content)) !== null) {
    sources.add(m[1]);
}

while ((m = destRegex.exec(content)) !== null) {
    dests.add(m[1]);
}

console.log('Sources:', Array.from(sources));
console.log('Destinations:', Array.from(dests));
