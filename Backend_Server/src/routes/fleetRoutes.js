const express = require('express');
const router = express.Router();
const fleetController = require('../controllers/fleetController');
const protect = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');

router.get('/vehicles', protect, roleGuard('ADMIN'), fleetController.getVehicles);
router.get('/routes/active', protect, roleGuard('ADMIN'), fleetController.getActiveRoutes);

// NEW ROUTE
router.post('/register', protect, roleGuard('ADMIN'), fleetController.registerVehicle);
router.post('/routes/create', protect, roleGuard('ADMIN'), fleetController.createRoute);
router.patch('/routes/:id/cancel', protect, roleGuard('ADMIN'), fleetController.cancelRoute);
router.post('/routes/auto-dispatch', protect, roleGuard('ADMIN'), fleetController.generateAutoRoutes);

router.get('/driver/active-route', protect, fleetController.getDriverActiveRoute);
router.post('/driver/generate-route', protect, fleetController.generateOptimizedRoute);
router.post('/driver/ignore-bin', protect, fleetController.ignoreBin);
router.post('/driver/location', protect, fleetController.updateDriverLocation); // Geofencing

// NEW: Prediction & Analytics
router.get('/bins/need-collection', protect, roleGuard('ADMIN'), fleetController.getBinsNeedingCollection);
router.post('/vehicles/assign', protect, roleGuard('ADMIN'), fleetController.assignVehicle);
module.exports = router;