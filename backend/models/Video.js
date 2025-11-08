const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Video başlığı gerekli'],
    trim: true,
    maxlength: [200, 'Başlık en fazla 200 karakter olabilir']
  },
  description: {
    type: String,
    maxlength: [2000, 'Açıklama en fazla 2000 karakter olabilir']
  },
  driveId: {
    type: String,
    required: [true, 'Google Drive ID gerekli'],
    unique: true
  },
  driveUrl: {
    type: String,
    required: [true, 'Google Drive URL gerekli']
  },
  poster: {
    type: String,
    default: function() {
      return `https://lh3.googleusercontent.com/d/${this.driveId}`;
    }
  },
  duration: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['movie', 'series', 'documentary', 'anime', 'music', 'educational', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  allowedDomains: [{
    type: String
  }],
  subtitles: [{
    language: String,
    label: String,
    url: String,
    isDefault: Boolean
  }],
  quality: [{
    resolution: String,
    url: String,
    size: Number
  }],
  metadata: {
    fileSize: Number,
    mimeType: String,
    uploadDate: Date
  },
  analytics: {
    dailyViews: [{
      date: Date,
      count: Number
    }],
    averageWatchTime: Number,
    completionRate: Number
  },
  status: {
    type: String,
    enum: ['active', 'processing', 'inactive', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
VideoSchema.index({ title: 'text', description: 'text', tags: 'text' });
VideoSchema.index({ category: 1, createdAt: -1 });
VideoSchema.index({ owner: 1 });
VideoSchema.index({ views: -1 });

// Virtual for embed URL
VideoSchema.virtual('embedUrl').get(function() {
  return `https://anbarci.github.io/DrivePlyr/plyr.html?id=${this.driveId}`;
});

// Increment view count
VideoSchema.methods.incrementViews = async function() {
  this.views += 1;
  
  // Update daily analytics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayAnalytics = this.analytics.dailyViews.find(
    view => view.date.getTime() === today.getTime()
  );
  
  if (todayAnalytics) {
    todayAnalytics.count += 1;
  } else {
    this.analytics.dailyViews.push({ date: today, count: 1 });
  }
  
  await this.save();
};

module.exports = mongoose.model('Video', VideoSchema);