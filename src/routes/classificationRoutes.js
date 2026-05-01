const express = require('express');
const router = express.Router();
const { classifyImage } = require('../controllers/classificationController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

router.post('/', protect, upload.single('image'), classifyImage);

module.exports = router;