const Booking = require('../models/Booking');
const TravelOption = require('../models/TravelOption');
const Ticket = require('../models/Ticket');
const ticketService = require('../services/ticketService');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const {
      travelOptionId,
      travelClass,
      travelDate,
      passengers,
      foodPreference,
      luggageAllowance,
      paymentMethod,
    } = req.body;

    // 1. Validate travel option exists
    let travelOption;
    const isExternal = travelOptionId && travelOptionId.startsWith('ext-');

    if (isExternal) {
      // For external IDs, we normally fetch from API or use a snapshot.
      // For this demo, we'll construct a valid enough object to satisfy the booking logic.
      travelOption = {
        _id: travelOptionId,
        type: travelOptionId.includes('flight') ? 'flight' : 'train',
        source: req.body.source || 'MAS',
        sourceName: req.body.sourceName || 'Chennai',
        destination: req.body.destination || 'DEL',
        destinationName: req.body.destinationName || 'Delhi',
        departureTime: req.body.departureTime || '10:00',
        arrivalTime: req.body.arrivalTime || '22:00',
        duration: req.body.duration || '12h 0m',
        luggageAllowance: 15,
        pricing: [
          { class: travelClass, price: 4500, availableSeats: 99 }
        ]
      };
    } else {
      travelOption = await TravelOption.findById(travelOptionId);
      if (!travelOption) {
        return res.status(404).json({
          success: false,
          message: 'பயண விவரம் கிடைக்கவில்லை', // Travel option not found
        });
      }
    }

    // 2. Find the requested class pricing
    const selectedClass = travelOption.pricing.find(
      (p) => p.class.toLowerCase() === travelClass.toLowerCase()
    );
    if (!selectedClass) {
      return res.status(400).json({
        success: false,
        message: 'தேர்ந்தெடுத்த வகுப்பு / இருக்கை வகை கிடைக்கவில்லை', // Selected class not found
      });
    }

    // 3. Check seat availability
    const passengerCount = passengers.length;
    if (selectedClass.availableSeats < passengerCount) {
      return res.status(400).json({
        success: false,
        message: `போதுமான இருக்கைகள் இல்லை. கிடைக்கும் இருக்கைகள்: ${selectedClass.availableSeats}`,
        // Not enough seats available
      });
    }

    // 4. Assign seat numbers to passengers
    const assignedPassengers = passengers.map((p, index) => ({
      ...p,
      seatNumber: p.seatNumber || generateSeatNumber(travelOption.type, travelClass, index),
    }));

    // 5. Calculate fare
    const baseFare = selectedClass.price * passengerCount;
    const taxes = Math.round(baseFare * 0.05); // 5% tax
    const serviceCharge = 30 * passengerCount;
    const luggageCharge = calculateLuggageCharge(luggageAllowance, travelOption.luggageAllowance);
    const totalAmount = baseFare + taxes + serviceCharge + luggageCharge;

    // 6. Create booking
    const booking = await Booking.create({
      userId: req.user.id,
      travelOptionId,
      travelType: travelOption.type,
      travelClass,
      source: travelOption.source,
      sourceName: travelOption.sourceName,
      destination: travelOption.destination,
      destinationName: travelOption.destinationName,
      travelDate: new Date(travelDate),
      departureTime: travelOption.departureTime,
      arrivalTime: travelOption.arrivalTime,
      duration: travelOption.duration,
      passengers: assignedPassengers,
      totalPassengers: passengerCount,
      foodPreference: foodPreference || 'no_food',
      luggageAllowance: luggageAllowance || 15,
      extraLuggageCharge: luggageCharge,
      baseFare,
      taxes,
      serviceCharge,
      totalAmount,
      paymentStatus: 'paid', // mock: assume payment success
      paymentMethod: paymentMethod || 'upi',
      bookingStatus: 'confirmed',
    });

    // 7. Decrement available seats (skip for external)
    if (!isExternal) {
      await TravelOption.updateOne(
        { _id: travelOptionId, 'pricing.class': travelClass },
        { $inc: { 'pricing.$.availableSeats': -passengerCount } }
      );
    }

    // 8. Generate ticket
    const ticket = await ticketService.generateTicket(booking, travelOption);
    booking.ticketId = ticket._id;
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'பயண பதிவு வெற்றிகரமாக முடிந்தது!', // Booking confirmed successfully!
      booking: {
        bookingId: booking.bookingId,
        status: booking.bookingStatus,
        route: `${booking.sourceName} → ${booking.destinationName}`,
        travelDate: booking.travelDate,
        totalAmount: booking.totalAmount,
        totalPassengers: booking.totalPassengers,
        ticketId: ticket.ticketId,
        pnrNumber: ticket.pnrNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings for a user (order history)
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const query = { userId: req.user.id };

    if (status) query.bookingStatus = status;
    if (type) query.travelType = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('ticketId', 'ticketId pnrNumber isValid');

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by booking ID
// @route   GET /api/bookings/:bookingId
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      bookingId: req.params.bookingId,
      userId: req.user.id,
    }).populate('ticketId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'பயண பதிவு கிடைக்கவில்லை', // Booking not found
      });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:bookingId/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findOne({
      bookingId: req.params.bookingId,
      userId: req.user.id,
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'பயண பதிவு கிடைக்கவில்லை' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'இந்த பயண பதிவு ஏற்கனவே ரத்து செய்யப்பட்டுள்ளது', // Already cancelled
      });
    }

    if (booking.bookingStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'முடிந்த பயணத்தை ரத்து செய்ய முடியாது', // Cannot cancel completed journey
      });
    }

    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = reason || 'பயனர் கோரிக்கை'; // User request
    booking.cancelledAt = new Date();
    booking.paymentStatus = 'refunded';
    await booking.save();

    // Restore seats (skip for external)
    if (booking.travelOptionId && !booking.travelOptionId.startsWith('ext-')) {
      await TravelOption.updateOne(
        { _id: booking.travelOptionId, 'pricing.class': booking.travelClass },
        { $inc: { 'pricing.$.availableSeats': booking.totalPassengers } }
      );
    }

    // Invalidate ticket
    if (booking.ticketId) {
      await Ticket.findByIdAndUpdate(booking.ticketId, { isValid: false });
    }

    res.status(200).json({
      success: true,
      message: 'பயண பதிவு ரத்து செய்யப்பட்டது. பணம் திரும்பப் பெறப்படும்.', // Booking cancelled. Refund will be processed.
      bookingId: booking.bookingId,
      refundAmount: booking.totalAmount,
    });
  } catch (error) {
    next(error);
  }
};

// --- Helpers ---
const generateSeatNumber = (type, travelClass, index) => {
  if (type === 'flight') {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const row = Math.floor(index / 6) + 10;
    return `${row}${rows[index % 6]}`;
  }
  if (type === 'train') {
    const coachMap = { SL: 'S', '3A': 'B', '2A': 'A', '1A': 'H' };
    const coach = coachMap[travelClass] || 'G';
    const seatNum = (index + 1).toString().padStart(2, '0');
    return `${coach}1-${seatNum}`;
  }
  // Bus
  return `${index + 1}`;
};

const calculateLuggageCharge = (requested, included) => {
  if (!requested || requested <= included) return 0;
  const extra = requested - included;
  return extra * 50; // ₹50 per kg extra
};

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking };
