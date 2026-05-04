const tpsService = require("../services/tpsService");

exports.getAllTPS = async (req, res) => {
  try {
    const tpsList = await tpsService.getAllTPS();
    res.status(200).json({ status: "success", data: tpsList });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.createTPS = async (req, res) => {
  try {
    const { nama_tps, deskripsi, lat, lng } = req.body;
    
    if (!nama_tps || !lat || !lng) {
      return res.status(400).json({ status: "fail", message: "Nama, lat, dan lng wajib diisi" });
    }

    const newTps = await tpsService.createTPS({ nama_tps, deskripsi, lat, lng });
    res.status(201).json({ status: "success", data: newTps });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.getNearbyTPS = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ status: "fail", message: "lat dan lng wajib disertakan" });
    }

    const tpsList = await tpsService.getNearbyTPS(
      parseFloat(lng), 
      parseFloat(lat), 
      radius ? parseInt(radius) : 5000
    );

    res.status(200).json({ status: "success", data: tpsList });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await tpsService.getAllReports();
    res.status(200).json({ status: "success", data: reports });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const reports = await tpsService.getUserReports(req.user._id);
    res.status(200).json({ status: "success", data: reports });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["verified", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ status: "fail", message: "Status tidak valid" });
    }

    const updatedReport = await tpsService.updateReportStatus(id, status);
    res.status(200).json({
      status: "success",
      message: `Laporan berhasil di-${status}`,
      data: updatedReport,
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.submitReport = async (req, res) => {
  try {
    const user_id = req.user.id; // Didapat dari authMiddleware
    const { tps_id, tingkat_kepenuhan, lat, lng } = req.body;

    if (!req.file) {
      return res.status(400).json({ status: "fail", message: "Foto wajib disertakan" });
    }
    
    if (!tps_id || !tingkat_kepenuhan || !lat || !lng) {
      return res.status(400).json({ status: "fail", message: "tps_id, tingkat_kepenuhan, lat, dan lng wajib disertakan" });
    }

    // Menggunakan path dari Cloudinary (URL Lengkap)
    const foto_url = req.file.path;

    const report = await tpsService.submitReport({
      tps_id,
      user_id,
      tingkat_kepenuhan: parseInt(tingkat_kepenuhan),
      foto_url,
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    });

    res.status(201).json({
      status: "success",
      message: "Laporan berhasil dikirim dan diverifikasi",
      data: report
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
