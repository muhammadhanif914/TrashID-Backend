require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./src/models/User"); // Pastikan path model User benar

async function createAdmin() {
  try {
    console.log("Menghubungkan ke database...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Terhubung!");

    const adminEmail = "admin@trashid.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Akun Admin sudah ada!");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const adminUser = new User({
      fullName: "Administrator TrashID",
      username: "admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      xp: 999
    });

    await adminUser.save();
    console.log("------------------------------------------");
    console.log("BERHASIL: Akun Admin telah dibuat!");
    console.log("Email    : admin@trashid.com");
    console.log("Password : admin123");
    console.log("------------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("Gagal membuat admin:", error);
    process.exit(1);
  }
}

createAdmin();
