const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes    = require('./routes/authRoutes');
const travelRoutes  = require('./routes/travelRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const ticketRoutes  = require('./routes/ticketRoutes');
const nlpRoutes     = require('./routes/nlpRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// ─── Security & Utility Middleware ───────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'அதிக கோரிக்கைகள். சிறிது நேரம் கழித்து முயற்சிக்கவும்' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'அதிக உள்நுழைவு முயற்சிகள். 15 நிமிடம் கழித்து முயற்சிக்கவும்' },
});
const nlpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Increased for development
  message: { success: false, message: 'AI பயன்பாடு அதிகம். சிறிது நேரம் கழித்து முயற்சிக்கவும்' },
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/nlp', nlpLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    app: 'நம்ம யாத்திரை API',
    version: '1.0.0',
    message: 'வணக்கம்! நம்ம யாத்திரை பயண பதிவு அமைப்பு தயாராக உள்ளது.',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth:    '/api/auth',
      travel:  '/api/travel',
      booking: '/api/bookings',
      tickets: '/api/tickets',
      nlp:     '/api/nlp',
    },
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/travel',   travelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tickets',  ticketRoutes);
app.use('/api/nlp',      nlpRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `வழி கிடைக்கவில்லை: ${req.originalUrl}`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 நம்ம யாத்திரை சர்வர் இயங்குகிறது!`);
  console.log(`   Port    : ${PORT}`);
  console.log(`   Env     : ${process.env.NODE_ENV}`);
  console.log(`   URL     : http://localhost:${PORT}\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = app;
