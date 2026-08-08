const mongoose = require('mongoose');

const RedFlagSchema = new mongoose.Schema({
  phrase: { type: String },
  reason: { type: String },
  category: { type: String }
}, { _id: false });

const CommentSchema = new mongoose.Schema({
  id: { type: String },
  userName: { type: String },
  avatar: { type: String },
  // Dual-Data: bilingual comment text
  text: { type: String },
  text_vi: { type: String },
  text_en: { type: String },
  isBot: { type: Boolean, default: false },
  botReason: { type: String },
  botReason_vi: { type: String },
  botReason_en: { type: String }
}, { _id: false });

const SingleJobSchema = new mongoose.Schema({
  id: { type: String },
  jobId: { type: String },
  title: { type: String },
  title_en: { type: String },
  company: { type: String },
  company_en: { type: String },
  time: { type: String },
  avatarUrl: { type: String },
  // Dual-Data: bilingual job description text
  jdText: { type: String },
  jdText_vi: { type: String },
  jdText_en: { type: String },
  // Dual-Data: bilingual market benchmark
  marketBenchmark: { type: String },
  marketBenchmark_vi: { type: String },
  marketBenchmark_en: { type: String },
  // Dual-Data: bilingual red flags arrays
  redFlags: [RedFlagSchema],
  redFlags_vi: [RedFlagSchema],
  redFlags_en: [RedFlagSchema],
  comments: [CommentSchema]
}, { _id: false });

const JobSchema = new mongoose.Schema({
  caseId: { type: String },
  // Dual-Data: bilingual case titles & badges
  caseTitle: { type: String },
  caseTitle_en: { type: String },
  caseBadge: { type: String },
  caseBadge_en: { type: String },
  jobs: [SingleJobSchema],

  // Flat job fields (for single-job fallback compatibility)
  id: { type: String },
  jobId: { type: String },
  title: { type: String },
  title_en: { type: String },
  company: { type: String },
  company_en: { type: String },
  time: { type: String },
  avatarUrl: { type: String },
  jdText: { type: String },
  jdText_vi: { type: String },
  jdText_en: { type: String },
  marketBenchmark: { type: String },
  marketBenchmark_vi: { type: String },
  marketBenchmark_en: { type: String },
  redFlags: [RedFlagSchema],
  redFlags_vi: [RedFlagSchema],
  redFlags_en: [RedFlagSchema],
  comments: [CommentSchema]
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Job', JobSchema);
