const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(
      `Error: Gagal tersambung ke MongoDB Atlas karena masalah jaringan/IP di blokir. Server Backend tetap berjalan ('${error.message}')`,
    );
    // process.exit(1); <- KITA KOMENTAR/MATIKAN INI AGAR SERVER TIDAK CRASH
  }
};

module.exports = connectDB;
