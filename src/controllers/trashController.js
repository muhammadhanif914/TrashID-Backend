const mlService = require("../services/mlService");
// const Trash = require('../models/Trash'); // Nanti dipanggil untuk simpan hasil ke DB

exports.predictTrash = async (req, res) => {
  try {
    // Simulasi memanggil service ML
    // Idealnya file gambar diambil dari req.file jika menggunakan multer
    const predictionResult = await mlService.predict("placeholder_image_data");

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
