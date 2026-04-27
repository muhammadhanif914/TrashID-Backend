const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../config/multer");

router.post(
  "/",
  protect,
  upload.single("image"),
  reportController.createReport,
);
router.get("/", protect, reportController.getReports);

module.exports = router;
