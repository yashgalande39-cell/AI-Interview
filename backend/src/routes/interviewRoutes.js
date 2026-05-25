const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/generate', authMiddleware, interviewController.generateSession);
router.post('/submit-answer', authMiddleware, interviewController.submitAnswer);
router.post('/finish', authMiddleware, interviewController.finishSession);
router.get('/history', authMiddleware, interviewController.getHistory);

module.exports = router;
