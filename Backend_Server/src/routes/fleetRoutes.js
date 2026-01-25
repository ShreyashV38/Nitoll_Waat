const express = require('express');
const router = express.Router();
const fleetController = require('../controllers/fleetController');
const protect = require('../middleware/authMiddleware'); //

router.get('/vehicles', protect, fleetController.getVehicles);
router.get('/routes/active', protect, fleetController.getActiveRoutes);

// NEW ROUTE
router.post('/register', protect, fleetController.registerVehicle);
router.post('/routes/create', protect, fleetController.createRoute);
router.patch('/routes/:id/cancel', protect, fleetController.cancelRoute);
router.post('/routes/auto-dispatch', protect, fleetController.generateAutoRoutes);

router.get('/driver/active', protect, fleetController.getDriverActiveRoute);

router.post('/routes/generate', protect, fleetController.generateOptimizedRoute);
router.post('/bins/ignore', protect, fleetController.ignoreBin);
module.exports = router;