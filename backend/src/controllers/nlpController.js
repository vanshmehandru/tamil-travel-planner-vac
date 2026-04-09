const { parseTravelIntent } = require('../services/aiService');

// Tamil keyword maps (kept for fallback)
const TRAVEL_TYPES = {
  train: ['ரயில்', 'train', 'ரெயில்', 'express', 'எக்ஸ்பிரஸ்', 'மெயில்'],
  bus: ['பஸ்', 'bus', 'பேருந்து', 'ஓமினி', 'omni'],
  flight: ['விமானம்', 'flight', 'ஏர்', 'air', 'fly', 'plane'],
};

const CITY_MAP = {
  சென்னை: 'MAS', madras: 'MAS', chennai: 'MAS',
  கோவை: 'CBE', coimbatore: 'CBE', kovai: 'CBE',
  மதுரை: 'MDU', madurai: 'MDU',
  திருச்சி: 'TPJ', trichy: 'TPJ',
  சேலம்: 'SA', salem: 'SA',
  வேலூர்: 'VLR', vellore: 'VLR',
  திருநெல்வேலி: 'TEN', tirunelveli: 'TEN',
  நாகர்கோவில்: 'NCJ', nagercoil: 'NCJ',
  தஞ்சாவூர்: 'TJ', thanjavur: 'TJ',
  ஈரோடு: 'ED', erode: 'ED',
  புதுச்சேரி: 'PDY', pondicherry: 'PDY',
  ஓட்டி: 'UAM', ooty: 'UAM',
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
  const foundCities = [];
  for (const [name, code] of Object.entries(CITY_MAP)) {
    if (lower.includes(name.toLowerCase())) {
      foundCities.push({ name, code, position: lower.indexOf(name.toLowerCase()) });
    }
  }
  foundCities.sort((a, b) => a.position - b.position);

  if (foundCities.length >= 2) {
    result.source = foundCities[0].code;
    result.destination = foundCities[1].code;
  } else if (foundCities.length === 1) {
    // Check if it's a destination (ending in 'ku' markers)
    const pos = foundCities[0].position;
    const beforeOrAfterCity = lower.substring(pos - 10, pos + 20); // check context around city
    const isTo = TO_MARKERS.some(m => beforeOrAfterCity.includes(m));
    const isFrom = FROM_MARKERS.some(m => beforeOrAfterCity.includes(m));
    
    if (isTo) {
      result.destination = foundCities[0].code;
    } else {
      result.source = foundCities[0].code;
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

    let parsed = null;
    
    // Try Gemini first
    if (process.env.GEMINI_API_KEY) {
      console.log('Attempting AI parsing with Gemini...');
      parsed = await parseTravelIntent(text);
      if (parsed) console.log('AI Parsing successful:', parsed);
      else console.error('AI Parsing failed (returned null)');
    } else {
      console.warn('GEMINI_API_KEY is missing in .env');
    }

    // Fallback to legacy if Gemini fails or is not configured
    if (!parsed) {
      console.log('Falling back to legacy parsing logic...');
      parsed = parseTamilInputLegacy(text);
    }

    const suggestions = [];
    if (!parsed.source) suggestions.push('புறப்படும் இடம் குறிப்பிடவும்');
    if (!parsed.destination) suggestions.push('செல்லும் இடம் குறிப்பிடவும்');

    res.status(200).json({
      success: true,
      parsed,
      suggestions,
      searchUrl: parsed.source && parsed.destination
        ? `/api/travel/search?source=${parsed.sourceCode || parsed.source}&destination=${parsed.destinationCode || parsed.destination}${parsed.travelType ? `&type=${parsed.travelType}` : ''}${parsed.date ? `&date=${parsed.date}` : ''}`
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

