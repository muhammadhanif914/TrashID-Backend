const express = require("express");
const router = express.Router();
const tpsController = require("../controllers/tpsController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../config/multer");

// GET /api/tps
router.get("/", tpsController.getAllTPS);

// GET /api/tps/nearby?lat=...&lng=...&radius=...
router.get("/nearby", tpsController.getNearbyTPS);

// POST /api/tps/report
router.post(
  "/report",
  protect,
  upload.single("foto"),
  tpsController.submitReport
);

module.exports = router;
