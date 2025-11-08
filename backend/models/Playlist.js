const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true
  },
  description: { type: String, trim: true, maxlength: 500 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  videos: [{
    video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
    order: Number,
    addedAt: { type: Date, default: Date.now }
  }],
  poster: String,
  isPublic: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

playlistSchema.virtual('videoCount').get(function() {
  return this.videos.length;
});

playlistSchema.methods.addVideo = function(videoId, order) {
  const videoExists = this.videos.some(v => v.video.toString() === videoId);
  if (!videoExists) {
    this.videos.push({ video: videoId, order: order !== undefined ? order : this.videos.length });
    return this.save();
  }
  throw new Error('Video zaten bu playlistte var');
};

playlistSchema.methods.removeVideo = function(videoId) {
  this.videos = this.videos.filter(v => v.video.toString() !== videoId);
  return this.save();
};

module.exports = mongoose.model('Playlist', playlistSchema);