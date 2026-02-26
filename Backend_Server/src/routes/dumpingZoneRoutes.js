const express = require('express');
const router = express.Router();
const dumpingZoneController = require('../controllers/dumpingZoneController');
const protect = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');

router.get('/', protect, dumpingZoneController.getZones);
router.post('/create', protect, roleGuard('ADMIN'), dumpingZoneController.createZone);

module.exports = router;