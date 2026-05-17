const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("Gemini API key is not set. AI operations will fail.");
}

const genAI = new GoogleGenerativeAI(apiKey || 'placeholder-key');

// Use current available vision model
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

module.exports = model;
