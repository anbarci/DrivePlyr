const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Playlist = require('../models/Playlist');
const { protect } = require('../middleware/auth');

// @route   GET /api/playlists
// @desc    Get all playlists
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { status: 'active', isPublic: true };
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.owner) {
      query.owner = req.query.owner;
    }

    const playlists = await Playlist.find(query)
      .populate('owner', 'username avatar')
      .populate('videos.video', 'title poster duration')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Playlist.countDocuments(query);

    res.json({
      status: 'success',
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: playlists
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// @route   GET /api/playlists/:id
// @desc    Get single playlist
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('owner', 'username avatar')
      .populate('videos.video', 'title poster duration driveId views');

    if (!playlist) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Playlist bulunamadı' 
      });
    }

    // Increment views
    playlist.views += 1;
    await playlist.save();

    res.json({
      status: 'success',
      data: playlist
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// @route   POST /api/playlists
// @desc    Create playlist
// @access  Private
router.post('/', protect, [
  body('name').trim().notEmpty().withMessage('Playlist adı gerekli')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }

    const playlist = await Playlist.create({
      ...req.body,
      owner: req.user.id
    });

    res.status(201).json({
      status: 'success',
      data: playlist
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// @route   PUT /api/playlists/:id
// @desc    Update playlist
// @access  Private (owner or collaborator)
router.put('/:id', protect, async (req, res) => {
  try {
    let playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Playlist bulunamadı' 
      });
    }

    // Check ownership
    if (playlist.owner.toString() !== req.user.id) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Bu işlemi yapmaya yetkiniz yok' 
      });
    }

    playlist = await Playlist.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      status: 'success',
      data: playlist
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// @route   DELETE /api/playlists/:id
// @desc    Delete playlist
// @access  Private (owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Playlist bulunamadı' 
      });
    }

    if (playlist.owner.toString() !== req.user.id) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Bu işlemi yapmaya yetkiniz yok' 
      });
    }

    await playlist.remove();

    res.json({
      status: 'success',
      message: 'Playlist silindi'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// @route   POST /api/playlists/:id/videos
// @desc    Add video to playlist
// @access  Private
router.post('/:id/videos', protect, [
  body('videoId').notEmpty().withMessage('Video ID gerekli')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }

    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Playlist bulunamadı' 
      });
    }

    if (playlist.owner.toString() !== req.user.id) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Bu işlemi yapmaya yetkiniz yok' 
      });
    }

    await playlist.addVideo(req.body.videoId, req.body.order);

    res.json({
      status: 'success',
      message: 'Video playlist\'e eklendi',
      data: playlist
    });
  } catch (error) {
    res.status(400).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// @route   DELETE /api/playlists/:id/videos/:videoId
// @desc    Remove video from playlist
// @access  Private
router.delete('/:id/videos/:videoId', protect, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Playlist bulunamadı' 
      });
    }

    if (playlist.owner.toString() !== req.user.id) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Bu işlemi yapmaya yetkiniz yok' 
      });
    }

    await playlist.removeVideo(req.params.videoId);

    res.json({
      status: 'success',
      message: 'Video playlist\'ten çıkarıldı',
      data: playlist
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

module.exports = router;