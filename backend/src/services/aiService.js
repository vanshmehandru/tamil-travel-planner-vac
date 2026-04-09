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
    - If no markers are present and only one city is mentioned, assume it is the DESTINATION if the user says "போகணும்" (want to go) or "பயணம்" (travel).
    
    EXTRACT the following fields in JSON format:
    - source: (String) Departure city. Standard English name.
    - sourceCode: (String) Railway/Station code (e.g., MAS, CBE, MDU, TPJ).
    - destination: (String) Arrival city. Standard English name.
    - destinationCode: (String) Railway/Station code.
    - travelType: (String) "train", "bus", or "flight".
    - date: (String) YYYY-MM-DD format relative to today (${new Date().toISOString().split('T')[0]}).
    - passengers: (Number) Count or 1.
    - confidence: "high", "medium", or "low".
    
    If the input is incomplete, fill what you can and leave others as null.
    Return ONLY JSON.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    return null;
  }
};

module.exports = { parseTravelIntent };
