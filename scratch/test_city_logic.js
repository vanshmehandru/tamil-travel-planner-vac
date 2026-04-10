const TRAVEL_TYPES = {
  train: ['ரயில்', 'train', 'ரெயில்', 'express', 'எக்ஸ்பிரஸ்', 'மெயில்'],
  bus: ['பஸ்', 'bus', 'பேருந்து', 'ஓமினி', 'omni'],
  flight: ['விமானம்', 'flight', 'ஏர்', 'air', 'fly', 'plane'],
};

const CITY_MAP = {
  'சென்னை': 'MAS', 'madras': 'MAS', 'chennai': 'MAS',
  'கோவை': 'CBE', 'coimbatore': 'CBE', 'kovai': 'CBE', 'கோயம்புத்தூர்': 'CBE', 'கோயமுத்தூர்': 'CBE', 'CBE': 'CBE', 'coimb': 'CBE',
  'மதுரை': 'MDU', 'madurai': 'MDU', 'MDU': 'MDU',
};

const TAMIL_MONTHS = {
  5: ['மே', 'may'],
};

const TO_MARKERS = ['வரை', 'க்கு', 'to', 'செல்ல', 'போக', 'போகணும்', 'போகனும'];

const parseTamilInputLegacy = (text) => {
  const result = { source: null, destination: null, date: null, passengers: 1 };
  const lower = text.toLowerCase();
  
  const allMatches = [];
  for (const [name, code] of Object.entries(CITY_MAP)) {
    const pos = lower.indexOf(name.toLowerCase());
    if (pos !== -1) {
      allMatches.push({ name, code, position: pos });
    }
  }

  const codeTracker = new Set();
  const uniqueCities = allMatches
    .sort((a, b) => a.position - b.position)
    .filter(m => {
      const key = `${m.code}`;
      if (codeTracker.has(key)) return false;
      codeTracker.add(key);
      return true;
    });

  console.log('Detected cities:', uniqueCities);

  if (uniqueCities.length >= 2) {
    result.source = uniqueCities[0].code;
    result.destination = uniqueCities[1].code;
  } else if (uniqueCities.length === 1) {
    const pos = uniqueCities[0].position;
    const beforeOrAfterCity = lower.substring(Math.max(0, pos - 10), Math.min(lower.length, pos + 20));
    const isTo = TO_MARKERS.some(m => beforeOrAfterCity.includes(m));
    if (isTo) result.destination = uniqueCities[0].code;
    else result.source = uniqueCities[0].code;
  }

  return result;
};

const input = "எனக்கு 10 மே 2026 அன்று சென்னையிலிருந்து கோயம்புத்தூருக்கு ரயில் டிக்கெட் முன்பதிவு செய்ய வேண்டும்.";
console.log('Result for input:', parseTamilInputLegacy(input));
