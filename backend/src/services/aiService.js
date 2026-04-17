const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Using gemini-pro for maximum compatibility

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
    You are an expert Tamil Travel Assistant for "Namma Yatri". Your task is to parse travel requests and return ONLY valid JSON.
    
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

module.exports = { parseTravelIntent };
