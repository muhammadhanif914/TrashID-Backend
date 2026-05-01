const express = require('express');
const router = express.Router();
const { createReport, getReports, verifyReport } = require('../controllers/reportController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

router.post('/', protect, upload.single('image'), createReport);
router.get('/', protect, getReports);
router.patch('/:id/verify', protect, adminOnly, verifyReport);

module.exports = router;