const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/career_xray';
    await mongoose.connect(mongoUri);
    console.log('🍃 Connected to Local MongoDB successfully!');
  } catch (err) {
    console.warn('⚠️ MongoDB connection error, system will use jobs.json Fallback:', err.message);
  }
};

module.exports = connectDB;
