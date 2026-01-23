const express = require('express');
const router = express.Router();
const fleetController = require('../controllers/fleetController');
const protect = require('../middleware/authMiddleware'); //

router.get('/vehicles', protect, fleetController.getVehicles);
router.get('/routes/active', protect, fleetController.getActiveRoutes);

// NEW ROUTE
router.post('/register', protect, fleetController.registerVehicle);
router.post('/routes/create', protect, fleetController.createRoute);
module.exports = router;