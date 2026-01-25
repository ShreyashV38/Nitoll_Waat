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

router.get('/driver/active-route', protect, fleetController.getDriverActiveRoute);
router.post('/driver/generate-route', protect, fleetController.generateOptimizedRoute);
router.post('/driver/ignore-bin', protect, fleetController.ignoreBin);

// NEW: Prediction & Analytics
router.get('/bins/need-collection', protect, fleetController.getBinsNeedingCollection);
router.post('/vehicles/assign', protect, fleetController.assignVehicle);
module.exports = router;