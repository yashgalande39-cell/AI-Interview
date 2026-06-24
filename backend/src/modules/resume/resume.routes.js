const express = require('express');
const router = express.Router();
const multer = require('multer');
const resumeController = require('./resume.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const { requirePlan } = require('../../middleware/planMiddleware');

// Allowed MIME types for resume uploads
const ALLOWED_MIME_TYPES = ['application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB cap
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'), false);
    }
  }
});

// Protect all resume endpoints with authentication and Pro plan gate
router.use(authMiddleware);
router.use(requirePlan('pro'));

router.post('/build', resumeController.buildResume);
router.post('/analyze', resumeController.analyzeResume);
router.post('/upload', upload.single('resume'), resumeController.uploadResume);
router.get('/', resumeController.getUserResumes);

module.exports = router;
