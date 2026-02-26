// src/routes/complaintRoutes.js
const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const protect = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');

// Public endpoint (citizens can file complaints without auth)
router.post('/create', complaintController.createComplaint);

// Admin endpoints (protected)
router.get('/', protect, roleGuard('ADMIN'), complaintController.getComplaints);
router.put('/:id/resolve', protect, roleGuard('ADMIN'), complaintController.resolveComplaint);

module.exports = router;
