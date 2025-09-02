// models/Provinces.js
const mongoose = require('mongoose');

const provinceSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  rateDiff: {
    type: Number,
    required: true
  },
  rateChoice: {
    type: Number,
    required: true
  },
  status: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const Province = mongoose.model('Provinces', provinceSchema);
module.exports = Province;