// src/routes/publicRoutes.js
const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Location Dropdown Routes
router.get('/districts', publicController.getDistricts);
router.get('/talukas', publicController.getTalukas);
router.get('/areas', publicController.getAreas);

// Data Display Route
router.get('/data/:area_id', publicController.getAreaPublicData);

module.exports = router;