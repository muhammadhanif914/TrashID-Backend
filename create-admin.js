const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Terhubung ke MongoDB...");

    const adminEmail = "admin@trashid.com";
    
    // Hapus jika sudah ada (agar bersih)
    await User.deleteOne({ email: adminEmail });

    const admin = new User({
      fullName: "Administrator TrashID",
      username: "admin_trashid",
      email: adminEmail,
      password: "password123", // Ini akan di-hash otomatis oleh model User
      role: "admin",
      isVerified: true
    });

    await admin.save();
    console.log("SUKSES: Akun Admin berhasil dibuat!");
    console.log("Email: admin@trashid.com");
    console.log("Password: password123");
    
    process.exit(0);
  } catch (error) {
    console.error("GAGAL membuat admin:", error);
    process.exit(1);
  }
}

createAdmin();
