const express = require('express');
const router = express.Router();
const replayController = require('./replay.controller');
const authMiddleware = require('../../middleware/authMiddleware');

router.use(authMiddleware);

// POST /api/interviews/replay/save — save replay events for a session
router.post('/save', replayController.saveReplay);

// GET /api/interviews/replay/:sessionId — retrieve replay for a session
router.get('/:sessionId', replayController.getReplay);

// GET /api/interviews/replay — list all replays for the current user
router.get('/', replayController.listReplays);

module.exports = router;
