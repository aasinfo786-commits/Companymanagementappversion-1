// models/SroSchedule.js
const mongoose = require('mongoose');
const SroScheduleSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, 'ID is required'],
    unique: true,
    trim: true
  },
  companyId: {
    type: String,
    required: [true, 'Company ID is required'],
    trim: true
  },
  sroItemId: {
    type: String,
    required: [true, 'SRO Item ID is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique SRO items per company
SroScheduleSchema.index({ companyId: 1, sroItemId: 1 }, { unique: true });

// Text index for search functionality
SroScheduleSchema.index({ description: 'text' });

// Update the updatedAt field before saving
SroScheduleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const SroSchedule = mongoose.model('SroSchedule', SroScheduleSchema);
module.exports = SroSchedule;