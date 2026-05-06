const authService = require("../services/authService");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.register = async (req, res) => {
  try {
    const { fullName, username, email, password, phone, address } = req.body;

    // Basic Validation
    if (!fullName || !username || !email || !password || !phone || !address) {
      return res
        .status(400)
        .json({ status: "fail", message: "Semua kolom wajib diisi" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ status: "fail", message: "Password minimal 6 karakter" });
    }

    const result = await authService.registerUser({
      fullName,
      username,
      email,
      password,
      phone,
      address,
    });
    res.status(201).json({ status: "success", data: result });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res
        .status(400)
        .json({ status: "fail", message: "Email dan OTP wajib diisi" });
    }

    const result = await authService.verifyOtp(email, String(otp));
    res.status(200).json({
      status: "success",
      message: "Verifikasi berhasil, akun telah aktif",
      data: result,
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ status: "fail", message: "Email wajib diisi" });
    }

    const { message } = await authService.resendVerificationOtp(email);
    res.status(200).json({ status: "success", message });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "fail", message: "Email dan password wajib diisi" });
    }

    const result = await authService.loginUser(email, password, rememberMe);
    res.status(200).json({
      status: "success",
      message: "Login berhasil",
      data: result,
    });
  } catch (error) {
    res.status(401).json({ status: "error", message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ status: "fail", message: "Email wajib diisi" });
    }

    const { message } = await authService.forgotPassword(email);
    res.status(200).json({ status: "success", message });
  } catch (error) {
    res.status(404).json({ status: "error", message: error.message });
  }
};

exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res
        .status(400)
        .json({ status: "fail", message: "Email dan OTP wajib diisi" });
    }

    const result = await authService.verifyResetOtp(email, String(otp));
    res.status(200).json({ status: "success", message: result.message });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({
          status: "fail",
          message: "Email, OTP, dan password baru wajib diisi",
        });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ status: "fail", message: "Password baru minimal 6 karakter" });
    }

    const { message } = await authService.resetPassword(
      email,
      String(otp),
      newPassword,
    );
    res.status(200).json({ status: "success", message });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { credential, email, fullName, googleId, profilePicture } = req.body;
    
    let finalData;

    if (email && fullName && googleId) {
      // Data profil dikirim langsung dari frontend (setelah verifikasi access_token)
      finalData = { email, fullName, googleId, profilePicture };
    } else if (credential) {
      // Verifikasi Token ke Google API (jika menggunakan ID Token)
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) throw new Error("Gagal mengambil data dari Google");
      
      finalData = {
        email: payload.email,
        fullName: payload.name,
        googleId: payload.sub,
        profilePicture: payload.picture
      };
    } else {
      return res.status(400).json({ status: "fail", message: "Data Google tidak lengkap" });
    }

    const result = await authService.googleLogin(finalData);

    res.status(200).json({
      status: "success",
      message: "Login Google berhasil",
      data: result,
    });
  } catch (error) {
    res.status(401).json({ status: "error", message: "Verifikasi Google Gagal: " + error.message });
  }
};
