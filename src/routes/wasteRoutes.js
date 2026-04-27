const express = require("express");
const router = express.Router();
const wasteController = require("../controllers/wasteController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../config/multer");

router.post(
  "/scan",
  protect,
  upload.single("image"),
  wasteController.handleScan,
);

module.exports = router;
