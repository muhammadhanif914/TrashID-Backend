const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Secret Key untuk JWT (Sebaiknya taruh di .env)
const JWT_SECRET = process.env.JWT_SECRET || "trashid_super_secret_key";

// Konfigurasi Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Email Anda, isi di .env
    pass: process.env.EMAIL_PASS, // App Password Anda, isi di .env
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Fungsi bantuan untuk kirim email
const sendEmailOTP = async (to, subject, htmlContent) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || "TrashID App",
      to,
      subject,
      html: htmlContent,
    });
    console.log(`Email OTP terkirim ke ${to}`);
  } catch (error) {
    console.error(`Gagal mengirim email OTP ke ${to}:`, error.message);
  }
};

// Fungsi bantuan untuk generate angka OTP 6 digit
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.registerUser = async (data) => {
  const { fullName, username, email, password, phone, address } = data;

  // 1. Cek apakah user sudah ada
  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    throw new Error("Email atau Username sudah terdaftar");
  }

  // Create User dan set langsung terverifikasi (tanpa OTP)
  const user = await User.create({
    fullName,
    username,
    email,
    password,
    phone,
    address,
    isVerified: true,
  });

  // Generate token langsung agar pengguna dapat login otomatis jika diinginkan
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: "1d",
  });

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
    message: "Registrasi berhasil. Anda sudah bisa login.",
  };
};

// Verifikasi OTP untuk alur reset password (tidak mengubah status isVerified)
exports.verifyResetOtp = async (email, otp) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User tidak ditemukan");

  // Pastikan ada OTP yang dikirim (misal oleh forgotPassword)
  if (!user.otpCode || !user.otpExpiresAt) {
    throw new Error(
      "Sesi verifikasi tidak valid. Mohon lakukan permintaan ulang OTP.",
    );
  }

  if (user.otpExpiresAt < new Date()) {
    throw new Error(
      "Kode OTP sudah kedaluwarsa. Silakan minta ulang melalui lupa password",
    );
  }

  const isMatch = await user.compareOtp(otp);
  if (!isMatch) throw new Error("Kode OTP salah");

  return {
    message:
      "Verifikasi OTP berhasil. Silakan lanjutkan untuk mengganti password.",
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
    // Otomatis generate dan kirim ulang OTP jika kedaluwarsa
    const newOtp = generateOTP();
    const hashedOtp = await bcrypt.hash(newOtp, 10);
    user.otpCode = hashedOtp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60000); // 5 Menit
    await user.save();

    await sendEmailOTP(
      email,
      "TrashID - Kode OTP Baru (Kedaluwarsa)",
      `<p>Halo,</p>
       <p>Karena kode OTP sebelumnya telah kedaluwarsa, kami telah membuatkan kode baru untuk Anda:</p>
       <h2>${newOtp}</h2>
       <p>Kode ini berlaku untuk 5 menit. Segera masukkan kode ini pada halaman verifikasi.</p>`,
    );

    throw new Error(
      "Kode OTP sudah kedaluwarsa. Kami telah otomatis mengirimkan OTP baru ke email Anda.",
    );
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
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
};

exports.resendVerificationOtp = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Pengguna tidak ditemukan");

  if (user.isVerified) {
    throw new Error("Akun ini sudah terverifikasi, silakan langsung login");
  }

  // Generate OTP Baru
  const otp = generateOTP();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const otpExpires = new Date(Date.now() + 5 * 60000); // Aktif 5 Menit

  // Update data user
  user.otpCode = hashedOtp;
  user.otpExpiresAt = otpExpires;
  await user.save();

  // Kirim Email OTP menggunakan Nodemailer
  await sendEmailOTP(
    email,
    "TrashID - Kode OTP Baru (Resend)",
    `<p>Halo,</p>
     <p>Anda baru saja meminta pengiriman ulang OTP untuk aktivasi akun TrashID Anda.</p>
     <h2>${otp}</h2>
     <p>Kode ini berlaku untuk 5 menit. Segera verifikasi akun Anda.</p>`,
  );

  return {
    message: "Kode OTP baru berhasil dikirim ke email",
  };
};

exports.loginUser = async (email, password, rememberMe) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Email atau password salah");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error("Email atau password salah");

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
      role: user.role,
    },
  };
};

exports.forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Pengguna dengan email ini tidak ditemukan");

  // Generate OTP
  const otp = generateOTP();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const otpExpires = new Date(Date.now() + 5 * 60000); // Aktif 5 Menit

  // Simpan OTP ke user
  user.otpCode = hashedOtp;
  user.otpExpiresAt = otpExpires;
  await user.save();

  // Kirim Email OTP untuk reset password
  await sendEmailOTP(
    email,
    "TrashID - Kode OTP Reset Password",
    `<p>Halo,</p>
     <p>Anda baru saja meminta reset password untuk akun TrashID Anda.</p>
     <p>Gunakan kode OTP berikut untuk me-reset password Anda:</p>
     <h2>${otp}</h2>
     <p>Kode ini berlaku dalam 5 menit. Abaikan pesan ini jika Anda tidak merasa memintanya.</p>`,
  );

  return {
    message: "Kode OTP untuk reset password telah dikirim ke email",
  };
};

exports.resetPassword = async (email, otp, newPassword) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Pengguna tidak ditemukan");

  // Cek apakah akun memiliki OTP aktif yang dipicu reset password
  if (!user.otpCode || !user.otpExpiresAt) {
    throw new Error("Sesi reset password tidak valid atau belum dimulai");
  }

  // Cek apakah OTP kedaluwarsa
  if (user.otpExpiresAt < new Date()) {
    throw new Error(
      "Kode OTP sudah kedaluwarsa, silakan minta ulang melalui lupa password",
    );
  }

  // Cocokkan OTP
  const isMatch = await user.compareOtp(otp);
  if (!isMatch) throw new Error("Kode OTP salah");

  // Update password baru & bersihkan kolom OTP
  user.password = newPassword;
  user.otpCode = null;
  user.otpExpiresAt = null;
  await user.save();

  return {
    message: "Password berhasil diubah. Silakan login dengan password baru.",
  };
};
