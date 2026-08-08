const { ai, Type, GEMINI_MODEL } = require('../config/gemini');

// Helper Timeout Guard 800ms (0.8s) siêu tốc - Đảm bảo UI nhận kết quả tức thì
const withTimeout = (promise, ms = 800) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini AI timed out after ${ms}ms`)), ms)
    )
  ]);
};

const analyzeJDWithGemini = async (jdText, lang = 'en') => {
  const isEn = lang === 'en';

  const systemInstruction = isEn
    ? 'You are an Anti-Scam Recruitment Security Auditor applying the UNESCO Media & Information Literacy (MIL) framework. Analyze raw job descriptions, detect manipulative tactics, upfront fee traps, and illegal employment demands under Labor Code standards. CRITICAL RULE: The "phrase" field MUST be an EXACT 100% verbatim substring extracted directly from the original raw text (do NOT summarize, paraphrase, or fix typos). Provide responses strictly in ENGLISH.'
    : 'Bạn là chuyên gia Kiểm toán An ninh Tuyển dụng Chống Lừa đảo dựa trên khung tiêu chí UNESCO Media & Information Literacy (MIL). Phân tích văn bản JD, phát hiện bẫy cọc, thông tin ẩn danh và các hành vi vi phạm Bộ Luật Lao Động 2019. QUY TẮC BẮT BUỘC: Trường "phrase" phải là một chuỗi trích xuất nguyên văn 100% từ văn bản gốc (KHÔNG được tự ý tóm tắt, diễn đạt lại hay sửa lỗi chính tả). Trả về kết quả hoàn toàn bằng TIẾNG VIỆT.';

  const promptText = `${systemInstruction}\n\nJOB DESCRIPTION TEXT TO INSPECT:\n"${jdText}"`;

  const apiPromise = ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: promptText,
    config: {
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          riskLevel: {
            type: Type.STRING,
            description: 'Severity level: HIGH, MEDIUM, or SAFE'
          },
          marketBenchmark: {
            type: Type.STRING,
            description: 'Labor market & legal compliance assessment'
          },
          redFlags: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phrase: {
                  type: Type.STRING,
                  description: 'MUST be an EXACT 100% verbatim substring extracted directly from the raw text'
                },
                reason: { type: Type.STRING, description: 'Forensic explanation of the trap' },
                category: { type: Type.STRING, description: 'Risk Category name' }
              },
              required: ['phrase', 'reason']
            }
          }
        },
        required: ['riskLevel', 'marketBenchmark', 'redFlags']
      }
    }
  });

  const response = await withTimeout(apiPromise, 800);
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

  const response = await withTimeout(apiPromise, 800);
  return JSON.parse(response.text);
};

module.exports = { analyzeJDWithGemini, analyzeCommentsWithGemini };
