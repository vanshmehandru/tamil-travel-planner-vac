const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true, min: 1, max: 122 },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other'],
  },
  idType: {
    type: String,
    enum: ['aadhaar', 'pan', 'passport', 'voter_id', 'driving_license'],
    default: 'aadhaar',
  },
  idNumber: { 
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        if (this.idType === 'aadhaar') {
          // Aadhaar: 12 digits (after stripping spaces if any)
          return /^\d{12}$/.test(v.replace(/\s/g, ''));
        }
        if (this.idType === 'pan') {
          // PAN: 10 chars (alphanumeric)
          return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v.toUpperCase());
        }
        if (this.idType === 'passport') {
          // Passport: 8 chars (typically 1 letter + 7 digits for Indian passports)
          return /^[A-Z0-9]{8}$/.test(v.toUpperCase());
        }
        return true; // Default for others like voter_id
      },
      message: props => `${props.value} என்பது சரியான அடையாள எண் அல்ல.` // Not a valid ID number
    }
  },
  seatNumber: { type: String },
  seatPreference: {
    type: String,
    enum: ['window', 'aisle', 'middle', 'lower', 'upper', 'side_lower', 'side_upper', 'any'],
    default: 'any',
  },
  isHandicapped: { type: Boolean, default: false },
  isSeniorCitizen: { type: Boolean, default: false },
});

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    travelOptionId: {
      type: String,
      required: true,
    },
    travelType: {
      type: String,
      enum: ['train', 'bus', 'flight'],
      required: true,
    },
    travelClass: { type: String, required: true },
    source: { type: String, required: true, uppercase: true },
    sourceName: { type: String, required: true },
    destination: { type: String, required: true, uppercase: true },
    destinationName: { type: String, required: true },
    travelDate: { type: Date, required: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    duration: { type: String },

    passengers: [passengerSchema],
    totalPassengers: { type: Number, required: true, min: 1 },

    foodPreference: {
      type: String,
      enum: ['veg', 'non-veg', 'no_food'],
      default: 'no_food',
    },

    luggageAllowance: {
      type: Number,
      enum: [7, 15, 25],
      default: 15,
    },
    extraLuggageCharge: { type: Number, default: 0 },

    // Pricing
    baseFare: { type: Number, required: true },
    taxes: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'cash', 'wallet'],
    },
    paymentTransactionId: { type: String },

    bookingStatus: {
      type: String,
      enum: ['confirmed', 'waitlisted', 'cancelled', 'completed'],
      default: 'confirmed',
    },
    cancellationReason: { type: String },
    cancelledAt: { type: Date },

    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
    },
  },
  { timestamps: true }
);

// Auto-generate bookingId
bookingSchema.pre('save', function (next) {
  if (!this.bookingId) {
    const prefix = { train: 'TRN', bus: 'BUS', flight: 'FLT' }[this.travelType] || 'NYT';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.bookingId = `${prefix}${timestamp}${random}`;
  }
  next();
});

bookingSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
