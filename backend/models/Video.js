const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Video başlığı gerekli'],
    trim: true,
    maxlength: 200,
    index: true
  },
  description: { type: String, trim: true, maxlength: 2000 },
  driveId: { type: String, required: true, unique: true, index: true },
  driveUrl: { type: String, required: true },
  poster: String,
  category: {
    type: String,
    enum: ['movie', 'series', 'documentary', 'educational', 'other'],
    default: 'other',
    index: true
  },
  tags: [{ type: String, lowercase: true }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  subtitles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subtitle' }],
  isPublic: { type: Boolean, default: true },
  allowedDomains: [String],
  createdAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

videoSchema.index({ createdAt: -1 });
videoSchema.index({ views: -1 });
videoSchema.index({ title: 'text', description: 'text' });

videoSchema.methods.getEmbedCode = function(playerType = 'plyr', width = 560, height = 315) {
  const encodedUrl = encodeURIComponent(this.driveUrl);
  const encodedTitle = encodeURIComponent(this.title);
  const baseUrl = process.env.FRONTEND_URL || 'https://driveplyr.com';
  return `<iframe width="${width}" height="${height}" src="${baseUrl}/player.html?videoUrl=${encodedUrl}&title=${encodedTitle}&player=${playerType}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
};

module.exports = mongoose.model('Video', videoSchema);