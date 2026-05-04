const express = require('express');
const router = express.Router();
const { getProfile, addXp, updateProfile, getAllUsers } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const uploadCloud = require('../config/cloudinary');

router.get('/profile', protect, getProfile);
router.patch('/profile', protect, uploadCloud.single('profilePicture'), updateProfile);
router.patch('/xp', protect, addXp);

// GET /api/users (Admin)
router.get('/', protect, getAllUsers);

module.exports = router;