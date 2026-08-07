const { ai, Type } = require('../config/gemini');

const analyzeJDWithGemini = async (jdText) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Phân tích JD tuyển dụng sau và trích xuất các Red Flags (bẫy lừa cọc, lương ảo, toxic OT, thông tin ẩn danh): ${jdText}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          redFlags: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phrase: { type: Type.STRING },
                reason: { type: Type.STRING },
                category: { type: Type.STRING }
              },
              required: ['phrase', 'reason']
            }
          },
          marketBenchmark: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text);
};

const analyzeCommentsWithGemini = async (comments) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Phân tích danh sách bình luận sau và phát hiện các bình luận dạng Botnet/Seeding mồi nhử lừa đảo: ${JSON.stringify(comments)}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          comments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                isBot: { type: Type.BOOLEAN },
                botReason: { type: Type.STRING }
              },
              required: ['id', 'isBot']
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text);
};

module.exports = { analyzeJDWithGemini, analyzeCommentsWithGemini };
