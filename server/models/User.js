const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  userFullName: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  userPicture: {
    type: String
  },
  isAllowed: {
    type: Boolean,
    default: true
  },
  companyId: {
    type: String,
    trim: true,
    required: false,
  },
  locationId: {
    type: String,
    trim: true,
    required: false,
  },
  financialYearId: {
    type: String,
    trim: true,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    console.log('🔐 Pre-save hook triggered: hashing password...');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('✅ Password hashed successfully.');
    next();
  } catch (error) {
    console.error('❌ Error hashing password:', error.message);
    next(error);
  }
});

module.exports = mongoose.model('User', userSchema);