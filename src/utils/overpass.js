const axios = require("axios");
const mongoose = require("mongoose");
const TPS = require("../models/TPS");

// Fungsi untuk seeding TPS menggunakan Overpass API
exports.seedTPSFromOSM = async () => {
  try {
    console.log("Mulai menarik data TPS dari OpenStreetMap (Area Aceh)...");
    
    // Query Overpass API untuk tempat pembuangan sampah di Aceh
    const query = `
      [out:json];
      area["name"="Aceh"]->.searchArea;
      (
        node["amenity"="waste_disposal"](area.searchArea);
        node["amenity"="waste_transfer_station"](area.searchArea);
      );
      out body;
    `;

    const response = await axios.post("https://overpass-api.de/api/interpreter", `data=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'TrashID/1.0 (msyukri807@gmail.com)'
      }
    });
    const elements = response.data.elements;

    if (!elements || elements.length === 0) {
      console.log("Tidak ada data TPS yang ditemukan dari OSM.");
      return;
    }

    console.log(`Ditemukan ${elements.length} lokasi TPS. Memproses data...`);

    let insertedCount = 0;

    for (const el of elements) {
      // Pastikan memiliki latitude dan longitude
      if (el.lat && el.lon) {
        // Nama TPS fallback ke ID node jika tidak ada tag nama
        const nama_tps = el.tags && el.tags.name ? el.tags.name : `TPS OSM Node ${el.id}`;
        
        // Cek apakah TPS sudah ada dengan koordinat yang sama (menghindari duplikasi)
        const exists = await TPS.findOne({
          "location.coordinates": [el.lon, el.lat]
        });

        if (!exists) {
          await TPS.create({
            nama_tps,
            deskripsi: "Data otomatis dari OpenStreetMap",
            location: {
              type: "Point",
              coordinates: [el.lon, el.lat]
            },
            status_terkini: "kosong",
            skor_kepenuhan: 1
          });
          insertedCount++;
        }
      }
    }

    console.log(`Seeding selesai. ${insertedCount} TPS baru berhasil ditambahkan ke database.`);
  } catch (error) {
    console.error("Gagal melakukan seeding dari OSM:", error.message);
  }
};

// Eksekusi mandiri jika dipanggil via node src/utils/overpass.js
if (require.main === module) {
  require("dotenv").config();
  mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb+srv://admin:admin@cluster0.mongodb.net/trashid")
    .then(async () => {
      console.log("MongoDB Terhubung");
      await exports.seedTPSFromOSM();
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
