const express = require('express');
const router = express.Router();
const { getTPUs, createTPU, updateTPU } = require('../controllers/tpuController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.get('/', getTPUs);
router.post('/', protect, adminOnly, createTPU);
router.patch('/:id', protect, adminOnly, updateTPU);

module.exports = router;