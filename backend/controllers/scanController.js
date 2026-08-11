const { analyzeJDWithGemini, analyzeCommentsWithGemini } = require('../services/geminiService');
const { getFallbackJobData } = require('../services/fallbackService');
const { isGeminiConfigured } = require('../config/gemini');
const { readJobsJson } = require('../utils/jsonReader');
const { analyzeWithRegex } = require('../services/regexService');
const { compressImageForGemini } = require('../utils/imageCompressor');
const Job = require('../models/Job');
const ScannedJob = require('../models/ScannedJob');
const logger = require('../utils/logger');

/**
 * Sắp xếp flags theo độ ưu tiên đa dạng — đảm bảo thứ tự hiển thị nhất quán bất kể AI trả về theo thứ tự nào.
 * Priority 0 (hiển trước nhất): Scam cứng — cọc tiền, telegram, zalo, đơn hàng giả
 * Priority 1: Mâu thuẫn thông tin liên lạc — email/địa chỉ khả nghi
 * Priority 2: Ràng buộc hợp đồng — đào tạo, bồi thường
 * Priority 3 (hiển sau cùng): Cảnh báo khác
 */
const FLAG_PRIORITY = [
  /(deposit|cọc|tiền cọc|telegram|zalo|fake|lừa đảo|scam|order|commission)/i,  // 0 — scam cứng
  /(email|contact|mâu thuẫn|inconsistent|address|địa chỉ|branch|chi nhánh)/i,     // 1 — contact mismatch
  /(binding|training|đào tạo|ràng buộc|bồi thường|bond)/i,                     // 2 — contract terms
];

const getFlagPriority = (flag = {}) => {
  const cat = (flag.category_en || flag.category_vi || flag.category || '');
  for (let i = 0; i < FLAG_PRIORITY.length; i++) {
    if (FLAG_PRIORITY[i].test(cat)) return i;
  }
  return FLAG_PRIORITY.length; // lowest priority for generic caution
};

const sortFlagsByPriority = (flags) =>
  [...flags].sort((a, b) => getFlagPriority(a) - getFlagPriority(b));

// Controller Lấy danh sách Case Studies (Ưu tiên từ MongoDB Atlas / Local MongoDB)
// Smart Dual-Data Fallback: nếu MongoDB data thiếu trường _vi/_en → dùng local jobs.json mới nhất
exports.getCases = async (req, res, next) => {
  try {
    const dbCases = await Job.find({}).sort({ caseId: 1 }).lean();
    if (dbCases && dbCases.length > 0) {
      // Kiểm tra xem data MongoDB đã có Dual-Data structure chưa
      const firstJob = dbCases[0]?.jobs?.[0];
      const hasDualData = firstJob && (firstJob.jdText_vi || firstJob.jdText_en);

      if (hasDualData) {
        return res.json({
          success: true,
          source: 'MONGODB',
          data: dbCases
        });
      }

      // MongoDB có data nhưng là data cũ (chưa có _vi/_en fields) → dùng local JSON mới
      logger.info('MongoDB data lacks dual-data fields, using updated local jobs.json...');
    }

    const fallbackData = readJobsJson();
    return res.json({
      success: true,
      source: 'LOCAL_JSON',
      data: fallbackData
    });
  } catch (error) {
    logger.warn('MongoDB query failed in getCases, using local fallback:', error.message);
    const fallbackData = readJobsJson();
    return res.json({
      success: true,
      source: 'LOCAL_FALLBACK',
      data: fallbackData
    });
  }
};

// Admin Endpoint: Seed MongoDB Atlas qua HTTP (dùng đúng connection của server đang chạy)
exports.seedDatabase = async (req, res, next) => {
  try {
    const freshData = readJobsJson();

    // Xóa data cũ bằng Mongoose (an toàn)
    await Job.deleteMany({});

    // QUAN TRỌNG: Dùng native MongoDB driver collection.insertMany() thay vì Job.insertMany()
    // Lý do: Mongoose insertMany() strip các fields chưa khai báo trong schema dù strict: false
    // Native driver insertMany() lưu nguyên vẹn 100% toàn bộ fields kể cả _vi/_en
    await Job.collection.insertMany(freshData, { ordered: true });

    logger.info(`✅ Admin seed completed: ${freshData.length} Case Categories loaded into MongoDB (native driver).`);
    return res.json({
      success: true,
      message: `Seeded ${freshData.length} cases into MongoDB Atlas successfully with full dual-data fields.`,
      source: 'ADMIN_SEED'
    });
  } catch (error) {
    logger.error('Admin seed failed:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Controller Phân tích bài đăng tùy chỉnh POST /api/analyze & Lưu Audit Log vào MongoDB Atlas
exports.analyzeCustomJD = async (req, res, next) => {
  const { imageBase64, mimeType, lang = 'en' } = req.body;
  let { jdText } = req.body;
  const isEn = lang === 'en';

  try {
    const hasText = jdText && jdText.trim() !== '';
    if (!hasText && !imageBase64) {
      return res.status(400).json({
        success: false,
        message: isEn ? 'Please provide job description text or an image to inspect.' : 'Vui lòng cung cấp nội dung hoặc hình ảnh bài đăng để kiểm tra.'
      });
    }

    let redFlags = [];
    let redFlags_vi = [];
    let redFlags_en = [];
    let marketBenchmark = '';
    let marketBenchmark_vi = '';
    let marketBenchmark_en = '';
    let jdText_vi = '';
    let jdText_en = '';
    let riskLevel = 'SAFE';

    // 1. Nếu có hình ảnh, BẮT BUỘC dùng Gemini vì Regex không đọc được ảnh
    if (imageBase64) {
      if (isGeminiConfigured()) {
        try {
          // 🗜️ Nén ảnh trước khi gửi lên Gemini để tăng tốc độ xử lý
          const compressed = await compressImageForGemini(imageBase64, mimeType);
          if (!compressed.skipped) {
            logger.info(`🗜️ Image compressed: ${compressed.originalKB}KB → ${compressed.compressedKB}KB (saved ${compressed.originalKB - compressed.compressedKB}KB)`);
          }

          const aiResult = await analyzeJDWithGemini(jdText, lang, compressed.base64, compressed.mimeType);

          const rawFlags = sortFlagsByPriority(aiResult.redFlags || []);
          redFlags_vi = rawFlags.map(flag => ({
            phrase: flag.phrase_vi || flag.phrase_en || flag.phrase || '',
            category: flag.category_vi || flag.category || 'LƯU Ý',
            reason: flag.reason_vi
          }));
          redFlags_en = rawFlags.map(flag => ({
            phrase: flag.phrase_en || flag.phrase_vi || flag.phrase || '',
            category: flag.category_en || flag.category || 'CAUTION',
            reason: flag.reason_en
          }));
          redFlags = isEn ? redFlags_en : redFlags_vi;

          marketBenchmark_vi = aiResult.marketBenchmark?.text_vi || '';
          marketBenchmark_en = aiResult.marketBenchmark?.text_en || '';
          marketBenchmark = isEn ? marketBenchmark_en : marketBenchmark_vi;

          // Tước quyền AI: chấm risk theo keyword bẫy nghiêm trọng
          const severeScamKeywords = [
            'GÕ TRUYỆN', 'GÕ VĂN BẢN', 'TIỂU THUYẾT', 'CÀNH/TRANG', '35K-100K', 
            'INBOX LIỀN TAY', 'INBOX ZALO', 'TELEGRAM', 'NẠP TIỀN', 'CỌC', 
            'NHẬP LIỆU AT HOME', 'NHIỆM VỤ', 'CHIẾN DỊCH'
          ];
        
          riskLevel = "SAFE";
          if (rawFlags && rawFlags.length > 0) {
            const isSevere = rawFlags.some(flag => {
              const textToSearch = `${flag.phrase_vi} ${flag.phrase_en} ${flag.reason_vi} ${flag.reason_en} ${flag.category_vi} ${flag.category_en}`.toUpperCase();
              return severeScamKeywords.some(kw => textToSearch.includes(kw));
            });
            
            riskLevel = isSevere ? "HIGH" : "MEDIUM";
          }

          jdText_vi = aiResult.jdText_vi || '';
          jdText_en = aiResult.jdText_en || '';

          // Nếu user chỉ nộp ảnh, lấy text do AI OCR được đắp vào jdText để UI có dữ liệu hiển thị
          if (!hasText) {
            jdText = isEn ? jdText_en : jdText_vi;
          }
        } catch (err) {
          logger.warn('Gemini AI failed during multimodal analysis:', err.message);
          // Fallback Engine: Nếu chỉ nộp ảnh mà Gemini sập -> throw 500 ngay lập tức, bỏ qua Regex
          if (!hasText) {
            return res.status(500).json({
              success: false,
              message: isEn ? 'Image analysis failed due to high traffic. Please try again later.' : 'Phân tích ảnh thất bại do hệ thống quá tải. Vui lòng thử lại sau.'
            });
          }
        }
      } else if (!hasText) {
        return res.status(500).json({
          success: false,
          message: isEn ? 'AI Scanning is currently unavailable. Please provide text for offline analysis.' : 'Tính năng quét ảnh AI đang gián đoạn. Vui lòng nhập văn bản để phân tích ngoại tuyến.'
        });
      }
    }

    // 2. Nếu không có ảnh, hoặc Gemini phân tích ảnh thất bại nhưng CÓ text -> Chạy Regex siêu tốc
    if (redFlags.length === 0 && hasText) {
      const regexFlags = analyzeWithRegex(jdText, lang);
      if (regexFlags.length > 0) {
        redFlags = regexFlags;
        if (isEn) {
          redFlags_en = regexFlags;
        } else {
          redFlags_vi = regexFlags;
        }
        riskLevel = regexFlags.length >= 2 ? 'HIGH' : 'MEDIUM';
      } else if (!imageBase64 && isGeminiConfigured()) {
        // 3. Nếu Regex không bắt được lỗi và chưa từng gọi Gemini -> Dùng Gemini quét ngữ nghĩa text
        try {
          const aiResult = await analyzeJDWithGemini(jdText, lang);

          const rawFlags = sortFlagsByPriority(aiResult.redFlags || []);
          redFlags_vi = rawFlags.map(flag => ({
            phrase: flag.phrase_vi || flag.phrase_en || flag.phrase || '',
            category: flag.category_vi || flag.category || 'LƯU Ý',
            reason: flag.reason_vi
          }));
          redFlags_en = rawFlags.map(flag => ({
            phrase: flag.phrase_en || flag.phrase_vi || flag.phrase || '',
            category: flag.category_en || flag.category || 'CAUTION',
            reason: flag.reason_en
          }));
          redFlags = isEn ? redFlags_en : redFlags_vi;

          marketBenchmark_vi = aiResult.marketBenchmark?.text_vi || '';
          marketBenchmark_en = aiResult.marketBenchmark?.text_en || '';
          marketBenchmark = isEn ? marketBenchmark_en : marketBenchmark_vi;

          // Tước quyền AI: chấm risk theo keyword bẫy nghiêm trọng
          const SEVERE_KEYWORDS = ['CỌC', 'DEPOSIT', 'TELEGRAM', 'ZALO', 'NHIỆM VỤ', 'TASK', 'THU PHÍ', 'NẠP TIỀN', 'FEE', 'UPFRONT', 'TRANSFER', 'WIRE'];
          const hasSevereTrap = rawFlags.some(flag => {
            const cat = (flag.category_en || flag.category_vi || flag.category || '').toUpperCase();
            const ph = (flag.phrase_en || flag.phrase_vi || flag.phrase || '').toUpperCase();
            return SEVERE_KEYWORDS.some(kw => cat.includes(kw) || ph.includes(kw));
          });
          riskLevel = rawFlags.length === 0 ? 'SAFE' : (hasSevereTrap ? 'HIGH' : 'MEDIUM');

          jdText_vi = aiResult.jdText_vi || '';
          jdText_en = aiResult.jdText_en || '';
        } catch (err) {
          logger.warn('Gemini AI failed during custom analysis:', err.message);
        }
      }
    }

    // 3. Tạo Benchmark đối chiếu thị trường nếu chưa có
    if (!marketBenchmark_vi || !marketBenchmark_en) {
      if (riskLevel === 'HIGH') {
        marketBenchmark_en = '🚨 HIGH RISK WARNING: This post contains multiple severe red flags under Labor Code 2019. Do NOT transfer funds or provide personal banking details.';
        marketBenchmark_vi = '🚨 CẢNH BÁO BÁO ĐỘNG ĐỎ: Bài đăng chứa nhiều dấu hiệu lừa đảo nghiêm trọng theo Điều 17 Bộ Luật Lao Động 2019. TUYỆT ĐỐI KHÔNG chuyển khoản giữ chỗ hoặc liên kết tài khoản ngân hàng.';
      } else if (riskLevel === 'MEDIUM') {
        marketBenchmark_en = '⚠️ CAUTION REQUIRED: Unofficial communication channels detected. Verify official company domain and tax registration code before proceeding.';
        marketBenchmark_vi = '⚠️ CẢNH BÁO RỦI RO: Có dấu hiệu liên hệ mập mờ qua kênh cá nhân. Cần kiểm tra Mã Số Thuế và tên miền website chính thức trước khi nộp CV.';
      } else {
        marketBenchmark_en = '🟢 TRANSPARENT POST: No malicious keywords or upfront deposit traps detected.';
        marketBenchmark_vi = '🟢 BÀI ĐĂNG ĐẠT CHUẨN MINH BẠCH: Không phát hiện từ khóa lừa cọc hay dấu hiệu bóc lột.';
      }
      marketBenchmark = isEn ? marketBenchmark_en : marketBenchmark_vi;
    }

    // 4. Lưu Audit Document vào MongoDB Atlas bất đồng bộ (Non-blocking < 1ms)
    const customId = 'custom-audit-' + Date.now();
    ScannedJob.create({
      title: isEn ? 'Inspected Custom JD' : 'Bài Đăng Kiểm Tra Tùy Chỉnh',
      company: isEn ? 'User Submitted Content' : 'Nội Dung Người Dùng Nhập',
      jdText: jdText || '',       // Fallback empty string khi image-only
      hasImage: !!imageBase64,    // Đánh dấu audit log có kèm ảnh
      redFlags,
      riskLevel,
      marketBenchmark,
      lang

    }).then((doc) => {
      logger.info(`Audit log saved into scanned_jobs MongoDB collection ID: ${doc._id}`);
    }).catch((dbErr) => {
      logger.warn('Failed to persist audit log into MongoDB Atlas:', dbErr.message);
    });

    // isImageScan dùng để xác định ban đầu user có nộp text hay không
    const isImageScan = !!imageBase64 && !hasText;
    return res.json({
      success: true,
      data: {
        id: customId,
        title: isImageScan ? '📸 Kết Quả Quét Ảnh AI' : 'Kết Quả Quét AI',
        title_en: isImageScan ? '📸 AI Image Scan Result' : 'AI Scan Result',
        company: 'Hệ thống CAREER X-RAY',
        company_en: 'CAREER X-RAY System',
        time: isEn ? 'Just now' : 'Vừa xong',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=CustomInspectorResult',
        jdText: jdText || '',          // '' thay vì undefined để tránh falsy check sai
        jdText_vi: jdText_vi || jdText || '',
        jdText_en: jdText_en || jdText || '',
        hasImage: isImageScan,
        redFlags,
        redFlags_vi,
        redFlags_en,
        riskLevel,
        marketBenchmark,
        marketBenchmark_vi,
        marketBenchmark_en,
        comments: [
          {
            "id": "audit_c1",
            "userName": "UNESCO MIL Assistant",
            "text_vi": "Luôn kiểm tra mã số thuế doanh nghiệp và KHÔNG BAO GIỜ đóng phí cọc!",
            "text_en": "Always verify corporate tax codes and NEVER make upfront deposits!",
            "isBot": false
          }
        ]
      }
    });

  } catch (error) {
    logger.error('Custom JD Analysis Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Controller Scan JD
exports.scanJD = async (req, res, next) => {
  const { jdText, jobId, lang = 'vi' } = req.body;

  // Lấy full job data từ MongoDB (đã có dual-data _vi/_en fields)
  const getFallbackWithDualData = async (id) => {
    try {
      const allCases = await Job.find({}).lean();
      for (const cat of allCases) {
        const found = cat.jobs?.find((j) => j.id === id);
        if (found) return found;
      }
    } catch (_) { }
    return await getFallbackJobData(id);
  };

  try {
    if (!isGeminiConfigured()) {
      throw new Error('No valid Gemini API Key provided. Switching to Fallback Mode.');
    }

    if (!jdText) {
      throw new Error('No raw JD text provided for live AI analysis. Switching to Fallback Mode.');
    }

    const aiResult = await analyzeJDWithGemini(jdText, lang);
    const fallbackData = await getFallbackWithDualData(jobId);

    // Merge AI red flags vào đúng language field, preserve dual-data fields còn lại
    const combinedData = {
      ...fallbackData,
      [`redFlags_${lang}`]: aiResult.redFlags || fallbackData[`redFlags_${lang}`] || fallbackData.redFlags,
      [`marketBenchmark_${lang}`]: aiResult.marketBenchmark || fallbackData[`marketBenchmark_${lang}`] || fallbackData.marketBenchmark
    };

    return res.json({
      success: true,
      mode: 'LIVE_AI',
      data: combinedData
    });

  } catch (error) {
    logger.warn('Gemini API Fallback Triggered:', error.message);

    const fallbackJob = await getFallbackWithDualData(jobId);

    return res.json({
      success: true,
      mode: 'OFFLINE_FALLBACK',
      data: fallbackJob
    });
  }
};

// Controller Scan Comments Botnet
exports.scanComments = async (req, res, next) => {
  const { comments, jobId } = req.body;

  try {
    if (!isGeminiConfigured()) {
      throw new Error('No valid Gemini API Key provided. Switching to Fallback Mode.');
    }

    if (!comments || comments.length === 0) {
      throw new Error('No comments provided for AI scan. Switching to Fallback Mode.');
    }

    const aiResult = await analyzeCommentsWithGemini(comments);

    return res.json({
      success: true,
      mode: 'LIVE_AI',
      data: aiResult
    });

  } catch (error) {
    logger.warn('Gemini Comment Scan Fallback Triggered:', error.message);

    const fallbackJob = await getFallbackJobData(jobId);

    return res.json({
      success: true,
      mode: 'OFFLINE_FALLBACK',
      data: { comments: fallbackJob.comments }
    });
  }
};
