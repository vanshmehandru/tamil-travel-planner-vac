const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Default model - Using gemini-2.5-flash which is available for this key
let currentModelName = "gemini-2.5-flash"; 
let model = genAI.getGenerativeModel({ model: currentModelName });

// --- CACHE & COOLDOWN STATE ---
const aiCache = new Map();
let quotaCooldownUntil = null;

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// --- STATION NAME MAPPING ---
const CODE_TO_NAME_TAMIL = {
  'MAS': 'சென்னை', 'MSB': 'சென்னை', 'MAA': 'சென்னை',
  'CBE': 'கோவை', 'IXM': 'மதுரை', 'MDU': 'மதுரை',
  'TPJ': 'திருச்சி', 'TRZ': 'திருச்சி',
  'SA': 'சேலம்', 'VLR': 'வேலூர்',
  'TEN': 'திருநெல்வேலி', 'NCJ': 'நாகர்கோவில்',
  'TJ': 'தஞ்சாவூர்', 'ED': 'ஈரோடு',
  'TUT': 'தூத்துக்குடி', 'TCR': 'தூத்துக்குடி',
  'KMU': 'கும்பகோணம்', 'PGT': 'பாளையங்கோட்டை',
  'VM': 'விழுப்புரம்', 'CDL': 'கடலூர்',
  'UAM': 'ஓட்டி', 'DLI': 'டெல்லி', 'DEL': 'டெல்லி',
  'SBC': 'பெங்களூர்', 'BLR': 'பெங்களூர்',
  'BOM': 'मुंबई (மும்பை)', 'HYB': 'ஹைதராபாத்', 'HYD': 'ஹைதராபாத்',
  'HWH': 'கொல்கத்தா', 'CCU': 'கொல்கத்தா',
  'PDY': 'புதுச்சேரி'
};

/**
 * Parses travel intent from a user's text (Tamil or English)
 * Returns a structured object with source, destination, travelType, etc.
 */
const parseTravelIntent = async (text) => {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing in .env");
    return null;
  }

  const prompt = `
    You are an expert Tamil Travel Assistant for "Namma Yatra". Your task is to parse travel requests and return ONLY valid JSON.
    
    USER INPUT: "${text}"
    REFERENCE DATE (Today): ${new Date().toISOString().split('T')[0]}

    FIELDS TO EXTRACT:
    - source: (String) E.g., Chennai, Madurai, Delhi.
    - sourceCode: (String) IATA/Station Code. [MAS, CBE, MDU, TPJ, SA, VLR, ED, UAM, SBC, DLI, MSB].
    - destination: (String) E.g., Delhi, Old Delhi, Coimbatore.
    - destinationCode: (String) REQUIRED code. Use "DLI" for Delhi/Old Delhi.
    - travelType: (String) "train", "bus", or "flight".
    - date: (String) YYYY-MM-DD. 
    - passengers: (Number) Default 1.
    - confidence: "high", "medium", or "low".

    SPECIAL GRAMMAR RULES FOR TAMIL:
    - "-இருந்து" or "-லிருந்து" (irundhu) -> SOURCE (e.g., சென்னயிலிருந்து = From Chennai).
    - "-க்கு" or "-நோக்கி" (ku) -> DESTINATION (e.g., மதுரைக்கு = To Madurai).
    - Keywords for travelType: "ரயில்"/"ட்ரைன்" = train, "பஸ்"/"பேருந்து" = bus, "விமானம்"/"பறக்கும்" = flight.
    
    IMPORTANT: Handle "Delhi" (டெல்லி) accurately based on its suffix. 
    - "டெல்லியிலிருந்து" (From Delhi) -> sourceCode: "DLI".
    - "டெல்லிக்கு" (To Delhi) -> destinationCode: "DLI".
    
    Return ONLY JSON.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonStr = response.text();
    
    // Clean JSON if Gemini returns markdown blocks
    jsonStr = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const parsed = JSON.parse(jsonStr);
    console.log('--- AI RAW PARSE RESULT ---');
    console.log('Text:', text);
    console.log('Parsed:', parsed);
    console.log('---------------------------');
    
    return parsed;
  } catch (error) {
    console.error("Gemini Parsing Error Details:", error);
    return null;
  }
};

const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../../logs/debug.txt');
const logToDebug = (msg) => {
  try {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
  } catch (e) {
    console.error('Logging failed', e);
  }
};

/**
 * Generates realistic travel data (Flight/Train/Bus) using Gemini
 * Includes a timeout, retry logic, caching, and demo data fallback.
 */
const generateTravelDataAI = async (type, source, destination, date) => {
  const cacheKey = `${type}-${source}-${destination}-${date}`;
  
  // 1. Check Cache
  if (aiCache.has(cacheKey)) {
    const cached = aiCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      logToDebug(`CACHE HIT: ${cacheKey}`);
      return cached.data;
    }
    aiCache.delete(cacheKey);
  }

  logToDebug(`START AI Gen: ${type} | ${source} -> ${destination} on ${date}`);
  
  if (!process.env.GEMINI_API_KEY) {
    logToDebug('MISSING GEMINI_API_KEY');
    return [];
  }

  // Map type to specific operator key name
  const operatorKey = type === 'flight' ? 'airline' : (type === 'train' ? 'trainName' : 'busOperator');
  const transportNumKey = type === 'flight' ? 'flightNumber' : (type === 'train' ? 'trainNumber' : 'busNumber');

  const prompt = `
    You are an expert travel coordinator for "Namma Yatri". 
    Generate a list of 5-8 realistic "${type}" options for a journey from "${source}" to "${destination}" on ${date}.
    
    RETURN ONLY A VALID JSON ARRAY. No chat text, no markdown code blocks.
    
    JSON SCHEMA FOR EACH OBJECT:
    - _id: (String) unique identifier starting with "ext-${type}-"
    - type: "${type}"
    - ${operatorKey}: (String) Name of the operator (e.g. IndiGo, Vande Bharat, zingbus).
    - ${transportNumKey}: (String) E.g. "6E-227", "12675", "TN-01-AB-1234".
    - source: "${source}"
    - destination: "${destination}"
    - sourceName: (String) City name in Tamil.
    - destinationName: (String) City name in Tamil.
    - departureTime: (String) "HH:mm"
    - arrivalTime: (String) "HH:mm"
    - duration: (String) e.g. "2h 30m"
    - pricing: [{ class: String, price: Number, totalSeats: Number, availableSeats: Number }]
    - isActive: true
    - isRealTime: true

    REALISM RULES:
    1. If type is "flight": Use realistic Indian domestic airlines.
    2. If type is "train": Use realistic Indian Railways trains.
    3. If type is "bus": Use realistic operators like zingbus plus, IntrCity.
    4. Tamil: Use proper Tamil for sourceName and destinationName.
    5. Pricing: Price in INR.

    Return ONLY the JSON.
  `;

  const MAX_RETRIES = 2;
  const sleep = (ms) => new Promise(res => setTimeout(res, ms));

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API Timeout')), 25000)
    );

    try {
      const resultPromise = model.generateContent(prompt);
      const result = await Promise.race([resultPromise, timeoutPromise]);
      const response = await result.response;
      let jsonStr = response.text();
      
      jsonStr = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim();
      const start = jsonStr.indexOf('[');
      const end = jsonStr.lastIndexOf(']');
      if (start !== -1 && end !== -1) {
        jsonStr = jsonStr.substring(start, end + 1);
      }
      
      const parsed = JSON.parse(jsonStr);
      const validated = Array.isArray(parsed) ? parsed.map(item => ({
          ...item,
          type: type,
          source: source,
          destination: destination,
          sourceName: item.sourceName || source,
          destinationName: item.destinationName || destination,
          pricing: Array.isArray(item.pricing) ? item.pricing : [{ class: 'General', price: 2000, totalSeats: 50, availableSeats: 10 }],
          isActive: true,
          isRealTime: true,
          [operatorKey]: item[operatorKey] || 'Unknown Operator',
          [transportNumKey]: item[transportNumKey] || 'TBD'
      })) : [];

      // Update Cache
      if (validated.length > 0) {
        aiCache.set(cacheKey, { data: validated, timestamp: Date.now() });
        logToDebug(`SUCCESS AI Gen: ${validated.length} ${type} items.`);
        return validated;
      }

      logToDebug(`AI returned 0 results for ${type}.`);
      return [];
    } catch (error) {
      const is429 = error.message.includes('429') || (error.response && error.response.status === 429);
      const isTransient = error.message.includes('503') || error.message.includes('504') || error.message.includes('Timeout');
      
      if (is429) {
        logToDebug(`QUOTA EXCEEDED (429): Entering cooldown for 60s.`);
        quotaCooldownUntil = Date.now() + 60000;
        return [];
      }

      if (isTransient && attempt < MAX_RETRIES) {
        logToDebug(`Transient error (${error.message}), retrying... (${attempt + 1}/${MAX_RETRIES})`);
        await sleep(2000 * (attempt + 1));
        continue;
      }
      
      logToDebug(`ERROR AI final fail: ${type} -> ${error.message}.`);
      return [];
    }
  }
};

module.exports = { parseTravelIntent, generateTravelDataAI };
