const mongoose = require('mongoose');

const tpuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  status: { type: String, enum: ['normal', 'hampir penuh', 'penuh'], default: 'normal' }
}, { timestamps: true });

module.exports = mongoose.model('TPU', tpuSchema);