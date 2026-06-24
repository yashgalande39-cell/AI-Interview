const express = require('express');
const router = express.Router();
const auth = require('./auth.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const { validate, schemas } = require('../../utils/validate');

// ── Public routes ─────────────────────────────────────────────────────────────
router.post('/register',         validate(schemas.auth.register),       auth.register);
router.post('/login',            validate(schemas.auth.login),          auth.login);
router.post('/google',           validate(schemas.auth.googleAuth),     auth.googleAuth);
router.post('/forgot-password',  validate(schemas.auth.forgotPassword), auth.forgotPassword);
router.post('/reset-password',   validate(schemas.auth.resetPassword),  auth.resetPassword);
router.get ('/verify-email',                                            auth.verifyEmail);

// ── Token management (public — use refresh cookie, no access token needed) ────
router.post('/refresh',  auth.refreshToken);  // Exchange refresh cookie → new access token
router.post('/logout',   auth.logout);        // Clear cookie + revoke session

// ── Protected routes ──────────────────────────────────────────────────────────
router.get ('/profile',             authMiddleware, auth.getProfile);
router.put ('/profile',             authMiddleware, validate(schemas.auth.updateProfile), auth.updateProfile);
router.post('/change-password',     authMiddleware, validate(schemas.auth.changePassword), auth.changePassword);
router.post('/resend-verification', authMiddleware, auth.resendVerification);
router.post('/plan',                authMiddleware, auth.updatePlan);
router.post('/progress',            authMiddleware, auth.updateXpAndStreak);
router.delete('/account',           authMiddleware, validate(schemas.auth.deleteAccount), auth.deleteAccount);

// Legacy chat route — redirects to /api/tresk/chat
router.post('/chat-assistant', auth.chatAssistant);

module.exports = router;
