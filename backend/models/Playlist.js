const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Playlist adı gerekli'],
    trim: true,
    maxlength: [100, 'Playlist adı en fazla 100 karakter olabilir']
  },
  description: {
    type: String,
    maxlength: [500, 'Açıklama en fazla 500 karakter olabilir']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videos: [{
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video'
    },
    order: {
      type: Number,
      default: 0
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  thumbnail: {
    type: String
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['movie', 'series', 'documentary', 'anime', 'music', 'educational', 'mixed', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: [{
      type: String,
      enum: ['view', 'edit', 'add_videos', 'remove_videos', 'manage']
    }],
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
PlaylistSchema.index({ name: 'text', description: 'text' });
PlaylistSchema.index({ owner: 1, createdAt: -1 });
PlaylistSchema.index({ category: 1 });

// Virtual for video count
PlaylistSchema.virtual('videoCount').get(function() {
  return this.videos.length;
});

// Virtual for total duration
PlaylistSchema.virtual('totalDuration').get(function() {
  return this.videos.reduce((total, item) => {
    return total + (item.video?.duration || 0);
  }, 0);
});

// Method to add video to playlist
PlaylistSchema.methods.addVideo = async function(videoId, order) {
  const exists = this.videos.some(item => 
    item.video.toString() === videoId.toString()
  );
  
  if (exists) {
    throw new Error('Video playlist\'te zaten mevcut');
  }
  
  this.videos.push({
    video: videoId,
    order: order || this.videos.length,
    addedAt: new Date()
  });
  
  await this.save();
};

// Method to remove video from playlist
PlaylistSchema.methods.removeVideo = async function(videoId) {
  this.videos = this.videos.filter(item => 
    item.video.toString() !== videoId.toString()
  );
  
  // Reorder remaining videos
  this.videos.forEach((item, index) => {
    item.order = index;
  });
  
  await this.save();
};

// Method to reorder videos
PlaylistSchema.methods.reorderVideos = async function(videoOrders) {
  videoOrders.forEach(({ videoId, order }) => {
    const video = this.videos.find(item => 
      item.video.toString() === videoId.toString()
    );
    if (video) {
      video.order = order;
    }
  });
  
  this.videos.sort((a, b) => a.order - b.order);
  await this.save();
};

module.exports = mongoose.model('Playlist', PlaylistSchema);