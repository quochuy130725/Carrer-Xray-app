const { analyzeJDWithGemini, analyzeCommentsWithGemini } = require('../services/geminiService');
const { getFallbackJobData } = require('../services/fallbackService');
const { isGeminiConfigured } = require('../config/gemini');
const { readJobsJson } = require('../utils/jsonReader');
const { analyzeWithRegex } = require('../services/regexService');
const Job = require('../models/Job');
const ScannedJob = require('../models/ScannedJob');
const logger = require('../utils/logger');

// Controller Lấy danh sách Case Studies (Ưu tiên từ MongoDB Atlas / Local MongoDB)
// Smart Dual-Data Fallback: nếu MongoDB data thiếu trường _vi/_en → dùng local jobs.json mới nhất
exports.getCases = async (req, res, next) => {
  try {
    const dbCases = await Job.find({}).lean();
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
  const { jdText, lang = 'en' } = req.body;
  const isEn = lang === 'en';

  try {
    if (!jdText || jdText.trim() === '') {
      return res.status(400).json({
        success: false,
        message: isEn ? 'Please provide job description text to inspect.' : 'Vui lòng cung cấp nội dung bài đăng tuyển dụng để kiểm tra.'
      });
    }

    let redFlags = [];
    let marketBenchmark = '';
    let riskLevel = 'SAFE';

    // 1. Tối Ưu Tốc Độ Siêu Tốc: Quét Regex Engine Trước (< 2ms)
    const regexFlags = analyzeWithRegex(jdText, lang);
    if (regexFlags.length > 0) {
      redFlags = regexFlags;
      riskLevel = regexFlags.length >= 2 ? 'HIGH' : 'MEDIUM';
    } else if (isGeminiConfigured()) {
      // 2. Nếu Regex chưa thấy bẫy, dùng Gemini AI quét ngữ nghĩa chuyên sâu
      try {
        const aiResult = await analyzeJDWithGemini(jdText, lang);
        redFlags = aiResult.redFlags || [];
        marketBenchmark = aiResult.marketBenchmark || '';
        riskLevel = aiResult.riskLevel || 'SAFE';
      } catch (err) {
        logger.warn('Gemini AI failed during custom analysis:', err.message);
      }
    }

    // 3. Tạo Benchmark đối chiếu thị trường nếu chưa có
    if (!marketBenchmark) {
      if (riskLevel === 'HIGH') {
        marketBenchmark = isEn
          ? '🚨 HIGH RISK WARNING: This post contains multiple severe red flags under Labor Code 2019. Do NOT transfer funds or provide personal banking details.'
          : '🚨 CẢNH BÁO BÁO ĐỘNG ĐỎ: Bài đăng chứa nhiều dấu hiệu lừa đảo nghiêm trọng theo Điều 17 Bộ Luật Lao Động 2019. TUYỆT ĐỐI KHÔNG chuyển khoản giữ chỗ hoặc liên kết tài khoản ngân hàng.';
      } else if (riskLevel === 'MEDIUM') {
        marketBenchmark = isEn
          ? '⚠️ CAUTION REQUIRED: Unofficial communication channels detected. Verify official company domain and tax registration code before proceeding.'
          : '⚠️ CẢNH BÁO RỦI RO: Có dấu hiệu liên hệ mập mờ qua kênh cá nhân. Cần kiểm tra Mã Số Thuế và tên miền website chính thức trước khi nộp CV.';
      } else {
        marketBenchmark = isEn
          ? '🟢 TRANSPARENT POST: No malicious keywords or upfront deposit traps detected.'
          : '🟢 BÀI ĐĂNG ĐẠT CHUẨN MINH BẠCH: Không phát hiện từ khóa lừa cọc hay dấu hiệu bóc lột.';
      }
    }

    // 4. Lưu Audit Document vào MongoDB Atlas bất đồng bộ (Non-blocking < 1ms)
    const customId = 'custom-audit-' + Date.now();
    ScannedJob.create({
      title: isEn ? 'Inspected Custom JD' : 'Bài Đăng Kiểm Tra Tùy Chỉnh',
      company: isEn ? 'User Submitted Content' : 'Nội Dung Người Dùng Nhập',
      jdText,
      redFlags,
      riskLevel,
      marketBenchmark,
      lang
    }).then((doc) => {
      logger.info(`Audit log saved into scanned_jobs MongoDB collection ID: ${doc._id}`);
    }).catch((dbErr) => {
      logger.warn('Failed to persist audit log into MongoDB Atlas:', dbErr.message);
    });

    return res.json({
      success: true,
      data: {
        id: customId,
        title: isEn ? 'Inspected Custom Job Post' : 'Bài Đăng Tuyển Dụng Vừa Kiểm Tra',
        company: isEn ? 'Custom Inspected Content' : 'Nội Dung Kiểm Tra Tùy Chỉnh',
        time: isEn ? 'Just now' : 'Vừa xong',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=CustomInspectorResult',
        jdText,
        redFlags,
        riskLevel,
        marketBenchmark,
        comments: [
          {
            "id": "audit_c1",
            "userName": "UNESCO MIL Assistant",
            "text": isEn
              ? "Always verify corporate tax codes and NEVER make upfront deposits!"
              : "Luôn kiểm tra mã số thuế doanh nghiệp và KHÔNG BAO GIỜ đóng phí cọc!",
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
    } catch (_) {}
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
