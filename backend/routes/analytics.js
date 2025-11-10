const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const Video = require('../models/Video');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/analytics/video/:videoId
// @desc    Get analytics for specific video
// @access  Private (video owner or admin)
router.get('/video/:videoId', protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);

    if (!video) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Video bulunamadı' 
      });
    }

    // Check ownership or admin
    if (video.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Bu işlemi yapmaya yetkiniz yok' 
      });
    }

    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await Analytics.getVideoAnalytics(
      req.params.videoId,
      startDate,
      new Date()
    );

    const dailyAnalytics = await Analytics.find({
      video: req.params.videoId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    res.json({
      status: 'success',
      data: {
        summary: analytics[0] || {},
        daily: dailyAnalytics
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// @route   GET /api/analytics/trending
// @desc    Get trending videos
// @access  Private
router.get('/trending', protect, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const limit = parseInt(req.query.limit) || 10;

    const trending = await Analytics.getTrendingVideos(days, limit);

    res.json({
      status: 'success',
      data: trending
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// @route   GET /api/analytics/overview
// @desc    Get overall analytics overview
// @access  Private/Admin
router.get('/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const overview = await Analytics.aggregate([
      {
        $match: {
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          totalUniqueViews: { $sum: '$uniqueViews' },
          totalWatchTime: { $sum: '$watchTime.total' },
          avgWatchTime: { $avg: '$watchTime.average' },
          totalLikes: { $sum: '$engagement.likes' },
          totalShares: { $sum: '$engagement.shares' }
        }
      }
    ]);

    const dailyStats = await Analytics.aggregate([
      {
        $match: {
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$date',
          views: { $sum: '$views' },
          uniqueViews: { $sum: '$uniqueViews' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const topCountries = await Analytics.aggregate([
      {
        $match: {
          date: { $gte: startDate }
        }
      },
      { $unwind: '$countries' },
      {
        $group: {
          _id: '$countries.code',
          name: { $first: '$countries.name' },
          totalViews: { $sum: '$countries.count' }
        }
      },
      {
        $sort: { totalViews: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      status: 'success',
      data: {
        overview: overview[0] || {},
        dailyStats,
        topCountries
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// @route   POST /api/analytics/track
// @desc    Track video view
// @access  Public
router.post('/track', async (req, res) => {
  try {
    const { videoId, watchTime, device, browser, country, referrer } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let analytics = await Analytics.findOne({
      video: videoId,
      date: today
    });

    if (!analytics) {
      analytics = await Analytics.create({
        video: videoId,
        date: today
      });
    }

    // Update analytics
    analytics.views += 1;
    analytics.uniqueViews += 1; // This should be improved with IP tracking
    analytics.watchTime.total += watchTime || 0;
    analytics.watchTime.average = analytics.watchTime.total / analytics.views;

    // Update device stats
    if (device) {
      analytics.devices[device] = (analytics.devices[device] || 0) + 1;
    }

    // Update browser stats
    if (browser) {
      const browserStat = analytics.browsers.find(b => b.name === browser);
      if (browserStat) {
        browserStat.count += 1;
      } else {
        analytics.browsers.push({ name: browser, count: 1 });
      }
    }

    // Update country stats
    if (country) {
      const countryStat = analytics.countries.find(c => c.code === country.code);
      if (countryStat) {
        countryStat.count += 1;
      } else {
        analytics.countries.push(country);
      }
    }

    // Update referrer
    if (referrer) {
      const referrerStat = analytics.referrers.find(r => r.domain === referrer);
      if (referrerStat) {
        referrerStat.count += 1;
      } else {
        analytics.referrers.push({ domain: referrer, count: 1 });
      }
    }

    await analytics.save();

    res.json({
      status: 'success',
      message: 'Analytics kaydedildi'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

module.exports = router;