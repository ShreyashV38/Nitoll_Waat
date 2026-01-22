const express = require('express');
const router = express.Router();
const wardController = require('../controllers/wardController');
const protect = require('../middleware/authMiddleware');

router.get('/', protect, wardController.getWards);
router.post('/', protect, wardController.createWard);

module.exports = router;