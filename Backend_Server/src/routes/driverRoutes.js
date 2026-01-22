const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const protect = require('../middleware/authMiddleware');

router.get('/my-route', protect, driverController.getMyRoute);
router.post('/complete-stop', protect, driverController.completeStop);

module.exports = router;