const wasteService = require("../services/wasteService");

/**
 * Handle HTTP Request untuk memproses scan gambar sampah
 */
exports.handleScan = async (req, res) => {
  try {
    const userId = req.user.id; // Didapat dari authMiddleware

    // Validasi input gambar dari Multer
    if (!req.file) {
      return res.status(400).json({
        status: "fail",
        message: "Gambar sampah wajib disertakan.",
      });
    }

    const imagePath = req.file.path;

    // Teruskan ke Service Layer (Business Logic)
    const result = await wasteService.processImageScan(imagePath, userId);

    // Kembalikan Response ke Client
    res.status(200).json({
      status: "success",
      message: "Berhasil melakukan scan sampah",
      data: {
        classification: result.scanData.classification,
        confidence: result.scanData.confidence,
        edukasi: result.edukasi,
        image: result.scanData.image,
        scan_id: result.scanData._id,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};
