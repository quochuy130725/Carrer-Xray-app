const { GoogleGenAI, Type } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Model chuẩn gemini-flash-lite-latest theo đúng yêu cầu không chứa số 2
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';

// Kiểm tra xem GEMINI_API_KEY đã được cấu hình hợp lệ chưa
const isGeminiConfigured = () => {
  return Boolean(
    apiKey &&
    apiKey.trim() !== '' &&
    !apiKey.includes('your_') &&
    !apiKey.includes('_here')
  );
};

module.exports = { ai, Type, GEMINI_MODEL, isGeminiConfigured };
