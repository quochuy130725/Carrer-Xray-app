const mongoose = require('mongoose');

const RedFlagSchema = new mongoose.Schema({
  phrase: { type: String, required: true },
  reason: { type: String, required: true },
  category: { type: String }
}, { _id: false });

const ScannedJobSchema = new mongoose.Schema({
  title: { type: String, default: 'Custom Inspected JD' },
  company: { type: String, default: 'User Submitted Content' },
  jdText: { type: String, default: '' },      // Optional: empty khi scan image-only
  hasImage: { type: Boolean, default: false }, // True khi user upload ảnh
  redFlags: [RedFlagSchema],
  riskLevel: {
    type: String,
    enum: ['HIGH', 'MEDIUM', 'SAFE'],
    default: 'SAFE'
  },
  marketBenchmark: { type: String },
  lang: { type: String, default: 'en' },
  scannedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ScannedJob', ScannedJobSchema);
