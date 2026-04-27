const express = require("express");
const router = express.Router();
const tpuController = require("../controllers/tpuController");
const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/roleMiddleware");

router.get("/", tpuController.getTPU);
// Update status TPU hanya boleh oleh admin
router.patch("/:id", protect, adminOnly, tpuController.updateTPU);

module.exports = router;
