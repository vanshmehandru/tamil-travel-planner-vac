const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');

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

// @desc    Get all tickets for a user
// @route   GET /api/tickets/my-tickets
// @access  Private
const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
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

module.exports = { getTicketById, getTicketByPNR, getMyTickets, downloadTicket };
