const express = require('express');
const router = express.Router();
const codingController = require('../controllers/codingController');
const authMiddleware = require('../middleware/authMiddleware');

// All coding endpoints are protected via JWT auth
router.get('/challenges', authMiddleware, codingController.getChallenges);
router.get('/challenges/:id', authMiddleware, codingController.getChallengeById);
router.post('/run', authMiddleware, codingController.runCode);
router.post('/submit', authMiddleware, codingController.submitCode);

module.exports = router;
