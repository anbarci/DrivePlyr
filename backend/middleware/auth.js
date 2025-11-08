const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Giriş için token gerekli' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    if (!req.user.isActive) return res.status(403).json({ success: false, message: 'Kullanıcı hesabı aktif değil' });
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Geçersiz token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Bu işlemi yapmak için yetkiniz yok' });
    }
    next();
  };
};

module.exports = { protect, authorize };