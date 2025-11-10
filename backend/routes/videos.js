const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const Video = require('../models/Video');
const { protect, authorize, checkPermission } = require('../middleware/auth');
const { checkHotlink } = require('../middleware/hotlink');

// @route   GET /api/videos
// @desc    Get all videos with filtering, sorting, pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isIn(['movie', 'series', 'documentary', 'anime', 'music', 'educational', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = { status: 'active', isPublic: true };
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Sort
    let sort = {};
    if (req.query.sort) {
      const sortField = req.query.sort.startsWith('-') 
        ? req.query.sort.substring(1) 
        : req.query.sort;
      const sortOrder = req.query.sort.startsWith('-') ? -1 : 1;
      sort[sortField] = sortOrder;
    } else {
      sort = { createdAt: -1 };
    }

    const videos = await Video.find(query)
      .populate('owner', 'username avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Video.countDocuments(query);

    res.json({
      status: 'success',
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: videos
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// @route   GET /api/videos/:id
// @desc    Get single video
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('owner', 'username avatar');

    if (!video) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Video bulunamadı' 
      });
    }

    res.json({
      status: 'success',
      data: video
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// @route   POST /api/videos
// @desc    Create new video
// @access  Private (requires videos.create permission)
router.post('/', protect, checkPermission('videos.create'), [
  body('title').trim().notEmpty().withMessage('Başlık gerekli'),
  body('driveUrl').isURL().withMessage('Geçerli URL girin')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }

    // Extract Drive ID from URL
    const driveIdMatch = req.body.driveUrl.match(/[-\w]{25,}/);
    if (!driveIdMatch) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Geçersiz Google Drive URL' 
      });
    }

    const video = await Video.create({
      ...req.body,
      driveId: driveIdMatch[0],
      owner: req.user.id
    });

    res.status(201).json({
      status: 'success',
      data: video
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Bu video zaten eklenmiş' 
      });
    }
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// @route   PUT /api/videos/:id
// @desc    Update video
// @access  Private (owner or admin)
router.put('/:id', protect, async (req, res) => {
  try {
    let video = await Video.findById(req.params.id);

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

    video = await Video.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      status: 'success',
      data: video
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// @route   DELETE /api/videos/:id
// @desc    Delete video
// @access  Private (owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

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

    await video.remove();

    res.json({
      status: 'success',
      message: 'Video silindi'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// @route   POST /api/videos/:id/view
// @desc    Increment view count
// @access  Public (with hotlink protection)
router.post('/:id/view', checkHotlink, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Video bulunamadı' 
      });
    }

    await video.incrementViews();

    res.json({
      status: 'success',
      views: video.views
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// @route   GET /api/videos/trending
// @desc    Get trending videos
// @access  Public
router.get('/stats/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 7;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const videos = await Video.find({
      status: 'active',
      isPublic: true,
      createdAt: { $gte: startDate }
    })
    .sort({ views: -1, likes: -1 })
    .limit(limit)
    .populate('owner', 'username avatar');

    res.json({
      status: 'success',
      data: videos
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

module.exports = router;