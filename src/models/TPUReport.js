const mongoose = require("mongoose");

const tpuReportSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  deskripsi: { type: String, required: true },
  foto: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TPUReport", tpuReportSchema);
