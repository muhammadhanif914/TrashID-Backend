const User = require("../models/User");
const TPUReport = require("../models/TPUReport");
const TPULocation = require("../models/TPULocation");
const reportService = require("../services/reportService");

// exports.getAllUsers = async (req, res) => {
//   try {
//     const users = await Use
//   }
// }

exports.getAllReports = async (req, res) => {
  try {
    const reports = await reportService.getAllReports();
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
