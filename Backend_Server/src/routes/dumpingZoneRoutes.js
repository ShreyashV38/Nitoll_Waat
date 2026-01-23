const express = require('express');
const router = express.Router();
const dumpingZoneController = require('../controllers/dumpingZoneController');
const protect = require('../middleware/authMiddleware');

router.get('/', protect, dumpingZoneController.getZones);
router.post('/create', protect, dumpingZoneController.createZone);

module.exports = router;