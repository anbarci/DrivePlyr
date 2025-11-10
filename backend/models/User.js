const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Kullanıcı adı gerekli'],
    unique: true,
    trim: true,
    minlength: [3, 'Kullanıcı adı en az 3 karakter olmalı'],
    maxlength: [30, 'Kullanıcı adı en fazla 30 karakter olabilir']
  },
  email: {
    type: String,
    required: [true, 'Email gerekli'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Geçerli bir email adresi girin']
  },
  password: {
    type: String,
    required: [true, 'Şifre gerekli'],
    minlength: [6, 'Şifre en az 6 karakter olmalı'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  permissions: [{
    type: String,
    enum: [
      'videos.create',
      'videos.edit',
      'videos.delete',
      'playlists.create',
      'playlists.edit',
      'playlists.delete',
      'users.manage',
      'analytics.view',
      'settings.manage'
    ]
  }],
  lastLogin: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
UserSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Set permissions based on role
UserSchema.methods.setRolePermissions = function() {
  const rolePermissions = {
    admin: [
      'videos.create', 'videos.edit', 'videos.delete',
      'playlists.create', 'playlists.edit', 'playlists.delete',
      'users.manage', 'analytics.view', 'settings.manage'
    ],
    moderator: [
      'videos.create', 'videos.edit',
      'playlists.create', 'playlists.edit',
      'analytics.view'
    ],
    user: ['videos.create', 'playlists.create']
  };
  
  this.permissions = rolePermissions[this.role] || rolePermissions.user;
};

module.exports = mongoose.model('User', UserSchema);