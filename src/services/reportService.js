const TPSReport = require("../models/TPSReport");
const TPS = require("../models/TPS");
const mongoose = require("mongoose");

exports.createReport = async (data) => {
  const newReport = await TPSReport.create(data);
  return newReport;
};

exports.getAllReports = async (filters = {}) => {
  const query = {};

  // Filter Status
  if (filters.status && filters.status !== "all" && filters.status !== "Semua Status") {
    query.status_laporan = filters.status;
  }

  // Filter TPU (ID)
  if (filters.tpu && filters.tpu !== "all" && filters.tpu !== "Semua TPU") {
    query.tps_id = filters.tpu;
  }

  // Filter Date Range (7 hari terakhir)
  if (filters.dateRange === "7days" || filters.dateRange === "7 Hari Terakhir") {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    query.createdAt = { $gte: sevenDaysAgo };
  }

  // Search Logic (Pencarian sederhana di deskripsi atau ID)
  if (filters.search) {
    const isId = mongoose.Types.ObjectId.isValid(filters.search);
    if (isId) {
      query._id = filters.search;
    } else {
      query.deskripsi = { $regex: filters.search, $options: "i" };
    }
  }

  return await TPSReport.find(query)
    .populate("user_id", "fullName email")
    .populate("tps_id", "nama_tps")
    .sort({ createdAt: -1 });
};

exports.verifyReport = async (reportId) => {
  const report = await TPSReport.findByIdAndUpdate(
    reportId,
    { status_laporan: "verified" },
    { new: true },
  );
  return report;
};

exports.rejectReport = async (reportId) => {
  return await TPSReport.findByIdAndUpdate(
    reportId,
    { status_laporan: "rejected" },
    { new: true },
  );
};
