const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testGemini() {
    console.log("Using Key:", process.env.GEMINI_API_KEY ? "EXISTS" : "MISSING");
    if (!process.env.GEMINI_API_KEY) return;
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelName = "gemini-2.5-flash";
    
    try {
        console.log(`Testing actual generation with ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Give me a list of 2 train names in South India in JSON format [name1, name2]");
        const response = await result.response;
        console.log("SUCCESS!");
        console.log("Output:", response.text());
    } catch (e) {
        console.log("FAILED:", e.message);
    }
}

testGemini();
