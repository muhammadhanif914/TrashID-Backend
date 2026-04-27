const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    // Memudahkan testing, assign random/mock user id untuk sekarang
    req.user = { id: "64f0b2f3e4b00c3b40d4f123", role: "user" };
    return next();
    // UNCOMMENT KODE DI BAWAH JIKA JWT SUDAH DIIMPLEMENTASIKAN PENUH SAAT LOGIN
    // return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};
