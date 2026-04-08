const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// POST /api/auth/register
router.post(
  '/register',
  [
    body('username').trim().notEmpty().withMessage('பயனர்பெயர் தேவை'),
    body('email').isEmail().normalizeEmail().withMessage('சரியான மின்னஞ்சல்'),
    body('password').isLength({ min: 6 }).withMessage('கடவுச்சொல் குறைந்தது 6 எழுத்துகள்'),
  ],
  validate,
  register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('சரியான மின்னஞ்சல்'),
    body('password').notEmpty().withMessage('கடவுச்சொல் தேவை'),
  ],
  validate,
  login
);

// GET /api/auth/me
router.get('/me', protect, getMe);

// PUT /api/auth/profile
router.put('/profile', protect, updateProfile);

// PUT /api/auth/change-password
router.put(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('தற்போதைய கடவுச்சொல் தேவை'),
    body('newPassword').isLength({ min: 6 }).withMessage('புதிய கடவுச்சொல் குறைந்தது 6 எழுத்துகள்'),
  ],
  validate,
  changePassword
);

module.exports = router;
