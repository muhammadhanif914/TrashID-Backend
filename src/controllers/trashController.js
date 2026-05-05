const mlService = require("../services/mlService");
// const Trash = require('../models/Trash'); // Nanti dipanggil untuk simpan hasil ke DB

exports.predictTrash = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "fail",
        message: "Gambar sampah wajib disertakan.",
      });
    }

    const predictionResult = await mlService.predict(req.file.path);

    res.status(200).json({
      status: "success",
      data: predictionResult,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal melakukan prediksi",
      error: error.message,
    });
  }
};

exports.getHistory = async (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Mendapatkan riwayat deteksi sampah",
  });
};
