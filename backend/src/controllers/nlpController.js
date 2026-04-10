const { parseTravelIntent } = require('../services/aiService');

// Tamil keyword maps (kept for fallback)
const TRAVEL_TYPES = {
  train: ['ரயில்', 'train', 'ரெயில்', 'express', 'எக்ஸ்பிரஸ்', 'மெயில்'],
  bus: ['பஸ்', 'bus', 'பேருந்து', 'ஓமினி', 'omni'],
  flight: ['விமானம்', 'flight', 'ஏர்', 'air', 'fly', 'plane'],
};

const CITY_MAP = {
  சென்னை: 'MAS', madras: 'MAS', chennai: 'MAS', madras: 'MAS',
  கோவை: 'CBE', 'கோயமு': 'CBE', 'கோயம்': 'CBE', 'கோயம்பு': 'CBE', coimbatore: 'CBE', kovai: 'CBE', கோயம்புத்தூர்: 'CBE', கோயமுத்தூர்: 'CBE', CBE: 'CBE', coimb: 'CBE',
  மதுரை: 'MDU', madurai: 'MDU', MDU: 'MDU',
  திருச்சி: 'TPJ', trichy: 'TPJ', திருச்சிராப்பள்ளி: 'TPJ', TPJ: 'TPJ',
  சேலம்: 'SA', salem: 'SA',
  வேலூர்: 'VLR', vellore: 'VLR',
  திருநெல்வேலி: 'TEN', tirunelveli: 'TEN', நெல்லை: 'TEN',
  நாகர்கோவில்: 'NCJ', nagercoil: 'NCJ',
  தஞ்சாவூர்: 'TJ', thanjavur: 'TJ',
  ஈரோடு: 'ED', erode: 'ED',
  புதுச்சேரி: 'PDY', pondicherry: 'PDY', பாண்டிச்சேரி: 'PDY',
  ஓட்டி: 'UAM', ooty: 'UAM', உதகமண்டலம்: 'UAM',
  பெங்களூர்: 'SBC', bangalore: 'SBC', பெங்களூரு: 'SBC',
};
const DATE_KEYWORDS = {
  today: ['இன்று', 'today', 'now', 'இன்னைக்கு'],
  tomorrow: ['நாளை', 'tomorrow', 'நாளைக்கு'],
  dayAfter: ['மறுநாள்', 'day after tomorrow', 'நாளை மறுநாள்'],
};
const TAMIL_NUMBERS = {
  1: ['ஒரு', 'ஒன்று', 'ஒன்னு', 'one'],
  2: ['இரண்டு', 'ரெண்டு', 'two'],
  3: ['மூன்று', 'மூனு', 'three'],
  4: ['நான்கு', 'நாலு', 'four'],
  5: ['ஐந்து', 'அஞ்சு', 'five'],
  6: ['ஆறு', 'six'],
};
const TAMIL_MONTHS = {
  1: ['ஜனவரி', 'january', 'jan'],
  2: ['பிப்ரவரி', 'february', 'feb'],
  3: ['மார்ச்', 'march', 'mar'],
  4: ['ஏப்ரல்', 'april', 'apr'],
  5: ['மே', 'may'],
  6: ['ஜூன்', 'june', 'jun'],
  7: ['ஜூலை', 'july', 'jul'],
  8: ['ஆகஸ்ட்', 'august', 'aug'],
  9: ['செப்டம்பர்', 'september', 'sep'],
  10: ['அக்டோபர்', 'october', 'oct'],
  11: ['நவம்பர்', 'november', 'nov'],
  12: ['டிசம்பர்', 'december', 'dec'],
};

// ... existing maps for fallback ...
const FROM_MARKERS = ['இருந்து', 'லிருந்து', 'from', 'புறப்பட', 'start'];
const TO_MARKERS = ['வரை', 'க்கு', 'to', 'செல்ல', 'போக', 'போகணும்', 'போகனும'];

const parseTamilInputLegacy = (text) => {
  const result = {
    source: null,
    destination: null,
    travelType: 'train',
    date: null,
    passengers: 1,
    confidence: 'low',
    rawInput: text,
  };

  const lower = text.toLowerCase();
  
  // Basic travel type detection
  for (const [type, keywords] of Object.entries(TRAVEL_TYPES)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      result.travelType = type;
      break;
    }
  }

  // Basic city detection
  const allMatches = [];
  for (const [name, code] of Object.entries(CITY_MAP)) {
    const pos = lower.indexOf(name.toLowerCase());
    if (pos !== -1) {
      allMatches.push({ name, code, position: pos });
    }
  }

  // Deduplicate matches by code (if same city mentioned multiple ways, keep the first one)
  const codeTracker = new Set();
  const uniqueCities = allMatches
    .sort((a, b) => a.position - b.position)
    .filter(m => {
      // Allow the same city if the positions are significantly different (mentioned twice)
      // Otherwise, deduplicate overlapping or redundant matches for the same location
      const key = `${m.code}`;
      if (codeTracker.has(key)) return false;
      codeTracker.add(key);
      return true;
    });

  if (uniqueCities.length >= 2) {
    result.source = uniqueCities[0].code;
    result.destination = uniqueCities[1].code;
  } else if (uniqueCities.length === 1) {
    // Check if it's a destination (ending in 'ku' markers)
    const pos = uniqueCities[0].position;
    const beforeOrAfterCity = lower.substring(Math.max(0, pos - 10), Math.min(lower.length, pos + 20));
    const isTo = TO_MARKERS.some(m => beforeOrAfterCity.includes(m));
    
    if (isTo) {
      result.destination = uniqueCities[0].code;
    } else {
      result.source = uniqueCities[0].code;
    }
  }

  console.log('Legacy Parser: Found Cities:', uniqueCities.map(c => `${c.name}(${c.code})`));

  // Passenger detection (Regex for "N பேர்" or keywords)
  for (const [num, keywords] of Object.entries(TAMIL_NUMBERS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      result.passengers = parseInt(num);
      break;
    }
  }
  const digitMatch = lower.match(/(\d+)\s*(பேர்|passengers|people|person)/);
  if (digitMatch) {
    result.passengers = Math.min(6, Math.max(1, parseInt(digitMatch[1])));
  }

  // Basic date detection
  const today = new Date();
  if (DATE_KEYWORDS.today.some(kw => lower.includes(kw))) {
    result.date = today.toISOString().split('T')[0];
  } else if (DATE_KEYWORDS.tomorrow.some(kw => lower.includes(kw))) {
    today.setDate(today.getDate() + 1);
    result.date = today.toISOString().split('T')[0];
  } else if (DATE_KEYWORDS.dayAfter.some(kw => lower.includes(kw))) {
    today.setDate(today.getDate() + 2);
    result.date = today.toISOString().split('T')[0];
  } else {
    // Regex for specific date like "10 மே" or "மே 10" or "10/5/2026"
    for (const [mIndex, keywords] of Object.entries(TAMIL_MONTHS)) {
      if (keywords.some(kw => lower.includes(kw))) {
        const monthNum = mIndex.padStart(2, '0');
        const dayMatch = lower.match(new RegExp(`(\\d{1,2})\\s*(${keywords.join('|')})`)) || 
                         lower.match(new RegExp(`(${keywords.join('|')})\\s*(\\d{1,2})`));
        
        if (dayMatch) {
          const day = (dayMatch[1].match(/^\d+$/) ? dayMatch[1] : dayMatch[2]).padStart(2, '0');
          const yearMatch = lower.match(/\d{4}/);
          const year = yearMatch ? yearMatch[0] : new Date().getFullYear();
          result.date = `${year}-${monthNum}-${day}`;
          break;
        }
      }
    }
  }

  return result;
};

// @desc    Process Tamil NLP input using Gemini AI
// @route   POST /api/nlp/parse
// @access  Public
const parseNLPInput = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'உரை உள்ளீடு தேவை', 
      });
    }

    let aiParsed = null;
    
    // 1. Try Gemini
    if (process.env.GEMINI_API_KEY) {
      console.log('Attempting AI parsing with Gemini...');
      aiParsed = await parseTravelIntent(text);
      if (aiParsed) console.log('AI Parsing successful');
    }

    // 2. Always run Legacy as a base/supplement
    console.log('Running legacy parsing logic to fill gaps...');
    const legacyParsed = parseTamilInputLegacy(text);

    // 3. Merge: Start with Legacy, Override with non-null AI results
    const merged = { ...legacyParsed };
    
    if (aiParsed) {
      if (aiParsed.sourceCode || aiParsed.source) merged.source = aiParsed.sourceCode || aiParsed.source;
      if (aiParsed.destinationCode || aiParsed.destination) merged.destination = aiParsed.destinationCode || aiParsed.destination;
      if (aiParsed.travelType) merged.travelType = aiParsed.travelType;
      if (aiParsed.date) merged.date = aiParsed.date;
      if (aiParsed.passengers) merged.passengers = aiParsed.passengers;
      merged.confidence = aiParsed.confidence || 'medium';
    }

    // 4. Final Validation: Ensure date is YYYY-MM-DD if exists
    if (merged.date) {
      const dateObj = new Date(merged.date);
      if (isNaN(dateObj.getTime()) || merged.date.length < 10) {
        merged.date = null; // Kill invalid dates to prevent frontend crash
      }
    }

    const suggestions = [];
    if (!merged.source) suggestions.push('புறப்படும் இடம் குறிப்பிடவும்');
    if (!merged.destination) suggestions.push('செல்லும் இடம் குறிப்பிடவும்');

    res.status(200).json({
      success: true,
      parsed: merged,
      suggestions,
      searchUrl: merged.source && merged.destination
        ? `/api/travel/search?source=${merged.source}&destination=${merged.destination}${merged.travelType ? `&type=${merged.travelType}` : ''}${merged.date ? `&date=${merged.date}` : ''}${merged.passengers ? `&passengers=${merged.passengers}` : ''}`
        : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Tamil NLP suggestions for autocomplete
// @route   GET /api/nlp/cities
// @access  Public
const getCitySuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.status(200).json({ success: true, data: [] });
    }

    const lower = q.toLowerCase();
    const matches = Object.entries(CITY_MAP)
      .filter(([name]) => name.toLowerCase().includes(lower))
      .map(([name, code]) => ({ name, code }))
      .slice(0, 8);

    res.status(200).json({ success: true, data: matches });
  } catch (error) {
    next(error);
  }
};

module.exports = { parseNLPInput, getCitySuggestions };

