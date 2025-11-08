const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Subtitle = require('../models/Subtitle');
const { protect } = require('../middleware/auth');

// @route   GET /api/subtitles/video/:videoId
// @desc    Get all subtitles for a video
// @access  Public
router.get('/video/:videoId', async (req, res) => {
  try {
    const subtitles = await Subtitle.find({
      video: req.params.videoId,
      status: 'active'
    })
    .populate('uploadedBy', 'username')
    .sort({ languageCode: 1 });

    res.json({
      status: 'success',
      data: subtitles
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// @route   GET /api/subtitles/:id
// @desc    Get single subtitle
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const subtitle = await Subtitle.findById(req.params.id);

    if (!subtitle) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Altyazı bulunamadı' 
      });
    }

    res.json({
      status: 'success',
      data: subtitle
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// @route   GET /api/subtitles/:id/download
// @desc    Download subtitle file
// @access  Public
router.get('/:id/download', async (req, res) => {
  try {
    const subtitle = await Subtitle.findById(req.params.id);

    if (!subtitle) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Altyazı bulunamadı' 
      });
    }

    const format = req.query.format || subtitle.format;
    let content = subtitle.content;

    // Convert to VTT if requested
    if (format === 'vtt' && subtitle.format === 'srt') {
      content = subtitle.convertSrtToVtt();
    }

    res.setHeader('Content-Type', `text/${format}`);
    res.setHeader('Content-Disposition', `attachment; filename="${subtitle.label}.${format}"`);
    res.send(content);
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// @route   POST /api/subtitles
// @desc    Upload subtitle
// @access  Private
router.post('/', protect, [
  body('video').notEmpty().withMessage('Video ID gerekli'),
  body('language').notEmpty().withMessage('Dil gerekli'),
  body('languageCode').matches(/^[a-z]{2}(-[A-Z]{2})?$/).withMessage('Geçerli dil kodu girin'),
  body('label').notEmpty().withMessage('Etiket gerekli'),
  body('content').notEmpty().withMessage('İçerik gerekli')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }

    const subtitle = await Subtitle.create({
      ...req.body,
      uploadedBy: req.user.id
    });

    // Parse metadata
    subtitle.parseMetadata();
    await subtitle.save();

    res.status(201).json({
      status: 'success',
      data: subtitle
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// @route   PUT /api/subtitles/:id
// @desc    Update subtitle
// @access  Private (owner or admin)
router.put('/:id', protect, async (req, res) => {
  try {
    let subtitle = await Subtitle.findById(req.params.id);

    if (!subtitle) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Altyazı bulunamadı' 
      });
    }

    // Check ownership or admin
    if (subtitle.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Bu işlemi yapmaya yetkiniz yok' 
      });
    }

    subtitle = await Subtitle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Update metadata if content changed
    if (req.body.content) {
      subtitle.parseMetadata();
      await subtitle.save();
    }

    res.json({
      status: 'success',
      data: subtitle
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// @route   DELETE /api/subtitles/:id
// @desc    Delete subtitle
// @access  Private (owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const subtitle = await Subtitle.findById(req.params.id);

    if (!subtitle) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Altyazı bulunamadı' 
      });
    }

    // Check ownership or admin
    if (subtitle.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Bu işlemi yapmaya yetkiniz yok' 
      });
    }

    await subtitle.remove();

    res.json({
      status: 'success',
      message: 'Altyazı silindi'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

module.exports = router;