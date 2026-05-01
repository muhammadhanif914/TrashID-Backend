const mongoose = require("mongoose");

const tpuReportSchema = new mongoose.Schema({
  user_id     : {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
              },
  deskripsi   : { type: String, required: true },
  foto        : { type: String, required: true },
  coordinates : {
    latitude  : { type: Number, required: true },
    longitude : { type: Number, required: true },
                },
  status      : {
                  type: String,
                  enum: ["pending", "verified", "rejected"],
                  default: "pending",
                },
  created_at:   { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("TPUReport", tpuReportSchema);
