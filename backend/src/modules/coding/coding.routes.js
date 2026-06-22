const express = require('express');
const router = express.Router();
const codingController = require('./coding.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const { requirePlan } = require('../../middleware/planMiddleware');

// Protect all coding endpoints with authentication and Pro plan gate
router.use(authMiddleware);
router.use(requirePlan('pro'));

router.get('/challenges', codingController.getChallenges);
router.get('/challenges/:id', codingController.getChallengeById);
router.post('/run', codingController.runCode);
router.post('/submit', codingController.submitCode);

module.exports = router;
