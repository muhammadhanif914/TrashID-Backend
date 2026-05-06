const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/roleMiddleware");

// Pakai middleware protect & adminOnly
router.use(protect);
router.use(adminOnly);

router.get("/stats", adminController.getDashboardStats);
router.get("/reports", adminController.getAllReports);
router.patch("/report/:id/verify", adminController.verifyReport);
router.patch("/report/:id/reject", adminController.rejectReport);

module.exports = router;
