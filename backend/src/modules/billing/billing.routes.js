const express = require('express');
const router = express.Router();
const billingController = require('./billing.controller');
const authMiddleware = require('../../middleware/authMiddleware');

// All billing routes require authentication
router.use(authMiddleware);

// GET /api/billing/plans — fetch available subscription plans
router.get('/plans', billingController.getPlans);

// POST /api/billing/create-order — create a Razorpay order
router.post('/create-order', billingController.createOrder);

// POST /api/billing/verify-payment — verify Razorpay signature and activate plan
router.post('/verify-payment', billingController.verifyPayment);

// GET /api/billing/subscription — get current user's subscription details
router.get('/subscription', billingController.getSubscription);

// POST /api/billing/cancel — cancel subscription
router.post('/cancel', billingController.cancelSubscription);

module.exports = router;
