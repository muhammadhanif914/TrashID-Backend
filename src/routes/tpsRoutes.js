const express = require("express");
const router = express.Router();
const tpsController = require("../controllers/tpsController");
const { protect } = require("../middlewares/authMiddleware");
const uploadCloud = require("../config/cloudinary");

// GET /api/tps
router.get("/", tpsController.getAllTPS);

// POST /api/tps (Admin)
router.post("/", protect, tpsController.createTPS);

// GET /api/tps/nearby
router.get("/nearby", tpsController.getNearbyTPS);

// POST /api/tps/report (Dengan Error Handling Multer)
router.post(
  "/report",
  protect,
  (req, res, next) => {
    uploadCloud.single("foto")(req, res, (err) => {
      if (err) {
        console.error("CLOUDINARY_UPLOAD_ERROR:", err);
        return res.status(500).json({ 
          status: "error", 
          message: "Gagal mengunggah foto. Pastikan koneksi internet stabil dan konfigurasi Cloudinary di .env sudah benar.",
          detail: err.message 
        });
      }
      next();
    });
  },
  tpsController.submitReport
);

// GET /api/tps/reports
router.get("/reports", protect, tpsController.getAllReports);

// GET /api/tps/my-reports
router.get("/my-reports", protect, tpsController.getMyReports);

// PATCH /api/tps/reports/:id/status
router.patch("/reports/:id/status", protect, tpsController.updateReportStatus);

module.exports = router;
