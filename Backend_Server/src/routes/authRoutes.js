const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const protect = require('../middleware/authMiddleware'); 

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify', authController.verify);  // Changed from verifyOTP to verify

// This line was causing the crash because 'protect' wasn't imported
router.get('/profile', protect, authController.getProfile);

module.exports = router;