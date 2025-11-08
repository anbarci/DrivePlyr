const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String, index: true },
  watchTime: { type: Number, default: 0 },
  duration: Number,
  completionRate: Number,
  device: { type: String, enum: ['desktop', 'tablet', 'mobile'], default: 'desktop' },
  browser: { name: String, version: String },
  country: { code: String, name: String },
  referrer: String,
  source: { type: String, enum: ['direct', 'search', 'social', 'referrer', 'other'], default: 'direct' },
  timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

analyticsSchema.index({ video: 1, timestamp: -1 });
analyticsSchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);