const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, default: "Umum" },
    order: { type: Number, default: 0 }, // Untuk mengurutkan posisi FAQ
  },
  { timestamps: true }
);

module.exports = mongoose.model("FAQ", faqSchema);
