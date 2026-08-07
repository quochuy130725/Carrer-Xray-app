const { readJobsJson } = require('../utils/jsonReader');
const Job = require('../models/Job');
const logger = require('../utils/logger');

const getFallbackJobData = async (jobId) => {
  try {
    // 1. Thử truy vấn MongoDB nếu có
    const mongoJob = await Job.findOne({ jobId }).lean();
    if (mongoJob) {
      return mongoJob;
    }
  } catch (err) {
    logger.warn('MongoDB query failed in FallbackService, switching to jobs.json:', err.message);
  }

  // 2. Đọc file JSON cục bộ
  const mockData = readJobsJson();
  const fallbackJob = mockData.find((j) => j.id === jobId || j.jobId === jobId) || mockData[0];
  return fallbackJob;
};

module.exports = { getFallbackJobData };
