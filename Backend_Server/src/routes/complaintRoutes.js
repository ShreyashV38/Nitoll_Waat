// src/routes/complaintRoutes.js
const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const protect = require('../middleware/authMiddleware');

// Public endpoint (citizens can file complaints without auth)
router.post('/create', complaintController.createComplaint);

// Admin endpoints (protected)
router.get('/', protect, complaintController.getComplaints);
router.put('/:id/resolve', protect, complaintController.resolveComplaint);

module.exports = router;
