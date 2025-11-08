const express = require('express');
const Playlist = require('../models/Playlist');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const playlists = await Playlist.find({ owner: req.user._id })
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .populate('videos.video');

    const total = await Playlist.countDocuments({ owner: req.user._id });

    res.json({
      success: true,
      playlists,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('videos.video')
      .populate('owner', 'username avatar');

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist bulunamadı' });
    }

    res.json({ success: true, playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { name, description, category, poster } = req.body;

    const playlist = await Playlist.create({
      name,
      description,
      category,
      poster,
      owner: req.user._id
    });

    res.status(201).json({ success: true, playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:id/videos', protect, async (req, res) => {
  try {
    const { videoId, order } = req.body;
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist bulunamadı' });
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Yetkisiz işem' });
    }

    await playlist.addVideo(videoId, order);
    res.json({ success: true, playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id/videos/:videoId', protect, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Yetkisiz işem' });
    }

    await playlist.removeVideo(req.params.videoId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;