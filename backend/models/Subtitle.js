const mongoose = require('mongoose');

const subtitleSchema = new mongoose.Schema({
  video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true, index: true },
  language: {
    type: String,
    required: true,
    enum: ['Turkish', 'English', 'Arabic', 'French', 'German', 'Spanish', 'Italian', 'Portuguese', 'Russian', 'Chinese', 'Japanese', 'Korean']
  },
  languageCode: { type: String, required: true, enum: ['tr', 'en', 'ar', 'fr', 'de', 'es', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'] },
  label: String,
  content: { type: String, required: true },
  format: { type: String, enum: ['srt', 'vtt', 'ass', 'ssa'], default: 'vtt' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isDefault: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  downloadCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

subtitleSchema.methods.convertToVTT = function() {
  if (this.format === 'vtt') return this.content;
  let vtt = 'WEBVTT\n\n';
  const lines = this.content.split('\n');
  lines.forEach(line => {
    if (!line.match(/^\d+$/) && line.trim()) {
      if (line.match(/\d{2}:\d{2}:\d{2},\d{3}/)) {
        vtt += line.replace(/,/g, '.') + '\n';
      } else {
        vtt += line + '\n';
      }
    }
  });
  return vtt;
};

module.exports = mongoose.model('Subtitle', subtitleSchema);