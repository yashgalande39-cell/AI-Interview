const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/build', authMiddleware, resumeController.buildResume);
router.post('/analyze', authMiddleware, resumeController.analyzeResume);

module.exports = router;
