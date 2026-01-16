const express = require('express');
const Analytics = require('../models/Analytics');
const Video = require('../models/Video');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const buildStartDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const buildDeviceBreakdown = (analytics) => analytics.reduce((acc, entry) => {
  const deviceKey = entry.device || 'unknown';
  acc[deviceKey] = (acc[deviceKey] || 0) + 1;
  return acc;
}, {});

router.get('/video/:videoId', protect, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const date = buildStartDate(days);

    const analytics = await Analytics.find({
      video: req.params.videoId,
      timestamp: { $gte: date }
    });

    const totalViews = analytics.length;
    const totalWatchTime = analytics.reduce((acc, a) => acc + (a.watchTime || 0), 0);
    const avgWatchTime = totalWatchTime / (analytics.length || 1);
    const deviceBreakdown = buildDeviceBreakdown(analytics);

    res.json({
      success: true,
      totalViews,
      totalWatchTime,
      avgWatchTime,
      deviceBreakdown,
      analytics
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/video/:videoId/panel', protect, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const date = buildStartDate(days);

    const video = await Video.findById(req.params.videoId).populate('owner', 'username email');
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video bulunamadı' });
    }
    if (video.owner._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Yetkisiz işlem' });
    }

    const analytics = await Analytics.find({
      video: req.params.videoId,
      timestamp: { $gte: date }
    });

    const totalViews = analytics.length;
    const totalWatchTime = analytics.reduce((acc, a) => acc + (a.watchTime || 0), 0);
    const avgWatchTime = totalWatchTime / (analytics.length || 1);
    const deviceBreakdown = buildDeviceBreakdown(analytics);

    const dailyViews = await Analytics.aggregate([
      { $match: { video: video._id, timestamp: { $gte: date } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          views: { $sum: 1 },
          watchTime: { $sum: '$watchTime' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const topReferrers = await Analytics.aggregate([
      { $match: { video: video._id, timestamp: { $gte: date } } },
      { $group: { _id: '$referrer', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 }
    ]);

    const uniqueSessions = await Analytics.distinct('sessionId', {
      video: video._id,
      timestamp: { $gte: date },
      sessionId: { $ne: null }
    });

    res.json({
      success: true,
      video,
      summary: {
        totalViews,
        uniqueSessions: uniqueSessions.length,
        totalWatchTime,
        avgWatchTime
      },
      breakdown: {
        device: deviceBreakdown,
        referrers: topReferrers
      },
      dailyViews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const limit = parseInt(req.query.limit) || 10;
    const date = new Date();
    date.setDate(date.getDate() - days);

    const trending = await Analytics.aggregate([
      { $match: { timestamp: { $gte: date } } },
      { $group: { _id: '$video', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: limit },
      { $lookup: { from: 'videos', localField: '_id', foreignField: '_id', as: 'video' } }
    ]);

    res.json({ success: true, trending });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const date = buildStartDate(days);

    const [totalUsers, totalVideos, activeUsers, newVideos] = await Promise.all([
      User.countDocuments(),
      Video.countDocuments(),
      User.countDocuments({ isActive: true }),
      Video.countDocuments({ createdAt: { $gte: date } })
    ]);

    const analyticsSummary = await Analytics.aggregate([
      { $match: { timestamp: { $gte: date } } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: 1 },
          totalWatchTime: { $sum: '$watchTime' }
        }
      }
    ]);

    const totals = analyticsSummary[0] || { totalViews: 0, totalWatchTime: 0 };

    const topVideos = await Analytics.aggregate([
      { $match: { timestamp: { $gte: date } } },
      { $group: { _id: '$video', views: { $sum: 1 }, watchTime: { $sum: '$watchTime' } } },
      { $sort: { views: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'videos', localField: '_id', foreignField: '_id', as: 'video' } },
      { $unwind: '$video' },
      {
        $project: {
          _id: 0,
          videoId: '$_id',
          title: '$video.title',
          views: 1,
          watchTime: 1
        }
      }
    ]);

    res.json({
      success: true,
      overview: {
        totalUsers,
        activeUsers,
        totalVideos,
        newVideos,
        totalViews: totals.totalViews,
        totalWatchTime: totals.totalWatchTime
      },
      topVideos
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/track', async (req, res) => {
  try {
    const { videoId, watchTime, device, browser, country, referrer } = req.body;

    await Analytics.create({
      video: videoId,
      user: req.user?._id,
      watchTime,
      device,
      browser,
      country,
      referrer
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
