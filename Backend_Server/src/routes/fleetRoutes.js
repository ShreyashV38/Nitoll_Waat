const express = require('express');
const router = express.Router();
const fleetController = require('../controllers/fleetController');
const protect = require('../middleware/authMiddleware');

// Protected Routes
router.get('/vehicles', protect, fleetController.getVehicles);
router.get('/routes/active', protect, fleetController.getActiveRoutes);

module.exports = router;