const mongoose = require("mongoose");
const TPS = require("../models/TPS");

const dummyData = [
  {
    nama_tps: "TPS Gampong Peurada",
    deskripsi: "Berada di dekat jalan utama",
    location: {
      type: "Point",
      coordinates: [95.3400, 5.5700] // [longitude, latitude] Banda Aceh
    },
    status_terkini: "kosong",
    skor_kepenuhan: 1.0
  },
  {
    nama_tps: "TPS Ulee Kareng",
    deskripsi: "Simpang 7 Ulee Kareng",
    location: {
      type: "Point",
      coordinates: [95.3450, 5.5550]
    },
    status_terkini: "sedang",
    skor_kepenuhan: 3.0
  },
  {
    nama_tps: "TPS Lamprit",
    deskripsi: "Dekat RSUDZA",
    location: {
      type: "Point",
      coordinates: [95.3250, 5.5600]
    },
    status_terkini: "penuh",
    skor_kepenuhan: 4.5
  }
];

const seedDummy = async () => {
  try {
    require("dotenv").config();
    await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.mongodb.net/trashid");
    console.log("MongoDB Terhubung");

    // Hapus data lama agar tidak tumpang tindih
    await TPS.deleteMany({});
    console.log("Data TPS lama dibersihkan");

    // Masukkan data baru
    await TPS.insertMany(dummyData);
    console.log("3 Data Dummy TPS berhasil ditambahkan!");

    process.exit(0);
  } catch (error) {
    console.error("Gagal menambahkan dummy:", error);
    process.exit(1);
  }
};

seedDummy();
