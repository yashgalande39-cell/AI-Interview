const express = require('express');
const router = express.Router();
const multer = require('multer');
const resumeController = require('../controllers/resumeController');
const authMiddleware = require('../middleware/authMiddleware');
const { requirePlan } = require('../middleware/planMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

// Protect all resume endpoints with authentication and Pro plan gate
router.use(authMiddleware);
router.use(requirePlan('pro'));

router.post('/build', resumeController.buildResume);
router.post('/analyze', resumeController.analyzeResume);
router.post('/upload', upload.single('resume'), resumeController.uploadResume);
router.get('/', resumeController.getUserResumes);

module.exports = router;
