// models/UnitMeasurement.js
const mongoose = require('mongoose');
const unitMeasurementSchema = new mongoose.Schema({
  companyId: { 
    type: String, 
    required: true 
  },
  code: {
    type: String,
    required: true,
    validate: {
      validator: v => /^\d{2}$/.test(v), // Ensures exactly 2 digits
      message: props => `${props.value} is not a valid unit code. Must be exactly 2 digits.`,
    },
  },
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String,
    required: true
  }
}, { 
  timestamps: true 
});

// Ensure unique combination of companyId and code
unitMeasurementSchema.index({ companyId: 1, code: 1 }, { unique: true });
// Ensure unique combination of companyId and title
unitMeasurementSchema.index({ companyId: 1, title: 1 }, { unique: true });
 
module.exports = mongoose.model('UnitMeasurement', unitMeasurementSchema);