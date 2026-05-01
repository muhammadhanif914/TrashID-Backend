const mongoose = require("mongoose");

const wasteScanSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  image: { type: String, required: true },
  classification: {
    type: String,
    enum: ["organik", "anorganik", "residu"],
    required: true,
  },
  confidence: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("WasteScan", wasteScanSchema);
