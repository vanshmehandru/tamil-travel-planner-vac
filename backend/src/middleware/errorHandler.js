const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'சர்வர் பிழை. மீண்டும் முயற்சிக்கவும்'; // Server error. Please try again

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const fieldNames = {
      username: 'பயனர்பெயர்',
      email: 'மின்னஞ்சல்',
      ticketId: 'டிக்கெட் ஐடி',
      pnrNumber: 'PNR எண்',
    };
    message = `${fieldNames[field] || field} ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது`; // already registered
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'செல்லாத டோக்கன்'; // Invalid token
    statusCode = 401;
  }
  if (err.name === 'TokenExpiredError') {
    message = 'டோக்கன் காலாவதியாகிவிட்டது. மீண்டும் உள்நுழையவும்'; // Token expired. Please login again
    statusCode = 401;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    message = `தவறான ${err.path} மதிப்பு`; // Invalid field value
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
