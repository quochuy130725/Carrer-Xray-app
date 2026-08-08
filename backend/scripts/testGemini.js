const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { ai } = require('../config/gemini');

const modelsToTest = [
  'gemini-flash-lite',
  'gemini-flash-lite-latest',
  'flash-lite',
  'gemini-1.5-flash-lite'
];

async function testAll() {
  console.log('Testing Model names...');
  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing model: "${modelName}"...`);
      const res = await ai.models.generateContent({
        model: modelName,
        contents: 'Ping test'
      });
      console.log(`✅ SUCCESS with model "${modelName}":`, res.text ? res.text.substring(0, 40) : 'OK');
      return modelName;
    } catch (err) {
      console.log(`❌ FAILED with model "${modelName}":`, err.message);
    }
  }
}

testAll();
