const User = require("../models/User");
const TPSReport = require("../models/TPSReport");
const TPSLocation = require("../models/TPS");
const reportService = require("../services/reportService");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalReports = await TPSReport.countDocuments();
    const waitingReports = await TPSReport.countDocuments({ status_laporan: "pending" });
    const verifiedReports = await TPSReport.countDocuments({ status_laporan: "verified" });
    const rejectedReports = await TPSReport.countDocuments({ status_laporan: "rejected" });
    const totalUsers = await User.countDocuments();
    const totalTPS = await TPSLocation.countDocuments();

    // Ambil 5 laporan terbaru
    const recentReports = await TPSReport.find()
      .populate("user_id", "fullName username")
      .populate("tps_id", "nama_tps")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      status: "success",
      data: {
        counts: {
          total: totalReports,
          waiting: waitingReports,
          verified: verifiedReports,
          rejected: rejectedReports,
          users: totalUsers,
          tps: totalTPS
        },
        recentReports
      }
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      status: req.query.status,
      tpu: req.query.tpu,
      dateRange: req.query.dateRange
    };
    const reports = await reportService.getAllReports(filters);
    res.status(200).json({ status: "success", data: reports });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.verifyReport = async (req, res) => {
  try {
    const report = await reportService.verifyReport(req.params.id);
    if (!report)
      return res.status(404).json({ message: "Laporan tidak ditemukan" });

    res.status(200).json({
      status: "success",
      message: "Laporan berhasil diverifikasi",
      data: report,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.rejectReport = async (req, res) => {
  try {
    const report = await reportService.rejectReport(req.params.id);
    if (!report)
      return res.status(404).json({ message: "Laporan tidak ditemukan" });

    res.status(200).json({
      status: "success",
      message: "Laporan ditolak",
      data: report,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
