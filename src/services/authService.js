const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Secret Key untuk JWT (Sebaiknya taruh di .env)
const JWT_SECRET = process.env.JWT_SECRET || "trashid_super_secret_key";

// Fungsi bantuan untuk generate angka OTP 6 digit
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.registerUser = async (data) => {
  const { fullName, username, email, password } = data;

  // 1. Cek apakah user sudah ada
  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    throw new Error("Email atau Username sudah terdaftar");
  }

  // 2. Generate OTP
  const otp = generateOTP();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const otpExpires = new Date(Date.now() + 5 * 60000); // Aktif 5 Menit

  // 3. Create User dengan status isVerified: false
  const user = await User.create({
    fullName,
    username,
    email,
    password,
    otpCode: hashedOtp,
    otpExpiresAt: otpExpires,
  });

  // 4. MOCK KIRIM EMAIL: Di sistem nyata, gunakan Nodemailer di sini.
  console.log(
    `\n\n=== MOCK EMAIL SENDER ===\nKirim ke: ${email}\nKode OTP Anda: ${otp}\n=========================\n\n`,
  );

  return {
    userId: user._id,
    email: user.email,
    message: "Registrasi berhasil. Silakan cek email untuk kode OTP.",
  };
};

exports.verifyOtp = async (email, otp) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User tidak ditemukan");

  // Cek apakah akun sudah aktif
  if (user.isVerified)
    throw new Error("Akun ini sudah terverifikasi sebelumnya");

  // Cek apakah OTP kedaluwarsa
  if (user.otpExpiresAt < new Date()) {
    throw new Error("Kode OTP sudah kedaluwarsa, silakan minta ulang");
  }

  // Cocokkan OTP
  const isMatch = await user.compareOtp(otp);
  if (!isMatch) throw new Error("Kode OTP salah");

  // Ubah status user & bersihkan kolom OTP
  user.isVerified = true;
  user.otpCode = null;
  user.otpExpiresAt = null;
  await user.save();

  // Generate First API Token
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: "1d",
  });

  return {
    token,
    user: { id: user._id, username: user.username, email: user.email },
  };
};

exports.loginUser = async (email, password, rememberMe) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Email atau password salah");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error("Email atau password salah");

  if (!user.isVerified) {
    throw new Error(
      "Akun belum diverifikasi. Silakan masukkan kode OTP Anda terlebih dahulu",
    );
  }

  // Tentukan lama token berdasarkan "Ingat Saya" (1 bulan vs 1 hari)
  const expiresIn = rememberMe ? "30d" : "1d";
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn,
  });

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
    },
  };
};
