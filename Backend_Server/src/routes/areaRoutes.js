const express = require('express');
const router = express.Router();
const areaController = require('../controllers/areaController');
const protect = require('../middleware/authMiddleware');

router.get('/:id', protect, areaController.getAreaById);

module.exports = router;