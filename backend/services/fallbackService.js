const { readJobsJson } = require('../utils/jsonReader');
const Job = require('../models/Job');
const logger = require('../utils/logger');

const getFallbackJobData = async (jobId) => {
  // 1. Thử tìm kiếm bài đăng trong MongoDB (Atlas hoặc Local)
  try {
    const mongoDocs = await Job.find({}).lean();
    let mongoJobs = [];

    if (Array.isArray(mongoDocs)) {
      mongoDocs.forEach((doc) => {
        if (doc.jobs && Array.isArray(doc.jobs)) {
          mongoJobs.push(...doc.jobs);
        } else if (doc.id || doc.jobId) {
          mongoJobs.push(doc);
        }
      });
    }

    const foundMongoJob = mongoJobs.find((j) => j.id === jobId || j.jobId === jobId);
    if (foundMongoJob && foundMongoJob.jdText) {
      return foundMongoJob;
    }
  } catch (err) {
    logger.warn('MongoDB query failed in FallbackService, switching to jobs.json:', err.message);
  }

  // 2. Nếu MongoDB chưa có hoặc lỗi, đọc từ jobs.json cục bộ
  const rawData = readJobsJson();
  let localJobs = [];

  if (Array.isArray(rawData)) {
    rawData.forEach((item) => {
      if (item.jobs && Array.isArray(item.jobs)) {
        localJobs.push(...item.jobs);
      } else {
        localJobs.push(item);
      }
    });
  }

  const fallbackJob = localJobs.find((j) => j.id === jobId || j.jobId === jobId) || localJobs[0];
  return fallbackJob;
};

module.exports = { getFallbackJobData };
