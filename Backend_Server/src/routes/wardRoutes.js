const express = require('express');
const router = express.Router();
const wardController = require('../controllers/wardController');
const protect = require('../middleware/authMiddleware');

// Manage Wards
router.get('/', protect, wardController.getWards);
router.post('/', protect, wardController.createWard);
router.get('/stats', protect, wardController.getWardStats);
module.exports = router;