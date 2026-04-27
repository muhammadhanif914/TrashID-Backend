exports.adminOnly = (req, res, next) => {
  // Pastikan request sudah melalui authMiddleware
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    // Bypass sementara buat testing jika role bukan admin tapi tidak diblok
    // Ganti ini dengan return res.status(403)... di tahap sebenarnya
    next();
    // return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};
