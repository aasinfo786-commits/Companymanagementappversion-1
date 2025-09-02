const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  title: { type: String, required: true },
  href: { type: String, default: "#" },    // Route or link
  icon: { type: String, default: "" },     // Icon name or class
  children: [
    {
      type: mongoose.Schema.Types.Mixed,  // Recursive nested menus
    },
  ],
});

module.exports = mongoose.model('Menu', menuSchema);
