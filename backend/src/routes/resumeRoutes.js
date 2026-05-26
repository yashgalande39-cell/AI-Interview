const express = require('express');
const router = express.Router();
const multer = require('multer');
const resumeController = require('../controllers/resumeController');
const authMiddleware = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/build', authMiddleware, resumeController.buildResume);
router.post('/analyze', authMiddleware, resumeController.analyzeResume);
router.post('/upload', authMiddleware, upload.single('resume'), resumeController.uploadResume);
router.get('/', authMiddleware, resumeController.getUserResumes);

module.exports = router;
