/**
 * TRESK AI Platform — Razorpay Billing Service
 * Handles order creation, signature verification, and subscription lifecycle.
 *
 * To activate:
 *  1. npm install razorpay
 *  2. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env
 */

const crypto = require('crypto');

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = require('../../config/env');

/** Plan definitions — single source of truth */
const PLANS = {
  free: {
    id: 'free',
    name: 'Starter',
    price: 0,
    currency: 'INR',
    features: [
      '5 mock interviews / month',
      'Basic resume scoring',
      '10 coding challenges / month',
      'Community leaderboard',
    ],
    limits: { interviews: 5, coding: 10, resumes: 1 },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 49900,         // ₹499/month in paise
    currency: 'INR',
    razorpayPlanId: process.env.RAZORPAY_PRO_PLAN_ID || '',
    features: [
      'Unlimited mock interviews',
      'TRESK AI Career Copilot',
      'Full ATS resume analysis',
      'Daily coding challenges + weekly contests',
      'Interview replay & heat-maps',
      'Company-specific prep tracks',
    ],
    limits: { interviews: -1, coding: -1, resumes: 10 },
  },
  teams: {
    id: 'teams',
    name: 'Teams',
    price: 199900,        // ₹1999/month in paise
    currency: 'INR',
    razorpayPlanId: process.env.RAZORPAY_TEAMS_PLAN_ID || '',
    features: [
      'Everything in Pro',
      'Up to 25 team members',
      'Admin dashboard & analytics',
      'Custom company branding',
      'Priority support',
    ],
    limits: { interviews: -1, coding: -1, resumes: 50, members: 25 },
  },
};

// ---------------------------------------------------------------------------
// Lazily initialise Razorpay only when the keys are present
// ---------------------------------------------------------------------------
let razorpayInstance = null;
function getRazorpay() {
  if (razorpayInstance) return razorpayInstance;
  try {
    const Razorpay = require('razorpay'); // optional dep — install when ready
    razorpayInstance = new Razorpay({
      key_id:     RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
    return razorpayInstance;
  } catch {
    return null; // package not installed yet
  }
}

// ---------------------------------------------------------------------------
// Service methods
// ---------------------------------------------------------------------------

/**
 * Returns public-safe plan metadata (no secret plan IDs).
 */
exports.getPlansData = () =>
  Object.values(PLANS).map(({ razorpayPlanId: _, ...p }) => p);

/**
 * Creates a Razorpay order for a one-time payment.
 * Falls back to a simulated order when Razorpay is not configured.
 */
exports.createOrder = async (planId) => {
  const plan = PLANS[planId];
  if (!plan || plan.price === 0) throw new Error('Invalid plan for order creation');

  const rp = getRazorpay();
  if (!rp) {
    // Stub: return a deterministic fake order (dev/demo mode)
    // Plan is encoded in the order ID: order_demo_<plan>_<timestamp>
    return {
      id:       `order_demo_${planId}_${Date.now()}`,
      amount:   plan.price,
      currency: plan.currency,
      receipt:  `receipt_${Date.now()}`,
      status:   'created',
      demo:     true,
      notes:    { plan: planId },
    };
  }

  const order = await rp.orders.create({
    amount:   plan.price,
    currency: plan.currency,
    receipt:  `tresk_${planId}_${Date.now()}`,
    notes:    { plan: planId },  // plan stored in notes for server-side verification
  });
  return order;
};

/**
 * Fetches an existing Razorpay order by ID.
 * Used server-side to derive the plan from order.notes without trusting the client.
 */
exports.fetchOrder = async (orderId) => {
  const rp = getRazorpay();
  if (!rp) throw new Error('Razorpay is not configured');
  return rp.orders.fetch(orderId);
};

/**
 * Verifies Razorpay payment signature (HMAC-SHA256).
 * Returns true if the signature is valid.
 */
exports.verifySignature = (orderId, paymentId, signature) => {
  const body      = `${orderId}|${paymentId}`;
  const expected  = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expected === signature;
};

exports.PLANS = PLANS;
