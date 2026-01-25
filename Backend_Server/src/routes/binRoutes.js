const express = require('express');
const router = express.Router();
const binController = require('../controllers/binController');
const protect = require('../middleware/authMiddleware');

// Protected Routes (Require Login)
router.get('/', protect, binController.getAllBins);
router.post('/create', protect, binController.createBin);

// Public / IoT Route (No Token Required for Sensors)
router.post('/update', binController.updateBinReading);


router.post('/:id/collect', protect, binController.markBinCollected);
module.exports = router;