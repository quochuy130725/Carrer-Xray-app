const { analyzeJDWithGemini, analyzeCommentsWithGemini } = require('../services/geminiService');
const { getFallbackJobData } = require('../services/fallbackService');
const logger = require('../utils/logger');

// Controller Scan JD
exports.scanJD = async (req, res, next) => {
  const { jdText, jobId } = req.body;

  try {
    // Nếu không có API Key hoặc key mặc định, chuyển sang Fallback
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      throw new Error('No valid Gemini API Key provided. Switching to Fallback Mode.');
    }

    if (!jdText) {
      throw new Error('No raw JD text provided for live AI analysis. Switching to Fallback Mode.');
    }

    // Gọi service Gemini
    const aiResult = await analyzeJDWithGemini(jdText);
    const fallbackData = await getFallbackJobData(jobId);

    const combinedData = {
      ...fallbackData,
      redFlags: aiResult.redFlags || fallbackData.redFlags,
      marketBenchmark: aiResult.marketBenchmark || fallbackData.marketBenchmark
    };

    return res.json({
      success: true,
      mode: 'LIVE_AI',
      data: combinedData
    });

  } catch (error) {
    logger.warn('Gemini API Fallback Triggered:', error.message);

    const fallbackJob = await getFallbackJobData(jobId);

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
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
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
