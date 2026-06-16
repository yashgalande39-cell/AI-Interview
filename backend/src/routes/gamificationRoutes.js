const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const authMiddleware = require('../middleware/authMiddleware');
const { requirePlan } = require('../middleware/planMiddleware');

// Authenticate all gamification routes
router.use(authMiddleware);

// Free-accessible progress routes
router.get('/challenges', gamificationController.getChallenges);
router.post('/complete-challenge', gamificationController.completeChallenge);

// Pro-gated features
router.get('/leaderboard', requirePlan('pro'), gamificationController.getLeaderboard);
router.get('/aptitude', requirePlan('pro'), gamificationController.getAptitudeQuestions);
router.get('/gd-topic', requirePlan('pro'), gamificationController.getGDTopic);

module.exports = router;
