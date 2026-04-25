const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// POST /api/bookings
router.post(
  '/',
  protect,
  [
    body('travelOptionId').notEmpty().withMessage('பயண விவரம் தேவை'),
    body('travelClass').notEmpty().withMessage('பயண வகுப்பு தேவை'),
    body('travelDate').isISO8601().withMessage('சரியான தேதி கொடுக்கவும்'),
    body('passengers').isArray({ min: 1 }).withMessage('குறைந்தது ஒரு பயணி தேவை'),
    body('passengers.*.name').notEmpty().withMessage('பயணியின் பெயர் தேவை'),
    body('passengers.*.age').isInt({ min: 1, max: 122 }).withMessage('சரியான வயது கொடுக்கவும்'),
    body('passengers.*.gender').isIn(['male', 'female', 'transgender', 'other']).withMessage('பாலினம் தேவை'),
  ],
  validate,
  createBooking
);

// GET /api/bookings/my-bookings
router.get('/my-bookings', protect, getMyBookings);

// GET /api/bookings/:bookingId
router.get('/:bookingId', protect, getBookingById);

// PUT /api/bookings/:bookingId/cancel
router.put('/:bookingId/cancel', protect, cancelBooking);

module.exports = router;
