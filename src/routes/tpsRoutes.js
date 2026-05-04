const express = require("express");
const router = express.Router();
const tpsController = require("../controllers/tpsController");
const { protect } = require("../middlewares/authMiddleware");
const uploadCloud = require("../config/cloudinary");

// GET /api/tps
router.get("/", tpsController.getAllTPS);

// POST /api/tps (Admin)
router.post("/", protect, tpsController.createTPS);

// GET /api/tps/nearby?lat=...&lng=...&radius=...
router.get("/nearby", tpsController.getNearbyTPS);

// POST /api/tps/report
router.post(
  "/report",
  protect,
  uploadCloud.single("foto"),
  tpsController.submitReport
);

// GET /api/tps/reports (Admin - currently returns all)
router.get("/reports", protect, tpsController.getAllReports);

// GET /api/tps/my-reports
router.get("/my-reports", protect, tpsController.getMyReports);

// PATCH /api/tps/reports/:id/status (Admin)
router.patch("/reports/:id/status", protect, tpsController.updateReportStatus);

module.exports = router;
