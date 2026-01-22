const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema({
  // =====================
  // EXISTING FIELDS (UNCHANGED)
  // =====================
  name: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  image: {
    type: String // can store local path like /uploads/image.jpg
  },

  category: {
    type: String
  },

  isAvailable: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

  // ❗ NOTHING REMOVED
  // ❗ NOTHING RENAMED
  // ❗ ONLY USAGE CHANGED (URL → local file path)
});

module.exports = mongoose.model("MenuItem", MenuItemSchema);
