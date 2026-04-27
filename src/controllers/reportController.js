const reportService = require("../services/reportService");

exports.createReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { deskripsi, latitude, longitude } = req.body;
    const fotoPath = req.file ? req.file.path : "dummy/path/report.jpg";

    if (!req.file || !deskripsi || !latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "Lengkapi deskripsi, foto, dan koordinat lokasi." });
    }

    const reportData = {
      user_id: userId,
      deskripsi,
      foto: fotoPath,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    const newReport = await reportService.createReport(reportData);

    res.status(201).json({
      status: "success",
      message: "Laporan berhasil dibuat dengan status pending",
      data: newReport,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await reportService.getAllReports();
    // Jika untuk user biasa, mungkin ada filtering berdasarkan user_id (req.user.id)
    // Tapi untuk mock, kita return semua
    res.status(200).json({ status: "success", data: reports });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
