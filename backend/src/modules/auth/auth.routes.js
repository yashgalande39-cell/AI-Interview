const express = require('express');
const router = express.Router();
const auth = require('./auth.controller');
const authMiddleware = require('../../middleware/authMiddleware');

router.post('/register',         auth.register);
router.post('/login',            auth.login);
router.post('/google',           auth.googleAuth);
router.get ('/profile',          authMiddleware, auth.getProfile);
router.put ('/profile',          authMiddleware, auth.updateProfile);
router.post('/change-password',  authMiddleware, auth.changePassword);
router.post('/plan',             authMiddleware, auth.updatePlan);
router.post('/progress',         authMiddleware, auth.updateXpAndStreak);
// Legacy chat route — redirects to /api/tresk/chat
router.post('/chat-assistant',   auth.chatAssistant);

module.exports = router;
