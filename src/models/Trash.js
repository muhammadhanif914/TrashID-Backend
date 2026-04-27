const mongoose = require("mongoose");

const trashSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
  },
  confidence: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Trash", trashSchema);
