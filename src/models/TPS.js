const mongoose = require("mongoose");

const tpsSchema = new mongoose.Schema({
  nama_tps: { type: String, required: true },
  deskripsi: { type: String },
  // Format GeoJSON
  location: {
    type: { type: String, enum: ["Point"], required: true, default: "Point" },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  status_terkini: { 
    type: String, 
    enum: ["kosong", "sedang", "penuh"], 
    default: "kosong" 
  },
  skor_kepenuhan: { type: Number, default: 1 }, // Skala 1-5
  terakhir_diperbarui: { type: Date, default: Date.now }
}, { timestamps: true });

// Membuat index 2dsphere untuk query pencarian berbasis radius
tpsSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("TPS", tpsSchema);
