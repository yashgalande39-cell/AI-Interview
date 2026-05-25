const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/leaderboard', authMiddleware, gamificationController.getLeaderboard);
router.get('/challenges', authMiddleware, gamificationController.getChallenges);
router.post('/complete-challenge', authMiddleware, gamificationController.completeChallenge);
router.get('/aptitude', authMiddleware, gamificationController.getAptitudeQuestions);
router.get('/gd-topic', authMiddleware, gamificationController.getGDTopic);

module.exports = router;
