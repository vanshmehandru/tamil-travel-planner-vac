const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'பயனர்பெயர் தேவை'], // Username is required
      trim: true,
      unique: true,
      maxlength: [50, 'பயனர்பெயர் 50 எழுத்துகளுக்கு மேல் இருக்கக்கூடாது'],
    },
    email: {
      type: String,
      required: [true, 'மின்னஞ்சல் தேவை'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'சரியான மின்னஞ்சல் கொடுக்கவும்'],
    },
    password: {
      type: String,
      required: [true, 'கடவுச்சொல் தேவை'],
      minlength: [6, 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்'],
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
