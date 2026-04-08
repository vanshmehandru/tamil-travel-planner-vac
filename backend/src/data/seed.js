const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const TravelOption = require('../models/TravelOption');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/namma_yatra';

const travelOptions = [
  // ─────────────────── TRAINS ───────────────────
  {
    type: 'train',
    trainNumber: '12163',
    trainName: 'சென்னை எக்ஸ்பிரஸ்',
    source: 'CBE', sourceName: 'கோவை',
    destination: 'MAS', destinationName: 'சென்னை சென்ட்ரல்',
    departureTime: '22:00', arrivalTime: '05:30',
    duration: '7h 30m', durationMinutes: 450,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'SL', price: 350, totalSeats: 72, availableSeats: 48 },
      { class: '3A', price: 960, totalSeats: 64, availableSeats: 22 },
      { class: '2A', price: 1380, totalSeats: 48, availableSeats: 14 },
      { class: '1A', price: 2320, totalSeats: 24, availableSeats: 8 },
    ],
    stops: [
      { stationName: 'கோவை', stationCode: 'CBE', departureTime: '22:00', day: 1 },
      { stationName: 'ஈரோடு', stationCode: 'ED', arrivalTime: '23:15', departureTime: '23:17', day: 1 },
      { stationName: 'சேலம்', stationCode: 'SA', arrivalTime: '00:30', departureTime: '00:32', day: 2 },
      { stationName: 'சென்னை சென்ட்ரல்', stationCode: 'MAS', arrivalTime: '05:30', day: 2 },
    ],
    foodService: { available: true, vegOption: true, nonVegOption: true },
    luggageAllowance: 25,
  },
  {
    type: 'train',
    trainNumber: '12637',
    trainName: 'பாண்டியன் எக்ஸ்பிரஸ்',
    source: 'MAS', sourceName: 'சென்னை எழும்பூர்',
    destination: 'MDU', destinationName: 'மதுரை',
    departureTime: '21:15', arrivalTime: '06:00',
    duration: '8h 45m', durationMinutes: 525,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'SL', price: 310, totalSeats: 72, availableSeats: 60 },
      { class: '3A', price: 820, totalSeats: 64, availableSeats: 30 },
      { class: '2A', price: 1180, totalSeats: 48, availableSeats: 12 },
    ],
    stops: [
      { stationName: 'சென்னை எழும்பூர்', stationCode: 'MS', departureTime: '21:15', day: 1 },
      { stationName: 'விழுப்புரம்', stationCode: 'VM', arrivalTime: '23:40', departureTime: '23:43', day: 1 },
      { stationName: 'திருச்சி', stationCode: 'TPJ', arrivalTime: '02:30', departureTime: '02:35', day: 2 },
      { stationName: 'மதுரை', stationCode: 'MDU', arrivalTime: '06:00', day: 2 },
    ],
    foodService: { available: true, vegOption: true, nonVegOption: true },
    luggageAllowance: 25,
  },
  {
    type: 'train',
    trainNumber: '12681',
    trainName: 'கோவை சூப்பர்ஃபாஸ்ட்',
    source: 'MAS', sourceName: 'சென்னை சென்ட்ரல்',
    destination: 'CBE', destinationName: 'கோவை',
    departureTime: '15:10', arrivalTime: '21:55',
    duration: '6h 45m', durationMinutes: 405,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'SL', price: 350, totalSeats: 72, availableSeats: 55 },
      { class: '3A', price: 960, totalSeats: 64, availableSeats: 28 },
      { class: '2A', price: 1380, totalSeats: 48, availableSeats: 10 },
    ],
    foodService: { available: true, vegOption: true, nonVegOption: false },
    luggageAllowance: 25,
  },
  {
    type: 'train',
    trainNumber: '16723',
    trainName: 'அனந்தபுரி எக்ஸ்பிரஸ்',
    source: 'MAS', sourceName: 'சென்னை சென்ட்ரல்',
    destination: 'NCJ', destinationName: 'நாகர்கோவில்',
    departureTime: '19:00', arrivalTime: '08:30',
    duration: '13h 30m', durationMinutes: 810,
    days: ['Mon', 'Wed', 'Fri', 'Sun'],
    pricing: [
      { class: 'SL', price: 500, totalSeats: 72, availableSeats: 40 },
      { class: '3A', price: 1300, totalSeats: 64, availableSeats: 16 },
      { class: '2A', price: 1870, totalSeats: 48, availableSeats: 6 },
    ],
    foodService: { available: true, vegOption: true, nonVegOption: true },
    luggageAllowance: 25,
  },

  // ─────────────────── BUSES ───────────────────
  {
    type: 'bus',
    busNumber: 'TN01-AB-1234',
    busOperator: 'TNSTC',
    busType: 'super_express',
    source: 'MAS', sourceName: 'சென்னை',
    destination: 'CBE', destinationName: 'கோவை',
    departureTime: '22:30', arrivalTime: '06:30',
    duration: '8h 0m', durationMinutes: 480,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'General', price: 450, totalSeats: 52, availableSeats: 35 },
      { class: 'AC', price: 850, totalSeats: 40, availableSeats: 20 },
    ],
    foodService: { available: false },
    luggageAllowance: 15,
  },
  {
    type: 'bus',
    busNumber: 'TN04-CD-5678',
    busOperator: 'KPN Travels',
    busType: 'sleeper',
    source: 'CBE', sourceName: 'கோவை',
    destination: 'MDU', destinationName: 'மதுரை',
    departureTime: '21:00', arrivalTime: '04:30',
    duration: '7h 30m', durationMinutes: 450,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'Sleeper', price: 600, totalSeats: 30, availableSeats: 18 },
      { class: 'AC Sleeper', price: 950, totalSeats: 20, availableSeats: 8 },
    ],
    foodService: { available: false },
    luggageAllowance: 15,
  },
  {
    type: 'bus',
    busNumber: 'TN02-EF-9012',
    busOperator: 'Parveen Travels',
    busType: 'ac',
    source: 'MAS', sourceName: 'சென்னை',
    destination: 'MDU', destinationName: 'மதுரை',
    departureTime: '23:00', arrivalTime: '07:00',
    duration: '8h 0m', durationMinutes: 480,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'AC', price: 700, totalSeats: 44, availableSeats: 28 },
      { class: 'AC Sleeper', price: 1100, totalSeats: 18, availableSeats: 6 },
    ],
    foodService: { available: false },
    luggageAllowance: 15,
  },
  {
    type: 'bus',
    busNumber: 'TN07-GH-3456',
    busOperator: 'SETC',
    busType: 'ordinary',
    source: 'TPJ', sourceName: 'திருச்சி',
    destination: 'TEN', destinationName: 'திருநெல்வேலி',
    departureTime: '06:00', arrivalTime: '12:30',
    duration: '6h 30m', durationMinutes: 390,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'General', price: 220, totalSeats: 56, availableSeats: 42 },
    ],
    foodService: { available: false },
    luggageAllowance: 10,
  },

  // ─────────────────── FLIGHTS ───────────────────
  {
    type: 'flight',
    flightNumber: '6E-543',
    airline: 'IndiGo',
    source: 'MAS', sourceName: 'சென்னை',
    destination: 'CBE', destinationName: 'கோவை',
    departureTime: '06:15', arrivalTime: '07:25',
    duration: '1h 10m', durationMinutes: 70,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'Economy', price: 2800, totalSeats: 180, availableSeats: 120 },
      { class: 'Business', price: 7500, totalSeats: 20, availableSeats: 12 },
    ],
    foodService: { available: true, vegOption: true, nonVegOption: true },
    luggageAllowance: 15,
  },
  {
    type: 'flight',
    flightNumber: 'AI-433',
    airline: 'Air India',
    source: 'MAS', sourceName: 'சென்னை',
    destination: 'MDU', destinationName: 'மதுரை',
    departureTime: '09:30', arrivalTime: '10:35',
    duration: '1h 5m', durationMinutes: 65,
    days: ['Mon', 'Wed', 'Fri', 'Sun'],
    pricing: [
      { class: 'Economy', price: 3200, totalSeats: 140, availableSeats: 80 },
      { class: 'Business', price: 9000, totalSeats: 16, availableSeats: 4 },
    ],
    foodService: { available: true, vegOption: true, nonVegOption: true },
    luggageAllowance: 25,
  },
  {
    type: 'flight',
    flightNumber: 'SG-101',
    airline: 'SpiceJet',
    source: 'CBE', sourceName: 'கோவை',
    destination: 'MAS', destinationName: 'சென்னை',
    departureTime: '07:45', arrivalTime: '08:55',
    duration: '1h 10m', durationMinutes: 70,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'Economy', price: 2500, totalSeats: 180, availableSeats: 150 },
    ],
    foodService: { available: true, vegOption: true, nonVegOption: false },
    luggageAllowance: 15,
  },
  {
    type: 'flight',
    flightNumber: '6E-755',
    airline: 'IndiGo',
    source: 'MAS', sourceName: 'சென்னை',
    destination: 'TUT', destinationName: 'தூத்துக்குடி',
    departureTime: '14:00', arrivalTime: '15:20',
    duration: '1h 20m', durationMinutes: 80,
    days: ['Tue', 'Thu', 'Sat'],
    pricing: [
      { class: 'Economy', price: 3600, totalSeats: 180, availableSeats: 95 },
    ],
    foodService: { available: true, vegOption: true, nonVegOption: true },
    luggageAllowance: 15,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await TravelOption.deleteMany({});
    console.log('🗑️  Cleared existing travel options');

    const inserted = await TravelOption.insertMany(travelOptions);
    console.log(`🌱 Seeded ${inserted.length} travel options successfully`);

    console.log('\n📋 Seeded routes:');
    inserted.forEach((opt) => {
      const name = opt.trainName || opt.busOperator || opt.airline;
      console.log(`  [${opt.type.toUpperCase()}] ${name} | ${opt.sourceName} → ${opt.destinationName} | ₹${opt.pricing[0].price}+`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Done! Run: npm run dev');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
