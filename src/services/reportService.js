const TPSReport = require("../models/TPSReport");
const TPS = require("../models/TPS");

exports.createReport = async (data) => {
  const newReport = await TPSReport.create(data);
  return newReport;
};

exports.getAllReports = async () => {
  return await TPSReport.find()
    .populate("user_id", "fullName email")
    .sort({ createdAt: -1 });
};

exports.verifyReport = async (reportId) => {
  const report = await TPSReport.findByIdAndUpdate(
    reportId,
    { status_laporan: "verified" },
    { new: true },
  );
  if (report) {
    // Opsional: Otomatis update status TPS kalau diimplementasikan logic radiusnya
  }
  return report;
};

exports.rejectReport = async (reportId) => {
  return await TPSReport.findByIdAndUpdate(
    reportId,
    { status_laporan: "rejected" },
    { new: true },
  );
};
