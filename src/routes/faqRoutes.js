const express = require("express");
const router = express.Router();
const faqController = require("../controllers/faqController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

// Route Publik (User bisa melihat FAQ)
router.get("/", faqController.getAllFAQs);

// Route Terproteksi (Hanya Admin yang bisa mengelola FAQ)
router.post("/", protect, adminOnly, faqController.createFAQ);
router.put("/:id", protect, adminOnly, faqController.updateFAQ);
router.delete("/:id", protect, adminOnly, faqController.deleteFAQ);

module.exports = router;
