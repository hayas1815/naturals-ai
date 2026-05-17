require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Try getting list of models or just try generating content
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello world");
        console.log("Response from gemini-1.5-flash:", result.response.text());
    } catch (e) {
        console.error("gemini-1.5-flash failed:", e.message);
        
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result2 = await model2.generateContent("Hello world");
            console.log("Response from gemini-pro:", result2.response.text());
        } catch (e2) {
            console.error("gemini-pro failed:", e2.message);
        }
    }
}

testGemini();
