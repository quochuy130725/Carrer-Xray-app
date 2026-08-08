const mongoose = require('mongoose');
const logger = require('../utils/logger');

const LOCAL_FALLBACK_URI = 'mongodb://127.0.0.1:27017/career_xray';

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;

  if (primaryUri) {
    try {
      await mongoose.connect(primaryUri);
      logger.info('Connected to Primary MongoDB (Atlas) successfully!');
      return;
    } catch (err) {
      logger.warn(`Primary MongoDB Atlas connection failed (${err.message}). Trying local MongoDB fallback...`);
    }
  }

  // Thử kết nối MongoDB Local nếu Atlas bị nghẽn DNS/mạng
  try {
    await mongoose.connect(LOCAL_FALLBACK_URI);
    logger.info('Connected to Local MongoDB successfully!');
  } catch (localErr) {
    logger.warn('MongoDB connection error, system will use jobs.json Fallback:', localErr.message);
  }
};

module.exports = connectDB;
