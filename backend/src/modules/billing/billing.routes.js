const express = require('express');
const router = express.Router();
const billingController = require('./billing.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const { validate, schemas } = require('../../utils/validate');

// ── Webhook (NO auth, raw body for signature verification) ────────────────────
// MUST be registered BEFORE express.json() body parser is applied.
// In index.js we ensure raw body is available via a custom middleware below.
router.post('/webhook',
  express.raw({ type: 'application/json' }),  // raw body for HMAC verification
  (req, res, next) => {
    // Parse JSON after capturing raw body for signature check
    if (Buffer.isBuffer(req.body)) {
      req.rawBody = req.body;
      try { req.body = JSON.parse(req.body.toString('utf-8')); } catch (e) { req.body = {}; }
    }
    next();
  },
  billingController.handleWebhook
);

// ── Authenticated billing routes ───────────────────────────────────────────────
router.use(authMiddleware);

// GET /api/billing/plans — fetch available subscription plans
router.get('/plans', billingController.getPlans);

// POST /api/billing/create-order — create a Razorpay order
router.post('/create-order', validate(schemas.billing.createOrder), billingController.createOrder);

// POST /api/billing/verify-payment — verify Razorpay signature and activate plan
router.post('/verify-payment', validate(schemas.billing.verifyPayment), billingController.verifyPayment);

// GET /api/billing/subscription — get current user's subscription details
router.get('/subscription', billingController.getSubscription);

// POST /api/billing/cancel — cancel subscription
router.post('/cancel', billingController.cancelSubscription);

// GET /api/billing/history — get user payment history
router.get('/history', billingController.getPaymentHistory);

module.exports = router;
