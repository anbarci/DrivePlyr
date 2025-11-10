const mongoose = require('mongoose');

const SubtitleSchema = new mongoose.Schema({
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  language: {
    type: String,
    required: [true, 'Dil gerekli'],
    trim: true
  },
  languageCode: {
    type: String,
    required: [true, 'Dil kodu gerekli'],
    trim: true,
    lowercase: true,
    match: [/^[a-z]{2}(-[A-Z]{2})?$/, 'Geçerli dil kodu girin (e.g., tr, en, tr-TR)']
  },
  label: {
    type: String,
    required: [true, 'Etiket gerekli']
  },
  content: {
    type: String,
    required: [true, 'Altyazı içeriği gerekli']
  },
  format: {
    type: String,
    enum: ['srt', 'vtt', 'ass', 'ssa'],
    default: 'srt'
  },
  url: {
    type: String
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'rejected', 'deleted'],
    default: 'active'
  },
  metadata: {
    fileSize: Number,
    encoding: String,
    lineCount: Number
  }
}, {
  timestamps: true
});

// Indexes
SubtitleSchema.index({ video: 1, languageCode: 1 });
SubtitleSchema.index({ uploadedBy: 1 });

// Convert SRT to VTT
SubtitleSchema.methods.convertSrtToVtt = function() {
  if (this.format !== 'srt') {
    throw new Error('Sadece SRT formatı dönüştürülebilir');
  }
  
  let vtt = 'WEBVTT\n\n';
  const lines = this.content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip subtitle number
    if (/^\d+$/.test(line)) {
      continue;
    }
    
    // Convert timestamp format
    if (line.includes('-->')) {
      vtt += line.replace(/,/g, '.') + '\n';
    } else if (line) {
      vtt += line + '\n';
    } else {
      vtt += '\n';
    }
  }
  
  return vtt;
};

// Parse SRT and count lines
SubtitleSchema.methods.parseMetadata = function() {
  const lines = this.content.split('\n').filter(line => line.trim());
  const subtitleBlocks = this.content.split(/\n\s*\n/);
  
  this.metadata = {
    fileSize: Buffer.byteLength(this.content, 'utf8'),
    encoding: 'UTF-8',
    lineCount: subtitleBlocks.filter(block => block.trim()).length
  };
};

module.exports = mongoose.model('Subtitle', SubtitleSchema);