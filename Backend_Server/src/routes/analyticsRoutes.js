const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const protect = require('../middleware/authMiddleware');

router.get('/waste-stats', protect, analyticsController.getWasteStats);

module.exports = router;