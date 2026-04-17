const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const TravelOption = require('../models/TravelOption');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/namma_yatra';

const travelOptions = [
  // ===========================================================================
  // CHENNAI (MAS/MS) ⇄ COIMBATORE (CBE)
  // ===========================================================================
  
  // --- Trains (Chennai → Coimbatore) ---
  {
    type: 'train',
    trainNumber: '12675',
    trainName: 'கோவை எக்ஸ்பிரஸ் (Kovai Exp)',
    source: 'MAS', sourceName: 'சென்னை',
    destination: 'CBE', destinationName: 'கோவை',
    departureTime: '06:10', arrivalTime: '14:05',
    duration: '7h 55m', durationMinutes: 475,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'CC', price: 615, totalSeats: 72, availableSeats: 30 },
      { class: '2S', price: 185, totalSeats: 108, availableSeats: 55 },
    ],
    foodService: { available: true, vegOption: true },
    luggageAllowance: 25,
  },
  {
    type: 'train',
    trainNumber: '12243',
    trainName: 'சதாப்தி எக்ஸ்பிரஸ் (Shatabdi)',
    source: 'MAS', sourceName: 'சென்னை',
    destination: 'CBE', destinationName: 'கோவை',
    departureTime: '07:15', arrivalTime: '13:50',
    duration: '6h 35m', durationMinutes: 395,
    days: ['Mon', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'CC', price: 1120, totalSeats: 72, availableSeats: 25 },
      { class: 'EC', price: 2150, totalSeats: 48, availableSeats: 12 },
    ],
    foodService: { available: true, vegOption: true, nonVegOption: true },
    luggageAllowance: 40,
  },
  {
    type: 'train',
    trainNumber: '12673',
    trainName: 'சேரன் சூப்பர்ஃபாஸ்ட் (Cheran SF)',
    source: 'MAS', sourceName: 'சென்னை',
    destination: 'CBE', destinationName: 'கோவை',
    departureTime: '22:10', arrivalTime: '06:00',
    duration: '7h 50m', durationMinutes: 470,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'SL', price: 350, totalSeats: 72, availableSeats: 48 },
      { class: '3A', price: 960, totalSeats: 64, availableSeats: 22 },
    ],
    foodService: { available: false },
    luggageAllowance: 25,
  },
  {
    type: 'train',
    trainNumber: '12681',
    trainName: 'சென்னை - கோவை வாரம் ஒருமுறை',
    source: 'MAS', sourceName: 'சென்னை',
    destination: 'CBE', destinationName: 'கோவை',
    departureTime: '22:30', arrivalTime: '06:45',
    duration: '8h 15m', durationMinutes: 495,
    days: ['Sat'],
    pricing: [
      { class: 'SL', price: 380, totalSeats: 72, availableSeats: 10 },
      { class: '3A', price: 1050, totalSeats: 64, availableSeats: 5 },
    ],
    foodService: { available: false },
    luggageAllowance: 25,
  },
  
  // --- Trains (Coimbatore → Chennai) ---
  {
    type: 'train',
    trainNumber: '12676',
    trainName: 'கோவை எக்ஸ்பிரஸ் (Kovai Exp)',
    source: 'CBE', sourceName: 'கோவை',
    destination: 'MAS', destinationName: 'சென்னை',
    departureTime: '15:15', arrivalTime: '23:05',
    duration: '7h 50m', durationMinutes: 470,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'CC', price: 615, totalSeats: 72, availableSeats: 40 },
    ],
    foodService: { available: true, vegOption: true },
    luggageAllowance: 25,
  },

  // --- Buses (Chennai ⇄ Coimbatore) ---
  {
    type: 'bus',
    busNumber: 'TN01-AV-1122',
    busName: 'எஸ்.ஆர்.எம் டிராவல்ஸ் (SRM Travels)',
    source: 'MAS', sourceName: 'சென்னை',
    destination: 'CBE', destinationName: 'கோவை',
    departureTime: '21:30', arrivalTime: '06:15',
    duration: '8h 45m', durationMinutes: 525,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'AC Sleeper', price: 1150, totalSeats: 30, availableSeats: 12 },
    ],
    foodService: { available: false },
    luggageAllowance: 20,
  },

  // ===========================================================================
  // CHENNAI (MAS) ⇄ DELHI (DEL)
  // ===========================================================================
  {
    type: 'bus',
    busNumber: 'KA01-DX-9988',
    busName: 'நேஷனல் டிராவல்ஸ் (National Travels)',
    source: 'MAS', sourceName: 'சென்னை',
    destination: 'DEL', destinationName: 'டெல்லி',
    departureTime: '10:00', arrivalTime: '22:00', // Multi-day journey mock
    duration: '36h 0m', durationMinutes: 2160,
    days: ['Wed', 'Sat'],
    pricing: [
      { class: 'Luxury Multi-Axle', price: 3500, totalSeats: 40, availableSeats: 15 },
    ],
    foodService: { available: true, vegOption: true },
    luggageAllowance: 30,
  },
  {
    type: 'bus',
    busNumber: 'DL01-EX-1122',
    busName: 'கே.பி.என் எக்ஸ்பிரஸ் (KPN Express)',
    source: 'DEL', sourceName: 'டெல்லி',
    destination: 'MAS', destinationName: 'சென்னை',
    departureTime: '14:00', arrivalTime: '02:00', 
    duration: '36h 0m', durationMinutes: 2160,
    days: ['Mon', 'Thu'],
    pricing: [
      { class: 'Luxury Multi-Axle', price: 3450, totalSeats: 40, availableSeats: 10 },
    ],
    foodService: { available: true, vegOption: true },
    luggageAllowance: 30,
  },

  // ===========================================================================
  // COIMBATORE (CBE) ⇄ DELHI (DEL/NDLS)
  // ===========================================================================
  {
    type: 'train',
    trainNumber: '12643',
    trainName: 'நிஜாமுதீன் எக்ஸ்பிரஸ் (Nizamuddin Exp)',
    source: 'CBE', sourceName: 'கோவை',
    destination: 'NDLS', destinationName: 'புது டெல்லி',
    departureTime: '23:05', arrivalTime: '18:45',
    duration: '43h 40m', durationMinutes: 2620,
    days: ['Tue'],
    pricing: [
      { class: 'SL', price: 950, totalSeats: 72, availableSeats: 15 },
      { class: '3A', price: 2500, totalSeats: 64, availableSeats: 8 },
    ],
    foodService: { available: true, vegOption: true },
    luggageAllowance: 40,
  },

  {
    type: 'bus',
    busNumber: 'TN38-CX-1234',
    busName: 'எஸ்.ஆர்.எஸ் டிராவல்ஸ் (SRS Travels)',
    source: 'CBE', sourceName: 'கோவை',
    destination: 'DEL', destinationName: 'டெல்லி',
    departureTime: '06:00', arrivalTime: '21:00', 
    duration: '39h 0m', durationMinutes: 2340,
    days: ['Fri'],
    pricing: [
      { class: 'AC Sleeper', price: 3800, totalSeats: 30, availableSeats: 5 },
    ],
    foodService: { available: true, vegOption: true },
    luggageAllowance: 30,
  },
  {
    type: 'bus',
    busOperator: 'TNSTC (அரசு பஸ்)',
    busType: 'super_express',
    source: 'MAS', sourceName: 'சென்னை',
    destination: 'CBE', destinationName: 'கோவை',
    departureTime: '21:00', arrivalTime: '05:00',
    duration: '8h 0m', durationMinutes: 480,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [ { class: 'General', price: 420, totalSeats: 52, availableSeats: 25 } ],
    foodService: { available: false },
    luggageAllowance: 15,
  },
  {
    type: 'bus',
    busNumber: 'KA01-PR-5566',
    busOperator: 'Parveen Travels',
    busType: 'sleeper',
    source: 'MAS', sourceName: 'சென்னை',
    destination: 'CBE', destinationName: 'கோவை',
    departureTime: '22:30', arrivalTime: '06:15',
    duration: '7h 45m', durationMinutes: 465,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [ { class: 'AC Sleeper', price: 1250, totalSeats: 30, availableSeats: 12 } ],
    foodService: { available: false },
    luggageAllowance: 20,
  },
  {
    type: 'bus',
    busNumber: 'TN38-KP-7788',
    busOperator: 'KPN Travels (குளிர்சாதனம்)',
    busType: 'ac',
    source: 'CBE', sourceName: 'கோவை',
    destination: 'MAS', destinationName: 'சென்னை',
    departureTime: '20:45', arrivalTime: '04:30',
    duration: '7h 45m', durationMinutes: 465,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [ { class: 'AC Seater', price: 950, totalSeats: 44, availableSeats: 18 } ],
    foodService: { available: false },
    luggageAllowance: 15,
  },
  {
    type: 'bus',
    busNumber: 'TN01-SX-5544',
    busOperator: 'SRM Travels (Non-AC)',
    busType: 'express',
    source: 'MAS', sourceName: 'சென்னை',
    destination: 'CBE', destinationName: 'கோவை',
    departureTime: '23:15', arrivalTime: '07:45',
    duration: '8h 30m', durationMinutes: 510,
    days: ['Fri', 'Sat', 'Sun'],
    pricing: [ { class: 'General', price: 480, totalSeats: 44, availableSeats: 35 } ],
    foodService: { available: false },
    luggageAllowance: 15,
  },

  // --- Flights (Chennai ⇄ Coimbatore) ---
  {
    type: 'flight',
    flightNumber: '6E-201',
    airline: 'IndiGo',
    source: 'MAS', sourceName: 'சென்னை',
    destination: 'CBE', destinationName: 'கோவை',
    departureTime: '05:45', arrivalTime: '06:55',
    duration: '1h 10m', durationMinutes: 70,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'Economy', price: 3200, totalSeats: 180, availableSeats: 45 },
    ],
    foodService: { available: true },
    luggageAllowance: 15,
  },
  {
    type: 'flight',
    flightNumber: 'AI-512',
    airline: 'Air India',
    source: 'MAS', sourceName: 'சென்னை',
    destination: 'CBE', destinationName: 'கோவை',
    departureTime: '13:20', arrivalTime: '14:35',
    duration: '1h 15m', durationMinutes: 75,
    days: ['Mon', 'Wed', 'Fri', 'Sun'],
    pricing: [
      { class: 'Economy', price: 4500, totalSeats: 140, availableSeats: 20 },
    ],
    foodService: { available: true, vegOption: true, nonVegOption: true },
    luggageAllowance: 25,
  },
  {
    type: 'flight',
    flightNumber: '6E-455',
    airline: 'IndiGo',
    source: 'CBE', sourceName: 'கோவை',
    destination: 'MAS', destinationName: 'சென்னை',
    departureTime: '19:10', arrivalTime: '20:20',
    duration: '1h 10m', durationMinutes: 70,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'Economy', price: 2900, totalSeats: 180, availableSeats: 65 },
    ],
    foodService: { available: true },
    luggageAllowance: 15,
  },
  {
    type: 'flight',
    flightNumber: 'SG-901',
    airline: 'SpiceJet (மாலை நேரம்)',
    source: 'MAS', sourceName: 'சென்னை',
    destination: 'CBE', destinationName: 'கோவை',
    departureTime: '17:30', arrivalTime: '18:45',
    duration: '1h 15m', durationMinutes: 75,
    days: ['Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'Economy', price: 3800, totalSeats: 180, availableSeats: 20 },
    ],
    foodService: { available: true },
    luggageAllowance: 15,
  },

  // ===========================================================================
  // CHENNAI (MAS/MS) ⇄ MADURAI (MDU)
  // ===========================================================================
  
  // --- Trains (Chennai → Madurai) ---
  {
    type: 'train',
    trainNumber: '12637',
    trainName: 'பாண்டியன் எக்ஸ்பிரஸ் (Pandiyan)',
    source: 'MS', sourceName: 'சென்னை',
    destination: 'MDU', destinationName: 'மதுரை',
    departureTime: '21:40', arrivalTime: '05:20',
    duration: '7h 40m', durationMinutes: 460,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'SL', price: 310, totalSeats: 72, availableSeats: 15 },
      { class: '3A', price: 820, totalSeats: 64, availableSeats: 10 },
    ],
    foodService: { available: false },
    luggageAllowance: 25,
  },
  {
    type: 'train',
    trainNumber: '12635',
    trainName: 'வைகை எக்ஸ்பிரஸ் (Vaigai Exp)',
    source: 'MS', sourceName: 'சென்னை',
    destination: 'MDU', destinationName: 'மதுரை',
    departureTime: '13:50', arrivalTime: '21:15',
    duration: '7h 25m', durationMinutes: 445,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'CC', price: 585, totalSeats: 72, availableSeats: 40 },
    ],
    foodService: { available: true, vegOption: true },
    luggageAllowance: 25,
  },
  {
    type: 'train',
    trainNumber: '22671',
    trainName: 'தேஜஸ் எக்ஸ்பிரஸ் (Tejas Premium)',
    source: 'MS', sourceName: 'சென்னை',
    destination: 'MDU', destinationName: 'மதுரை',
    departureTime: '06:00', arrivalTime: '12:15',
    duration: '6h 15m', durationMinutes: 375,
    days: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'CC', price: 1250, totalSeats: 72, availableSeats: 20 },
      { class: 'EC', price: 2350, totalSeats: 48, availableSeats: 10 },
    ],
    foodService: { available: true, vegOption: true, nonVegOption: true },
    luggageAllowance: 40,
  },
  {
    type: 'train',
    trainNumber: '12631',
    trainName: 'நெல்லை எக்ஸ்பிரஸ் (Nellai via MDU)',
    source: 'MS', sourceName: 'சென்னை',
    destination: 'MDU', destinationName: 'மதுரை',
    departureTime: '20:10', arrivalTime: '03:40',
    duration: '7h 30m', durationMinutes: 450,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'SL', price: 310, totalSeats: 72, availableSeats: 5 },
      { class: '3A', price: 820, totalSeats: 64, availableSeats: 2 },
    ],
    foodService: { available: false },
    luggageAllowance: 25,
  },

  // --- Buses (Chennai ⇄ Madurai) ---
  {
    type: 'bus',
    busNumber: 'TN59-MD-2233',
    busOperator: 'SETC (சிறப்பு பஸ்)',
    busType: 'ac',
    source: 'MAS', sourceName: 'சென்னை',
    destination: 'MDU', destinationName: 'மதுரை',
    departureTime: '23:00', arrivalTime: '07:30',
    duration: '8h 30m', durationMinutes: 510,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [ { class: 'AC Seater', price: 650, totalSeats: 44, availableSeats: 30 } ],
    foodService: { available: false },
    luggageAllowance: 15,
  },
  {
    type: 'bus',
    busNumber: 'TN02-RM-8800',
    busOperator: 'SRM Travels (Premium)',
    busType: 'sleeper',
    source: 'MAS', sourceName: 'சென்னை',
    destination: 'MDU', destinationName: 'மதுரை',
    departureTime: '22:00', arrivalTime: '06:00',
    duration: '8h 0m', durationMinutes: 480,
    days: ['Mon', 'Fri', 'Sat'],
    pricing: [ { class: 'AC Sleeper', price: 1350, totalSeats: 30, availableSeats: 10 } ],
    foodService: { available: false },
    luggageAllowance: 20,
  },

  // --- Flights (Chennai ⇄ Madurai) ---
  {
    type: 'flight',
    flightNumber: '6E-711',
    airline: 'IndiGo (காலை)',
    source: 'MAS', sourceName: 'சென்னை',
    destination: 'MDU', destinationName: 'மதுரை',
    departureTime: '08:45', arrivalTime: '09:50',
    duration: '1h 5m', durationMinutes: 65,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [ { class: 'Economy', price: 3400, totalSeats: 180, availableSeats: 90 } ],
    foodService: { available: true },
    luggageAllowance: 15,
  },
  {
    type: 'flight',
    flightNumber: '6E-492',
    airline: 'IndiGo (மாலை)',
    source: 'MAS', sourceName: 'சென்னை',
    destination: 'MDU', destinationName: 'மதுரை',
    departureTime: '17:45', arrivalTime: '18:50',
    duration: '1h 5m', durationMinutes: 65,
    days: ['Fri', 'Sat', 'Sun'],
    pricing: [ { class: 'Economy', price: 4200, totalSeats: 180, availableSeats: 50 } ],
    foodService: { available: true },
    luggageAllowance: 15,
  },

  // ===========================================================================
  // TRICHY (TPJ) ⇄ TIRUNELVELI (TEN)
  // ===========================================================================
  
  // --- Trains (Trichy → Tirunelveli) ---
  {
    type: 'train',
    trainNumber: '12631',
    trainName: 'நெல்லை எக்ஸ்பிரஸ் (Nellai Exp)',
    source: 'TPJ', sourceName: 'திருச்சி',
    destination: 'TEN', destinationName: 'திருநெல்வேலி',
    departureTime: '01:20', arrivalTime: '06:40',
    duration: '5h 20m', durationMinutes: 320,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'SL', price: 230, totalSeats: 72, availableSeats: 25 },
      { class: '3A', price: 610, totalSeats: 64, availableSeats: 12 },
    ],
    foodService: { available: false },
    luggageAllowance: 25,
  },
  {
    type: 'train',
    trainNumber: '12633',
    trainName: 'கன்னியாகுமரி எக்ஸ்பிரஸ்',
    source: 'TPJ', sourceName: 'திருச்சி',
    destination: 'TEN', destinationName: 'திருநெல்வேலி',
    departureTime: '22:30', arrivalTime: '03:20',
    duration: '4h 50m', durationMinutes: 290,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'SL', price: 230, totalSeats: 72, availableSeats: 35 },
    ],
    foodService: { available: false },
    luggageAllowance: 25,
  },
  {
    type: 'train',
    trainNumber: '22627',
    trainName: 'திருச்சி - திருநெல்வேலி இண்டர்சிட்டி',
    source: 'TPJ', sourceName: 'திருச்சி',
    destination: 'TEN', destinationName: 'திருநெல்வேலி',
    departureTime: '07:20', arrivalTime: '13:00',
    duration: '5h 40m', durationMinutes: 340,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: '2S', price: 155, totalSeats: 108, availableSeats: 60 },
      { class: 'CC', price: 540, totalSeats: 72, availableSeats: 20 },
    ],
    foodService: { available: false },
    luggageAllowance: 25,
  },

  // --- Buses (Trichy ⇄ Tirunelveli) ---
  {
    type: 'bus',
    busNumber: 'TN07-TV-9000',
    busOperator: 'SETC (சாதாரண பஸ்)',
    busType: 'super_express',
    source: 'TPJ', sourceName: 'திருச்சி',
    destination: 'TEN', destinationName: 'திருநெல்வேலி',
    departureTime: '09:00', arrivalTime: '14:30',
    duration: '5h 30m', durationMinutes: 330,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [ { class: 'General', price: 280, totalSeats: 52, availableSeats: 15 } ],
    foodService: { available: false },
    luggageAllowance: 10,
  },
  {
    type: 'bus',
    busNumber: 'TN15-SR-2244',
    busOperator: 'SRS Travels (குளிர்சாதனம்)',
    busType: 'ac',
    source: 'TPJ', sourceName: 'திருச்சி',
    destination: 'TEN', destinationName: 'திருநெல்வேலி',
    departureTime: '23:45', arrivalTime: '04:30',
    duration: '4h 45m', durationMinutes: 285,
    days: ['Fri', 'Sat', 'Sun'],
    pricing: [ { class: 'AC Seater', price: 550, totalSeats: 44, availableSeats: 22 } ],
    foodService: { available: false },
    luggageAllowance: 15,
  },
  {
    type: 'bus',
    busNumber: 'TN72-VN-3311',
    busOperator: 'VRT Travels',
    busType: 'sleeper',
    source: 'TEN', sourceName: 'திருநெல்வேலி',
    destination: 'TPJ', destinationName: 'திருச்சி',
    departureTime: '22:30', arrivalTime: '04:00',
    duration: '5h 30m', durationMinutes: 330,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [ { class: 'Non-AC Sleeper', price: 480, totalSeats: 30, availableSeats: 10 } ],
    foodService: { available: false },
    luggageAllowance: 15,
  },
  {
    type: 'bus',
    busNumber: 'TN67-BK-1122',
    busOperator: 'Parveen (Semi-Sleeper)',
    busType: 'express',
    source: 'TPJ', sourceName: 'திருச்சி',
    destination: 'TEN', destinationName: 'திருநெல்வேலி',
    departureTime: '15:30', arrivalTime: '20:45',
    duration: '5h 15m', durationMinutes: 315,
    days: ['Fri', 'Sat'],
    pricing: [ { class: 'General', price: 410, totalSeats: 44, availableSeats: 12 } ],
    foodService: { available: false },
    luggageAllowance: 15,
  },

  // ===========================================================================
  // MADURAI (MDU) ➔ CHENNAI (MAS/MS) - RETURN LEGS
  // ===========================================================================
  
  // --- Trains (Madurai → Chennai) ---
  {
    type: 'train',
    trainNumber: '12638',
    trainName: 'பாண்டியன் எக்ஸ்பிரஸ் (Pandiyan Return)',
    source: 'MDU', sourceName: 'மதுரை',
    destination: 'MS', destinationName: 'சென்னை',
    departureTime: '21:20', arrivalTime: '05:00',
    duration: '7h 40m', durationMinutes: 460,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'SL', price: 310, totalSeats: 72, availableSeats: 30 },
      { class: '3A', price: 820, totalSeats: 64, availableSeats: 15 },
    ],
    foodService: { available: true, vegOption: true },
    luggageAllowance: 25,
  },
  {
    type: 'train',
    trainNumber: '12636',
    trainName: 'வைகை எக்ஸ்பிரஸ் (Vaigai Return)',
    source: 'MDU', sourceName: 'மதுரை',
    destination: 'MS', destinationName: 'சென்னை',
    departureTime: '07:05', arrivalTime: '14:30',
    duration: '7h 25m', durationMinutes: 445,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'CC', price: 585, totalSeats: 72, availableSeats: 50 },
      { class: '2S', price: 175, totalSeats: 108, availableSeats: 100 },
    ],
    foodService: { available: true, vegOption: true },
    luggageAllowance: 25,
  },
  {
    type: 'train',
    trainNumber: '22672',
    trainName: 'தேஜஸ் எக்ஸ்பிரஸ் (Tejas Premium Return)',
    source: 'MDU', sourceName: 'மதுரை',
    destination: 'MS', destinationName: 'சென்னை',
    departureTime: '15:00', arrivalTime: '21:15',
    duration: '6h 15m', durationMinutes: 375,
    days: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'CC', price: 1250, totalSeats: 72, availableSeats: 35 },
      { class: 'EC', price: 2350, totalSeats: 48, availableSeats: 18 },
    ],
    foodService: { available: true, vegOption: true, nonVegOption: true },
    luggageAllowance: 40,
  },

  // --- Buses (Madurai → Chennai) ---
  {
    type: 'bus',
    busNumber: 'TN59-MD-9988',
    busOperator: 'SETC (மாநில அரசு பஸ்)',
    busType: 'super_express',
    source: 'MDU', sourceName: 'மதுரை',
    destination: 'MAS', destinationName: 'சென்னை',
    departureTime: '21:30', arrivalTime: '06:00',
    duration: '8h 30m', durationMinutes: 510,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [ { class: 'General', price: 450, totalSeats: 52, availableSeats: 30 } ],
    foodService: { available: false },
    luggageAllowance: 15,
  },
  {
    type: 'bus',
    busNumber: 'TN02-RM-5544',
    busOperator: 'SRM Travels (Premium Return)',
    busType: 'sleeper',
    source: 'MDU', sourceName: 'மதுரை',
    destination: 'MAS', destinationName: 'சென்னை',
    departureTime: '22:30', arrivalTime: '06:45',
    duration: '8h 15m', durationMinutes: 495,
    days: ['Mon', 'Fri', 'Sat', 'Sun'],
    pricing: [ { class: 'AC Sleeper', price: 1350, totalSeats: 30, availableSeats: 20 } ],
    foodService: { available: false },
    luggageAllowance: 20,
  },

  // --- Flights (Madurai → Chennai) ---
  {
    type: 'flight',
    flightNumber: '6E-712',
    airline: 'IndiGo (மதியம்)',
    source: 'MDU', sourceName: 'மதுரை',
    destination: 'MAS', destinationName: 'சென்னை',
    departureTime: '11:20', arrivalTime: '12:25',
    duration: '1h 5m', durationMinutes: 65,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [ { class: 'Economy', price: 3400, totalSeats: 180, availableSeats: 100 } ],
    foodService: { available: true },
    luggageAllowance: 15,
  },
  {
    type: 'flight',
    flightNumber: 'AI-673',
    airline: 'Air India (நள்ளிரவு)',
    source: 'MDU', sourceName: 'மதுரை',
    destination: 'MAS', destinationName: 'சென்னை',
    departureTime: '20:15', arrivalTime: '21:25',
    duration: '1h 10m', durationMinutes: 70,
    days: ['Mon', 'Wed', 'Fri', 'Sun'],
    pricing: [ { class: 'Economy', price: 4100, totalSeats: 140, availableSeats: 60 } ],
    foodService: { available: true },
    luggageAllowance: 25,
  },

  // ===========================================================================
  // TIRUNELVELI (TEN) ➔ TRICHY (TPJ) - RETURN LEGS
  // ===========================================================================
  
  // --- Trains (Tirunelveli → Trichy) ---
  {
    type: 'train',
    trainNumber: '12632',
    trainName: 'நெல்லை எக்ஸ்பிரஸ் (Nellai Return)',
    source: 'TEN', sourceName: 'திருநெல்வேலி',
    destination: 'TPJ', destinationName: 'திருச்சி',
    departureTime: '19:50', arrivalTime: '01:05',
    duration: '5h 15m', durationMinutes: 315,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: 'SL', price: 230, totalSeats: 72, availableSeats: 40 },
      { class: '3A', price: 610, totalSeats: 64, availableSeats: 25 },
    ],
    foodService: { available: false },
    luggageAllowance: 25,
  },
  {
    type: 'train',
    trainNumber: '22628',
    trainName: 'திருநெல்வேலி - திருச்சி இண்டர்சிட்டி',
    source: 'TEN', sourceName: 'திருநெல்வேலி',
    destination: 'TPJ', destinationName: 'திருச்சி',
    departureTime: '14:30', arrivalTime: '20:10',
    duration: '5h 40m', durationMinutes: 340,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [
      { class: '2S', price: 155, totalSeats: 108, availableSeats: 90 },
      { class: 'CC', price: 540, totalSeats: 72, availableSeats: 45 },
    ],
    foodService: { available: false },
    luggageAllowance: 25,
  },

  // --- Buses (Tirunelveli → Trichy) ---
  {
    type: 'bus',
    busNumber: 'TN72-VN-1144',
    busOperator: 'SETC (விரைவு பஸ்)',
    busType: 'super_express',
    source: 'TEN', sourceName: 'திருநெல்வேலி',
    destination: 'TPJ', destinationName: 'திருச்சி',
    departureTime: '10:30', arrivalTime: '16:00',
    duration: '5h 30m', durationMinutes: 330,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [ { class: 'General', price: 280, totalSeats: 52, availableSeats: 40 } ],
    foodService: { available: false },
    luggageAllowance: 10,
  },
  {
    type: 'bus',
    busNumber: 'TN15-AR-9900',
    busOperator: 'SRS Travels (குளிர்சாதனம் Return)',
    busType: 'ac',
    source: 'TEN', sourceName: 'திருநெல்வேலி',
    destination: 'TPJ', destinationName: 'திருச்சி',
    departureTime: '21:30', arrivalTime: '02:15',
    duration: '4h 45m', durationMinutes: 285,
    days: ['Fri', 'Sat', 'Sun'],
    pricing: [ { class: 'AC Seater', price: 580, totalSeats: 44, availableSeats: 35 } ],
    foodService: { available: false },
    luggageAllowance: 15,
  },
  // ===========================================================================
  // MADURAI (MDU) ⇄ COIMBATORE (CBE)
  // ===========================================================================

  // --- Trains (Madurai → Coimbatore) ---
  {
    type: 'train',
    trainNumber: '16321',
    trainName: 'நாகர்கோவில் - கோவை எக்ஸ்பிரஸ் (MDU-CBE)',
    source: 'MDU', sourceName: 'மதுரை',
    destination: 'CBE', destinationName: 'கோவை',
    departureTime: '11:15', arrivalTime: '15:10',
    duration: '3h 55m', durationMinutes: 235,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [ { class: '2S', price: 145, totalSeats: 108, availableSeats: 45 } ],
    foodService: { available: false },
    luggageAllowance: 25,
  },
  {
    type: 'train',
    trainNumber: '56319',
    trainName: 'மதுரை - கோவை பாசஞ்சர்',
    source: 'MDU', sourceName: 'மதுரை',
    destination: 'CBE', destinationName: 'கோவை',
    departureTime: '07:25', arrivalTime: '12:45',
    duration: '5h 20m', durationMinutes: 320,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [ { class: 'General', price: 90, totalSeats: 120, availableSeats: 80 } ],
    foodService: { available: false },
    luggageAllowance: 20,
  },

  // --- Trains (Coimbatore → Madurai) ---
  {
    type: 'train',
    trainNumber: '16322',
    trainName: 'கோவை - நாகர்கோவில் எக்ஸ்பிரஸ் (CBE-MDU)',
    source: 'CBE', sourceName: 'கோவை',
    destination: 'MDU', destinationName: 'மதுரை',
    departureTime: '16:00', arrivalTime: '19:55',
    duration: '3h 55m', durationMinutes: 235,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [ { class: '2S', price: 145, totalSeats: 108, availableSeats: 50 } ],
    foodService: { available: false },
    luggageAllowance: 25,
  },

  // --- Buses (Madurai ⇄ Coimbatore) ---
  {
    type: 'bus',
    busNumber: 'TN59-MD-1144',
    busOperator: 'TNSTC (மதுரை - கோவை)',
    busType: 'super_express',
    source: 'MDU', sourceName: 'மதுரை',
    destination: 'CBE', destinationName: 'கோவை',
    departureTime: '10:00', arrivalTime: '14:30',
    duration: '4h 30m', durationMinutes: 270,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pricing: [ { class: 'General', price: 210, totalSeats: 52, availableSeats: 30 } ],
    foodService: { available: false },
    luggageAllowance: 10,
  },
  {
    type: 'bus',
    busNumber: 'TN38-CBE-9922',
    busOperator: 'KPN Travels (குளிர்சாதனம்)',
    busType: 'ac',
    source: 'CBE', sourceName: 'கோவை',
    destination: 'MDU', destinationName: 'மதுரை',
    departureTime: '15:30', arrivalTime: '19:45',
    duration: '4h 15m', durationMinutes: 255,
    days: ['Fri', 'Sat', 'Sun'],
    pricing: [ { class: 'AC Seater', price: 450, totalSeats: 44, availableSeats: 25 } ],
    foodService: { available: false },
    luggageAllowance: 15,
  },

  // --- Flights (Madurai ⇄ Coimbatore) ---
  {
    type: 'flight',
    flightNumber: '6E-442',
    airline: 'IndiGo (Shuttle)',
    source: 'MDU', sourceName: 'மதுரை',
    destination: 'CBE', destinationName: 'கோவை',
    departureTime: '08:00', arrivalTime: '08:45',
    duration: '0h 45m', durationMinutes: 45,
    days: ['Mon', 'Wed', 'Fri'],
    pricing: [ { class: 'Economy', price: 1800, totalSeats: 72, availableSeats: 15 } ],
    foodService: { available: false },
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

    await mongoose.disconnect();
    console.log('\n✅ Data enrichment complete! Run: npm run dev');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
