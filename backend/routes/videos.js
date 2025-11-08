const express = require('express');
const Video = require('../models/Video');
const Analytics = require('../models/Analytics');
const { protect, authorize } = require('../middleware/auth');
const { videoValidationRules, validate } = require('../middleware/validation');
const hotlink = require('../middleware/hotlink');

const router = express.Router();

router.get('/', hotlink, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    const search = req.query.search;

    let filter = { isPublic: true };
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const videos = await Video.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .populate('owner', 'username avatar');

    const total = await Video.countDocuments(filter);

    res.json({
      success: true,
      videos,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('owner', 'username avatar')
      .populate('subtitles');

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video bulunamadı' });
    }

    video.views += 1;
    await video.save();

    res.json({ success: true, video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, videoValidationRules(), validate, async (req, res) => {
  try {
    const { title, description, driveUrl, driveId, category, tags, poster, allowedDomains } = req.body;

    const videoExists = await Video.findOne({ driveId });
    if (videoExists) {
      return res.status(400).json({ success: false, message: 'Bu video zaten mevcut' });
    }

    const video = await Video.create({
      title,
      description,
      driveUrl,
      driveId,
      category,
      tags,
      poster,
      allowedDomains,
      owner: req.user._id
    });

    res.status(201).json({ success: true, video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    let video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video bulunamadı' });
    if (video.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Yetkisiz işem' });
    }

    video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video bulunamadı' });
    if (video.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Yetkisiz işem' });
    }

    await Video.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Video silindi' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stats/trending', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const limit = parseInt(req.query.limit) || 10;
    const date = new Date();
    date.setDate(date.getDate() - days);

    const videos = await Video.find({ createdAt: { $gte: date }, isPublic: true })
      .sort({ views: -1 })
      .limit(limit);

    res.json({ success: true, videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:id/view', async (req, res) => {
  try {
    const { device, browser, country, referrer } = req.body;
    await Analytics.create({
      video: req.params.id,
      user: req.user?._id,
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