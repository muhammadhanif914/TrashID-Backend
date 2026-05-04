const TPS = require("../models/TPS");
const TPSReport = require("../models/TPSReport");
const User = require("../models/User");

// Mengambil semua data TPS
exports.getAllTPS = async () => {
  const tpsList = await TPS.find();
  return tpsList;
};

// Menambah TPS Baru
exports.createTPS = async (data) => {
  const { nama_tps, deskripsi, lat, lng } = data;
  return await TPS.create({
    nama_tps,
    deskripsi,
    location: {
      type: "Point",
      coordinates: [lng, lat] // MongoDB uses [lng, lat]
    },
    status_terkini: "kosong"
  });
};

// Mengambil semua laporan
exports.getAllReports = async () => {
  return await TPSReport.find()
    .populate("tps_id", "nama_tps location")
    .populate("user_id", "fullName username")
    .sort({ createdAt: -1 });
};

// Mengambil laporan berdasarkan user
exports.getUserReports = async (userId) => {
  return await TPSReport.find({ user_id: userId })
    .populate("tps_id", "nama_tps")
    .sort({ createdAt: -1 });
};

// Update status laporan
exports.updateReportStatus = async (reportId, status) => {
  const report = await TPSReport.findById(reportId);
  if (!report) throw new Error("Laporan tidak ditemukan");

  report.status_laporan = status;
  await report.save();
  return report;
};

// Mengambil TPS terdekat
exports.getNearbyTPS = async (lng, lat, radiusInMeters = 5000) => {
  return await TPS.find({
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: radiusInMeters,
      },
    },
  });
};

// Fungsi bantuan Haversine formula (opsional, jika ingin validasi murni matematis)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius bumi dalam km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Menambahkan Laporan dan Agregasi Status
exports.submitReport = async (data) => {
  const { tps_id, user_id, tingkat_kepenuhan, foto_url, lat, lng } = data;

  // 1. Cek apakah TPS ada
  const tps = await TPS.findById(tps_id);
  if (!tps) throw new Error("TPS tidak ditemukan");

  // 2. Geofencing: Dinonaktifkan sesuai permintaan (agar bisa melapor dari mana saja)
  /*
  const distanceKm = getDistanceFromLatLonInKm(
    lat, lng,
    tps.location.coordinates[1], tps.location.coordinates[0]
  );
  
  if (distanceKm > 0.1) {
    throw new Error("Anda terlalu jauh dari lokasi TPS untuk mengirim laporan.");
  }
  */

  // 3. Cooldown check: Apakah user ini sudah melapor di TPS ini dalam 6 jam terakhir?
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const recentReport = await TPSReport.findOne({
    tps_id,
    user_id,
    createdAt: { $gte: sixHoursAgo }
  });

  if (recentReport) {
    throw new Error("Anda sudah mengirim laporan untuk TPS ini baru-baru ini. Silakan coba lagi nanti.");
  }

  // 4. Simpan laporan
  const report = await TPSReport.create({
    tps_id,
    user_id,
    tingkat_kepenuhan,
    foto_url,
    user_location: { type: "Point", coordinates: [lng, lat] },
    status_laporan: "verified" // Otomatis verified karena lolos geofencing
  });

  // 5. Agregasi status TPS (Real-time update)
  // Ambil laporan dalam 12 jam terakhir
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
  const recentReports = await TPSReport.find({
    tps_id,
    status_laporan: "verified",
    createdAt: { $gte: twelveHoursAgo }
  });

  if (recentReports.length > 0) {
    const totalScore = recentReports.reduce((sum, r) => sum + r.tingkat_kepenuhan, 0);
    const averageScore = totalScore / recentReports.length;

    let newStatus = "kosong";
    if (averageScore > 3.5) newStatus = "penuh";
    else if (averageScore > 2.0) newStatus = "sedang";

    tps.skor_kepenuhan = Math.round(averageScore * 10) / 10;
    tps.status_terkini = newStatus;
    tps.terakhir_diperbarui = Date.now();
    await tps.save();
  }

  return report;
};
