const express = require('express');
const router = express.Router();
const wardController = require('../controllers/wardController');
const protect = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');

// Manage Wards
router.get('/', protect, roleGuard('ADMIN'), wardController.getWards);
router.post('/', protect, roleGuard('ADMIN'), wardController.createWard);
router.get('/stats', protect, wardController.getWardStats);
module.exports = router;