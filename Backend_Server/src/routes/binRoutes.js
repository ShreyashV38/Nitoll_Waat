const express = require('express');
const router = express.Router();
const binController = require('../controllers/binController');
const protect = require('../middleware/authMiddleware');

// Public or Protected (depending on your need)
router.get('/', binController.getAllBins);

// IoT Device Endpoint (No JWT usually, or use API Key)
router.post('/update', binController.updateBinReading);

module.exports = router;