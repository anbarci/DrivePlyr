const express = require('express');
const Analytics = require('../models/Analytics');
const Video = require('../models/Video');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/video/:videoId', protect, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const date = new Date();
    date.setDate(date.getDate() - days);

    const analytics = await Analytics.find({
      video: req.params.videoId,
      timestamp: { $gte: date }
    });

    const totalViews = analytics.length;
    const avgWatchTime = analytics.reduce((acc, a) => acc + (a.watchTime || 0), 0) / (analytics.length || 1);
    const deviceBreakdown = {};

    analytics.forEach(a => {
      deviceBreakdown[a.device] = (deviceBreakdown[a.device] || 0) + 1;
    });

    res.json({
      success: true,
      totalViews,
      avgWatchTime,
      deviceBreakdown,
      analytics
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