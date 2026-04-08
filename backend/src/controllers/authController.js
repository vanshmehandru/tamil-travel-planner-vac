const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      username: user.username,
    },
    process.env.JWT_SECRET,
    {
    expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const normalizedEmail = email?.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { username },
        { email: normalizedEmail },
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'இந்த பயனர்பெயர் / மின்னஞ்சல் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது', // Already registered
      });
    }

    const user = await User.create({ username, email: normalizedEmail, password });
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'பதிவு வெற்றிகரமாக முடிந்தது! நம்ம யாத்ரிக்கு வரவேற்கிறோம்!', // Registration successful! Welcome to Namma Yatri!
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'மின்னஞ்சல் மற்றும் கடவுச்சொல் தேவை', // Email and password required
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'மின்னஞ்சல் அல்லது கடவுச்சொல் தவறானது', // Wrong email or password
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'மின்னஞ்சல் அல்லது கடவுச்சொல் தவறானது',
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: `வணக்கம் ${user.username}! வெற்றிகரமாக உள்நுழைந்தீர்கள்`, // Welcome! Successfully logged in
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['username', 'email'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = field === 'email' ? req.body[field].toLowerCase().trim() : req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'சுயவிவரம் புதுப்பிக்கப்பட்டது', // Profile updated
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'தற்போதைய கடவுச்சொல் தவறானது', // Current password is wrong
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'கடவுச்சொல் மாற்றப்பட்டது', // Password changed
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
