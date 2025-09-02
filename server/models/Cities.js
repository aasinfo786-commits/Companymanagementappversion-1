// models/Cities.js
const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true
  },
  provinceId: {
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
  status: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const citiesSchema = mongoose.model('Cities', citySchema);
module.exports = citiesSchema;
