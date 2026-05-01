const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  status: { type: String, enum: ['normal', 'hampir penuh', 'penuh'], required: true },
  description: { type: String, required: true },
  verified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);