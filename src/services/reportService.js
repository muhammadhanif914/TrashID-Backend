const TPUReport = require("../models/TPUReport");
const TPULocation = require("../models/TPULocation");

exports.createReport = async (data) => {
  const newReport = await TPUReport.create(data);
  return newReport;
};

exports.getAllReports = async () => {
  return await TPUReport.find()
    .populate("user_id", "name email")
    .sort({ created_at: -1 });
};

exports.verifyReport = async (reportId) => {
  const report = await TPUReport.findByIdAndUpdate(
    reportId,
    { status: "verified" },
    { new: true },
  );
  if (report) {
    // Opsional: Otomatis update status TPULocation kalau diimplementasikan logic radiusnya
  }
  return report;
};

exports.rejectReport = async (reportId) => {
  return await TPUReport.findByIdAndUpdate(
    reportId,
    { status: "rejected" },
    { new: true },
  );
};
