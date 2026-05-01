const mongoose = require("mongoose");

const tpuLocationSchema = new mongoose.Schema({
  nama_tpu: { type: String, required: true },
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  status: { type: String, enum: ["penuh", "kosong"], default: "kosong" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("TPULocation", tpuLocationSchema);