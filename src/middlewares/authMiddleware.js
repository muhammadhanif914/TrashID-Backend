const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({
        status: "fail",
        message: "Akses ditolak. Token tidak ditemukan.",
      });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "trashid_super_secret_key"
    );
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res
        .status(401)
        .json({ status: "fail", message: "User tidak temukan." });
    }
    next();
  } catch (error) {
    res.status(401).json({ status: "fail", message: "Token tidak valid" });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};