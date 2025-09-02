const mongoose = require('mongoose');

const goDownSchema = new mongoose.Schema({
  companyId: { 
    type: String, 
    required: true 
  },
  code: {
    type: Number,  // Changed from String to Number
    required: true,
    validate: {
      validator: v => Number.isInteger(v) && v > 0,  // Ensures positive integer
      message: props => `${props.value} is not a valid godown code. Must be a positive integer.`,
    },
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  alphabet: {
    type: String,
    required: true,
    validate: {
      validator: v => /^[A-Za-z]$/.test(v), // Ensures single alphabet character
      message: props => `${props.value} is not a valid alphabet. Must be a single character (A-Z).`,
    },
  },
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String
    }
}, { 
  timestamps: true 
});

// Ensure unique combination of companyId and code
goDownSchema.index({ companyId: 1, code: 1 }, { unique: true });

// Ensure unique combination of companyId and name
goDownSchema.index({ companyId: 1, name: 1 }, { unique: true });

// Ensure unique combination of companyId and alphabet
goDownSchema.index({ companyId: 1, alphabet: 1 }, { unique: true });

const goDown = mongoose.model('goDown', goDownSchema);

module.exports = goDown;