const mongoose = require('mongoose');

const RedFlagSchema = new mongoose.Schema({
  phrase: { type: String, required: true },
  reason: { type: String, required: true },
  category: { type: String }
});

const CommentSchema = new mongoose.Schema({
  id: { type: String },
  userName: { type: String },
  avatarUrl: { type: String },
  text: { type: String },
  isBot: { type: Boolean, default: false },
  botReason: { type: String }
});

const JobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  jdText: { type: String, required: true },
  marketBenchmark: { type: String },
  redFlags: [RedFlagSchema],
  comments: [CommentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
