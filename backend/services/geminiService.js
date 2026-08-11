const { ai, Type, GEMINI_MODEL } = require('../config/gemini');

// Timeout guard — text: 12s, multimodal image: 30s
const withTimeout = (promise, ms = 12000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini AI timed out after ${ms}ms`)), ms)
    )
  ]);
};

const analyzeJDWithGemini = async (jdText, lang = 'en', imageBase64 = null, mimeType = null) => {
  const isEn = lang === 'en';

  const systemInstruction = `You are an Anti-Scam Recruitment Security Auditor applying the UNESCO Media & Information Literacy (MIL) framework. Analyze raw job descriptions or images, detect manipulative tactics, upfront fee traps, and illegal employment demands.

CRITICAL CALIBRATION FOR RISK LEVELS:
* HIGH RISK (Red Flags): Malicious scams designed to steal money or data. Examples: Upfront deposit fees (cọc tiền), redirecting to private Telegram/Zalo for 'tasks', fake E-commerce orders, unrealistic 'unlimited' salaries for zero experience.
* MEDIUM RISK (Yellow Flags / Cảnh báo nhẹ): The job appears to be from a LEGITIMATE company (e.g., FPT, Vingroup), but contains strict terms or minor logical anomalies that candidates should be aware of. Examples: A binding training contract (ràng buộc đào tạo 3-6 tháng đền bù chi phí), or a minor contact mismatch (e.g., working in Nha Trang but sending CV to an HCM email). When generating flags for a MEDIUM risk post, \`category_vi\` should be 'LƯU Ý' or 'CẢNH BÁO', \`category_en\` should be 'CAUTION' or 'WARNING', and the \`reason\` MUST clarify that the post is likely legitimate, but the candidate should pay attention to this specific detail.
* SAFE: Clear, professional, standard terms.

CRITICAL RULE FOR BILINGUAL OUTPUT: You must analyze the job description or image ONCE to determine the true \`riskLevel\` and identify any logical traps. Then, you MUST output the EXACT SAME findings. DO NOT provide different assessments for different languages. Generate a SINGLE array of \`redFlags\`, where each flag contains translations inside its object (\`reason_vi\` and \`reason_en\`).
CRITICAL: \`phrase_vi\` MUST be an exact substring from \`jdText_vi\`, and \`phrase_en\` MUST be an exact substring from \`jdText_en\`. Neither can be empty or null. If a flag is detected, both \`phrase_vi\` and \`phrase_en\` MUST be present. For \`marketBenchmark\`, you must formulate ONE unified logical assessment. Then, output the EXACT same meaning translated into \`text_vi\` and \`text_en\`. Do not omit details in one language.`;


  const promptText = `${systemInstruction}\n\nJOB DESCRIPTION TEXT TO INSPECT:\n"${jdText || '(Text content not provided, please extract and analyze from the attached image)'}"`;

  const promptParts = [{ text: promptText }];
  if (imageBase64 && mimeType) {
    promptParts.push({
      inlineData: {
        data: imageBase64,
        mimeType: mimeType
      }
    });
  }

  const apiPromise = ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: promptParts,
    config: {
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          jdText_vi: {
            type: Type.STRING,
            description: 'Extracted readable text from image or original text, in Vietnamese (translated if original is English)'
          },
          jdText_en: {
            type: Type.STRING,
            description: 'Extracted readable text from image or original text, in English (translated if original is Vietnamese)'
          },
          riskLevel: {
            type: Type.STRING,
            description: 'Severity level: HIGH, MEDIUM, or SAFE'
          },
          marketBenchmark: {
            type: Type.OBJECT,
            properties: {
              text_vi: { type: Type.STRING, description: 'Labor market & legal compliance assessment (Vietnamese)' },
              text_en: { type: Type.STRING, description: 'Labor market & legal compliance assessment (English)' }
            },
            required: ['text_vi', 'text_en']
          },
          redFlags: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phrase_vi: { type: Type.STRING, description: 'The exact substring extracted from jdText_vi. Mandatory.' },
                phrase_en: { type: Type.STRING, description: 'The exact substring extracted from jdText_en. Mandatory.' },
                category_vi: { type: Type.STRING, description: 'Risk Category name in Vietnamese (e.g. LƯU Ý, CẢNH BÁO)' },
                category_en: { type: Type.STRING, description: 'Risk Category name in English (e.g. CAUTION, WARNING)' },
                reason_vi: { type: Type.STRING, description: 'Forensic explanation in Vietnamese' },
                reason_en: { type: Type.STRING, description: 'Forensic explanation in English' }
              },
              required: ['phrase_vi', 'phrase_en', 'category_vi', 'category_en', 'reason_vi', 'reason_en']
            }
          }
        },
        required: ['jdText_vi', 'jdText_en', 'riskLevel', 'marketBenchmark', 'redFlags']
      }
    }
  });

  // Image multimodal cần 30s, text-only 12s
  const timeoutMs = (imageBase64 && mimeType) ? 30000 : 12000;
  const response = await withTimeout(apiPromise, timeoutMs);
  return JSON.parse(response.text);
};

const analyzeCommentsWithGemini = async (comments, lang = 'en') => {
  const isEn = lang === 'en';

  const systemInstruction = isEn
    ? 'You are a Social Behavior & Crowd Manipulation Auditor specializing in detecting Botnet Seeding networks, FOMO lures, fake social proof, and bot accounts in recruitment posts. Analyze comments strictly as a deterministic logic scanner. Provide responses strictly in ENGLISH.'
    : 'Bạn là Chuyên gia Kiểm toán Hành vi Đám đông & Thao túng Tâm lý Social, chuyên phân tích và bóc trần mạng lưới Botnet Seeding, tạo hiệu ứng FOMO chim mồi và nick ảo trong các bài đăng tuyển dụng. Trả về kết quả hoàn toàn bằng TIẾNG VIỆT.';

  const apiPromise = ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: `${systemInstruction}\n\nCOMMENTS PAYLOAD:\n${JSON.stringify(comments)}`,
    config: {
      temperature: 0.1,
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

  const response = await withTimeout(apiPromise, 12000);
  return JSON.parse(response.text);
};

module.exports = { analyzeJDWithGemini, analyzeCommentsWithGemini };
