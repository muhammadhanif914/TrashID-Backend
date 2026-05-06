const mongoose = require("mongoose");

const tpsReportSchema = new mongoose.Schema({
  tps_id: { type: mongoose.Schema.Types.ObjectId, ref: "TPS", required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tingkat_kepenuhan: { type: Number, required: true, min: 1, max: 5 },
  foto_url: { type: String, required: true },
  deskripsi: { type: String, default: "" },
  // Koordinat asli tempat user mengambil foto (validasi jarak dari TPS)
  user_location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  status_laporan: { 
    type: String, 
    enum: ["pending", "verified", "rejected", "spam"], 
    default: "pending" 
  }
}, { timestamps: true });

// Indexing for faster aggregation queries
tpsReportSchema.index({ tps_id: 1, user_id: 1, createdAt: -1 });

module.exports = mongoose.model("TPSReport", tpsReportSchema);
