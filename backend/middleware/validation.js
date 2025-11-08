const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({ field: err.param, message: err.msg }))
    });
  }
  next();
};

const videoValidationRules = () => [
  body('title').notEmpty().withMessage('Başlık gerekli').isLength({ min: 3, max: 200 }).withMessage('Başlık 3-200 karakter arası olmalı'),
  body('driveUrl').notEmpty().withMessage('Google Drive URL gerekli').isURL().withMessage('Geçerli bir URL girin'),
  body('driveId').notEmpty().withMessage('Drive ID gerekli')
];

const registerValidationRules = () => [
  body('username').notEmpty().withMessage('Kullanıcı adı gerekli').isLength({ min: 3, max: 30 }).withMessage('Kullanıcı adı 3-30 karakter arası olmalı'),
  body('email').notEmpty().withMessage('Email gerekli').isEmail().withMessage('Geçerli bir email girin'),
  body('password').notEmpty().withMessage('Şifre gerekli').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı')
];

const loginValidationRules = () => [
  body('email').notEmpty().withMessage('Email gerekli').isEmail().withMessage('Geçerli bir email girin'),
  body('password').notEmpty().withMessage('Şifre gerekli')
];

module.exports = {
  validate,
  videoValidationRules,
  registerValidationRules,
  loginValidationRules
};