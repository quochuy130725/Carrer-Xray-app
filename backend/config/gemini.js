const { GoogleGenAI, Type } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

module.exports = { ai, Type };
