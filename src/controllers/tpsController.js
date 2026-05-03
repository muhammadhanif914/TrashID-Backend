const tpsService = require("../services/tpsService");

exports.getAllTPS = async (req, res) => {
  try {
    const tpsList = await tpsService.getAllTPS();
    res.status(200).json({ status: "success", data: tpsList });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
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

    // Menggunakan path file relatif atau absolute, disesuaikan dengan serve static
    const foto_url = `/uploads/${req.file.filename}`;

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
