const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  views: {
    type: Number,
    default: 0
  },
  uniqueViews: {
    type: Number,
    default: 0
  },
  watchTime: {
    total: {
      type: Number,
      default: 0
    },
    average: {
      type: Number,
      default: 0
    }
  },
  engagement: {
    likes: {
      type: Number,
      default: 0
    },
    dislikes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    }
  },
  traffic: {
    direct: {
      type: Number,
      default: 0
    },
    embed: {
      type: Number,
      default: 0
    },
    search: {
      type: Number,
      default: 0
    },
    social: {
      type: Number,
      default: 0
    }
  },
  devices: {
    desktop: {
      type: Number,
      default: 0
    },
    mobile: {
      type: Number,
      default: 0
    },
    tablet: {
      type: Number,
      default: 0
    }
  },
  browsers: [{
    name: String,
    count: Number
  }],
  countries: [{
    code: String,
    name: String,
    count: Number
  }],
  referrers: [{
    domain: String,
    count: Number
  }],
  hourlyDistribution: [{
    hour: Number,
    views: Number
  }]
}, {
  timestamps: true
});

// Compound index for efficient queries
AnalyticsSchema.index({ video: 1, date: -1 });
AnalyticsSchema.index({ date: -1 });

// Static method to get video analytics for date range
AnalyticsSchema.statics.getVideoAnalytics = async function(videoId, startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        video: mongoose.Types.ObjectId(videoId),
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: '$video',
        totalViews: { $sum: '$views' },
        totalUniqueViews: { $sum: '$uniqueViews' },
        totalWatchTime: { $sum: '$watchTime.total' },
        avgWatchTime: { $avg: '$watchTime.average' },
        totalLikes: { $sum: '$engagement.likes' },
        totalDislikes: { $sum: '$engagement.dislikes' },
        totalShares: { $sum: '$engagement.shares' }
      }
    }
  ]);
};

// Static method to get trending videos
AnalyticsSchema.statics.getTrendingVideos = async function(days = 7, limit = 10) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$video',
        totalViews: { $sum: '$views' },
        avgEngagement: {
          $avg: {
            $add: ['$engagement.likes', '$engagement.shares']
          }
        }
      }
    },
    {
      $sort: { totalViews: -1, avgEngagement: -1 }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'videos',
        localField: '_id',
        foreignField: '_id',
        as: 'video'
      }
    },
    {
      $unwind: '$video'
    }
  ]);
};

module.exports = mongoose.model('Analytics', AnalyticsSchema);