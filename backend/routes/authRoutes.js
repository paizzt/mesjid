const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (memerlukan authentication)
router.get('/profile', authenticate, authController.getProfile);

// Admin only routes
router.get('/users/pending', authenticate, isAdmin, authController.getPendingUsers);
router.get('/users', authenticate, isAdmin, authController.getAllUsers);
router.put('/users/:userId/verify', authenticate, isAdmin, authController.verifyUser);

module.exports = router;
