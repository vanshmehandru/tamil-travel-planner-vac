const mongoose = require('mongoose');

const savedTicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    // The human-readable ticketId (e.g. NYT-TKT-...)
    customTicketId: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

// Prevent duplicate saves
savedTicketSchema.index({ userId: 1, ticketId: 1 }, { unique: true });

module.exports = mongoose.model('SavedTicket', savedTicketSchema);
