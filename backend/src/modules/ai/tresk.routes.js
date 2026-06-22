const express = require('express');
const router = express.Router();
const treskController = require('./tresk.controller');
const authMiddleware = require('../../middleware/authMiddleware');

// All TRESK AI routes require authentication
router.use(authMiddleware);

// POST /api/tresk/chat — send a message to TRESK Career Copilot
router.post('/chat', treskController.chat);

// POST /api/tresk/analyze-resume — TRESK analyzes a resume for a target role
router.post('/analyze-resume', treskController.analyzeResume);

// POST /api/tresk/dsa-hint — TRESK provides a DSA problem hint
router.post('/dsa-hint', treskController.dsaHint);

// POST /api/tresk/placement-insights — TRESK generates company-specific placement insights
router.post('/placement-insights', treskController.placementInsights);

module.exports = router;
