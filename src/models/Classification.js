const mongoose = require('mongoose');

const classificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image: { type: String, required: true },
  result: { type: String, required: true },
  confidence: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Classification', classificationSchema);