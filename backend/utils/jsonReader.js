const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const readJobsJson = () => {
  try {
    const filePath = path.join(__dirname, '../data/jobs.json');
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    logger.error('Failed to read jobs.json:', err.message);
    return [];
  }
};

module.exports = { readJobsJson };
