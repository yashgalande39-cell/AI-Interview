const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const authMiddleware = require('../../middleware/authMiddleware');

/**
 * Admin-only guard.
 * Phase 2: Reads role from JWT payload (req.user.role) — no extra DB query.
 * Role is stamped into the JWT at login time in auth.controller.js.
 */
const adminOnly = (req, res, next) => {
  const role = req.user?.role;

  if (role === 'admin') {
    return next();
  }

  // Demo mode fallback: allow if IS_DEMO_AUTH is enabled
  const { IS_DEMO_AUTH } = require('../../config/env');
  if (IS_DEMO_AUTH) {
    console.warn(`[Admin] Demo mode: allowing non-admin access for dev testing.`);
    return next();
  }

  return res.status(403).json({ message: 'Forbidden: Admin access only' });
};

// All admin routes require authentication then admin role check
router.use(authMiddleware);
router.use(adminOnly);

router.get('/stats',           adminController.getStats);
router.get('/questions',       adminController.getQuestions);
router.post('/questions',      adminController.addQuestion);
router.delete('/questions/:id', adminController.deleteQuestion);

module.exports = router;
