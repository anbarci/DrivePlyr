const express = require('express');
const Subtitle = require('../models/Subtitle');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/video/:videoId', async (req, res) => {
  try {
    const subtitles = await Subtitle.find({
      video: req.params.videoId,
      isApproved: true
    }).select('language languageCode label format -content');

    res.json({ success: true, subtitles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const subtitle = await Subtitle.findById(req.params.id);
    if (!subtitle) return res.status(404).json({ success: false, message: 'Altyazı bulunamadı' });

    subtitle.downloadCount += 1;
    await subtitle.save();
    res.json({ success: true, subtitle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { video, language, languageCode, label, content, format } = req.body;

    const subtitle = await Subtitle.create({
      video,
      language,
      languageCode,
      label,
      content,
      format,
      uploadedBy: req.user._id
    });

    res.status(201).json({ success: true, subtitle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id/download', async (req, res) => {
  try {
    const subtitle = await Subtitle.findById(req.params.id);
    if (!subtitle) return res.status(404).json({ success: false, message: 'Altyazı bulunamadı' });

    const format = req.query.format || subtitle.format;
    let content = subtitle.content;

    if (format === 'vtt' && subtitle.format === 'srt') {
      content = subtitle.convertToVTT();
    } else if (format === 'srt' && subtitle.format === 'vtt') {
      content = subtitle.convertToSRT();
    }

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${subtitle.label}.${format}"`);
    res.send(content);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const subtitle = await Subtitle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, subtitle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;