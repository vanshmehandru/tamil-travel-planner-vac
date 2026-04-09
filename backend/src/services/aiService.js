const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: { responseMimeType: "application/json" }
});

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
    You are a travel assistant for "Namma Yatri", a travel booking platform for Tamil Nadu, India.
    Your task is to extract travel intent from the following user input (which may be in Tamil, English, or Tanglish).
    
    USER INPUT: "${text}"
    
    CRITICAL TAMIL GRAMMAR RULES:
    - Words ending in "-இருந்து" (-irundhu) or "-லிருந்து" (-lirundhu) are the SOURCE (e.g., "சென்னையிலிருந்து" = From Chennai).
    - Words ending in "-க்கு" (-ku) or "-நோக்கி" (-nokki) are the DESTINATION (e.g., "மதுரைக்கு" = To Madurai).
    - If no markers are present and only one city is mentioned, assume it is the DESTINATION.
    
    TAMIL DATE EXAMPLES:
    - "10 மே" -> Month 05, Day 10.
    - "ஜனவரி 25" -> Month 01, Day 25.
    
    EXTRACT the following fields in JSON format:
    - source: (String) Departure city. List: [Chennai, Coimbatore, Madurai, Trichy, Salem, Vellore, Erode, Ooty, Bangalore].
    - sourceCode: (String) REQUIRED code from: [MAS, CBE, MDU, TPJ, SA, VLR, ED, UAM, SBC].
    - destination: (String) Arrival city.
    - destinationCode: (String) REQUIRED code.
    - travelType: (String) "train", "bus", or "flight".
    - date: (String) YYYY-MM-DD. 
      * Parse: "10 மே", "tomorrow" (நாளை), "next week" (அடுத்த வாரம்). 
      * Reference today: ${new Date().toISOString().split('T')[0]}.
    - passengers: (Number) Integer.
    - confidence: "high", "medium", or "low".
    
    If name ends in "-இருந்து" or "-லிருந்து" it is SOURCE.
    If name ends in "-க்கு" it is DESTINATION.
    
    Return ONLY VALID JSON.
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
