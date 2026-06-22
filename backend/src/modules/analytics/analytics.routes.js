const express = require('express');
const router = express.Router();
const analytics = require('./analytics.controller');
const authMiddleware = require('../../middleware/authMiddleware');

// All analytics routes require authentication
router.use(authMiddleware);

router.get('/readiness', analytics.getReadiness);  // Full AI readiness report
router.get('/stats',     analytics.getStats);      // Dashboard summary stats
router.get('/history',   analytics.getHistory);    // Score history for charts

module.exports = router;
