const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Job = require('../models/Job');
const logger = require('../utils/logger');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/career_xray';
    await mongoose.connect(mongoUri);
    logger.info('Kết nối MongoDB thành công để nạp dữ liệu!');

    const rawData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/jobs.json'), 'utf8')
    );

    // Xóa collection cũ
    try {
      await Job.collection.dropIndexes();
    } catch (e) {}
    await Job.deleteMany({});

    // Nạp nguyên vẹn cấu trúc 5 Case Categories vào MongoDB
    await Job.insertMany(rawData);
    logger.info(`Nạp thành công ${rawData.length} Case Categories vào MongoDB database!`);

    process.exit(0);
  } catch (err) {
    logger.error('Lỗi khi nạp dữ liệu vào MongoDB:', err.message);
    process.exit(1);
  }
};

seedDB();
