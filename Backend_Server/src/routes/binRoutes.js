const express = require('express');
const router = express.Router();
const binController = require('../controllers/binController');
const protect = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');

// Protected Routes (Require Login)
router.get('/', protect, binController.getAllBins);
router.post('/create', protect, roleGuard('ADMIN'), binController.createBin);

// Public / IoT Route (No Token Required for Sensors)
router.post('/update', binController.updateBinReading);


router.post('/:id/collect', protect, binController.markBinCollected);
router.put('/:id/calibration', protect, roleGuard('ADMIN'), binController.updateCalibration);
router.get('/health', protect, roleGuard('ADMIN'), binController.getBinHealth);
module.exports = router;