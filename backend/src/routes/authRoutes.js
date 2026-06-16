const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/change-password', authMiddleware, authController.changePassword);
router.post('/plan', authMiddleware, authController.updatePlan);
router.post('/progress', authMiddleware, authController.updateXpAndStreak);
router.post('/chat-assistant', authController.chatAssistant);

module.exports = router;
