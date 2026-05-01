const express = require('express');
const router = express.Router();
const { getProfile, addXp, updateProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/profile', protect, getProfile);
router.patch('/profile', protect, updateProfile);
router.patch('/xp', protect, addXp);

module.exports = router;