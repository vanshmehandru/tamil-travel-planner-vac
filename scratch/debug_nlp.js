const { parseTravelIntent } = require('./backend/src/services/aiService');
require('dotenv').config({ path: './backend/.env' });

async function debugNLP() {
    const text = "எனக்கு 10 மே 2026 அன்று சென்னையிலிருந்து கோயம்புத்தூருக்கு ரயில் டிக்கெட் முன்பதிவு செய்ய வேண்டும்.";
    console.log("Input:", text);
    try {
        const result = await parseTravelIntent(text);
        console.log("AI Result:", JSON.stringify(result, null, 2));
    } catch (err) {
        console.error("Error:", err);
    }
}

debugNLP();
