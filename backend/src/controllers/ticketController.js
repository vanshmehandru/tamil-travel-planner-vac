const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');
const SavedTicket = require('../models/SavedTicket');

// @desc    Get ticket by ticket ID
// @route   GET /api/tickets/:ticketId
// @access  Private
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({
      ticketId: req.params.ticketId,
      userId: req.user.id,
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'டிக்கெட் கிடைக்கவில்லை', // Ticket not found
      });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ticket by PNR number
// @route   GET /api/tickets/pnr/:pnrNumber
// @access  Public (PNR check is public)
const getTicketByPNR = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({ pnrNumber: req.params.pnrNumber });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'PNR எண் தவறானது அல்லது கிடைக்கவில்லை', // Invalid or not found PNR
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ticketId: ticket.ticketId,
        pnrNumber: ticket.pnrNumber,
        isValid: ticket.isValid,
        journeyDetails: ticket.journeyDetails,
        passengerInfo: ticket.passengerInfo.map((p) => ({
          name: p.name,
          seatNumber: p.seatNumber,
          seatClass: p.seatClass,
        })),
        fareDetails: ticket.fareDetails,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tickets for a user (Owned + Saved)
// @route   GET /api/tickets/my-tickets
// @access  Private
const getMyTickets = async (req, res, next) => {
  try {
    // 1. Get owned tickets
    const ownedTickets = await Ticket.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    // 2. Get saved (bookmarked) tickets
    const savedRelations = await SavedTicket.find({ userId: req.user.id })
      .populate('ticketId')
      .sort({ createdAt: -1 });
    
    const savedTickets = savedRelations
      .filter(rel => rel.ticketId) // ensure ticket still exists
      .map(rel => ({
        ...rel.ticketId.toObject(),
        isBookmarked: true
      }));

    // 3. Combine and remove duplicates (if user owns a ticket they also saved)
    const ownedTicketIds = new Set(ownedTickets.map(t => t._id.toString()));
    const additionalSaved = savedTickets.filter(t => !ownedTicketIds.has(t._id.toString()));

    const allTickets = [...ownedTickets.map(t => ({ ...t.toObject(), isBookmarked: false })), ...additionalSaved];

    res.status(200).json({
      success: true,
      count: allTickets.length,
      data: allTickets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download / export ticket as JSON (PDF optional extension)
// @route   GET /api/tickets/:ticketId/download
// @access  Private
const downloadTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({
      ticketId: req.params.ticketId,
      userId: req.user.id,
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'டிக்கெட் கிடைக்கவில்லை' });
    }

    // Increment download count
    ticket.downloadCount += 1;
    await ticket.save();

    // Build a formatted ticket object for the frontend
    const formattedTicket = {
      appName: 'நம்ம யாத்திரை', // Namma Yatra
      ticketId: ticket.ticketId,
      pnrNumber: ticket.pnrNumber,
      isValid: ticket.isValid,
      journey: {
        type: ticket.journeyDetails.travelType,
        vehicle: `${ticket.journeyDetails.transportName} (${ticket.journeyDetails.transportNumber})`,
        class: ticket.journeyDetails.travelClass,
        from: `${ticket.journeyDetails.sourceName} (${ticket.journeyDetails.source})`,
        to: `${ticket.journeyDetails.destinationName} (${ticket.journeyDetails.destination})`,
        date: ticket.journeyDetails.travelDate,
        departure: ticket.journeyDetails.departureTime,
        arrival: ticket.journeyDetails.arrivalTime,
        duration: ticket.journeyDetails.duration,
        platformOrGate: ticket.journeyDetails.platformOrGate,
      },
      passengers: ticket.passengerInfo,
      fare: ticket.fareDetails,
      issuedOn: ticket.createdAt,
    };

    res.status(200).json({
      success: true,
      message: 'டிக்கெட் விவரங்கள்', // Ticket details
      ticket: formattedTicket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save/Bookmark a ticket
// @route   POST /api/tickets/:ticketId/save
// @access  Private
const saveTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId });
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'டிக்கெட் கிடைக்கவில்லை' });
    }

    // Check if already saved
    const existing = await SavedTicket.findOne({ userId: req.user.id, ticketId: ticket._id });
    if (existing) {
      return res.status(200).json({ success: true, message: 'ஏற்கனவே சேமிக்கப்பட்டுள்ளது' });
    }

    await SavedTicket.create({
      userId: req.user.id,
      ticketId: ticket._id,
      customTicketId: ticket.ticketId
    });

    res.status(201).json({ success: true, message: 'டிக்கெட் சேமிக்கப்பட்டது' });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove saved ticket
// @route   DELETE /api/tickets/:ticketId/save
// @access  Private
const unsaveTicket = async (req, res, next) => {
  try {
    // We expect the custom ticketId (NYT-TKT-...)
    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId });
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'டிக்கெட் கிடைக்கவில்லை' });
    }

    await SavedTicket.findOneAndDelete({ userId: req.user.id, ticketId: ticket._id });

    res.status(200).json({ success: true, message: 'சேமிப்பிலிருந்து நீக்கப்பட்டது' });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if ticket is saved
// @route   GET /api/tickets/:ticketId/is-saved
// @access  Private
const checkIsSaved = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId });
    if (!ticket) return res.status(200).json({ isSaved: false });

    const saved = await SavedTicket.findOne({ userId: req.user.id, ticketId: ticket._id });
    const isOwner = ticket.userId.toString() === req.user.id.toString();

    res.status(200).json({ 
      isSaved: !!saved,
      isOwner: isOwner
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getTicketById, 
  getTicketByPNR, 
  getMyTickets, 
  downloadTicket,
  saveTicket,
  unsaveTicket,
  checkIsSaved
};
