/**
 * TRESK AI — Billing Controller (PostgreSQL)
 * =====================================================================
 * Handles Razorpay plan subscription lifecycle, backed by PostgreSQL.
 */

const billingService = require('./razorpay.service');
const { query } = require('../../config/pgDb');

// GET /api/billing/plans
exports.getPlans = (req, res) => {
  return res.status(200).json({ plans: billingService.getPlansData() });
};

// POST /api/billing/create-order
exports.createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!plan || plan === 'free') {
      return res.status(400).json({ message: 'Select a paid plan to create an order' });
    }
    const order = await billingService.createOrder(plan);
    return res.status(200).json({ order, keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_DEMO' });
  } catch (err) {
    console.error('Create Order Error:', err.message);
    return res.status(500).json({ message: err.message || 'Failed to create payment order' });
  }
};

// POST /api/billing/verify-payment
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, plan } = req.body;
    const userId = req.user.userId;

    if (!orderId || !paymentId || !plan) {
      return res.status(400).json({ message: 'Missing payment details' });
    }

    // Demo mode: orders with demo_ prefix bypass signature check
    const isDemoOrder = orderId.startsWith('order_demo_');
    const isValid = isDemoOrder || billingService.verifySignature(orderId, paymentId, signature);

    if (!isValid) {
      return res.status(400).json({ message: 'Payment signature verification failed' });
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    // Update user plan in PostgreSQL
    const updatedResult = await query(`
      UPDATE users
      SET plan = $1,
          subscription_id = $2,
          plan_activated_at = NOW(),
          plan_expires_at = $3
      WHERE id = $4
      RETURNING id, name, email, plan, plan_activated_at, plan_expires_at, xp, streak, badges, avatar
    `, [plan, paymentId, expiresAt.toISOString(), userId]);

    // Record payment in payments table
    try {
      await query(`
        INSERT INTO payments (user_id, razorpay_order_id, razorpay_payment_id, plan, amount_paise, status, paid_at)
        VALUES ($1, $2, $3, $4, $5, 'paid', NOW())
        ON CONFLICT (razorpay_order_id) DO UPDATE SET
          razorpay_payment_id = EXCLUDED.razorpay_payment_id,
          status = 'paid',
          paid_at = NOW()
      `, [userId, orderId, paymentId, plan, billingService.PLANS[plan]?.price || 0]);
    } catch (logErr) {
      // Non-fatal — log only
      console.warn('Payment log insert failed:', logErr.message);
    }

    const user = updatedResult.rows[0];
    return res.status(200).json({
      message: `${plan.charAt(0).toUpperCase() + plan.slice(1)} plan activated! 🎉`,
      user,
    });
  } catch (err) {
    console.error('Verify Payment Error:', err.message);
    return res.status(500).json({ message: 'Payment verification failed' });
  }
};

// GET /api/billing/subscription
exports.getSubscription = async (req, res) => {
  try {
    const result = await query(
      'SELECT plan, plan_activated_at, plan_expires_at, subscription_id FROM users WHERE id = $1',
      [req.user.userId]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });

    const plans = billingService.PLANS;
    const currentPlan = plans[user.plan] || plans.free;

    return res.status(200).json({
      plan: user.plan || 'free',
      planName: currentPlan.name,
      activatedAt: user.plan_activated_at || null,
      expiresAt: user.plan_expires_at || null,
      limits: currentPlan.limits,
    });
  } catch (err) {
    console.error('Get Subscription Error:', err);
    return res.status(500).json({ message: 'Failed to fetch subscription' });
  }
};

// POST /api/billing/cancel
exports.cancelSubscription = async (req, res) => {
  try {
    await query(
      "UPDATE users SET plan = 'free', subscription_id = NULL, plan_expires_at = NULL WHERE id = $1",
      [req.user.userId]
    );
    return res.status(200).json({ message: 'Subscription cancelled. Moved to Free plan.' });
  } catch (err) {
    console.error('Cancel Subscription Error:', err);
    return res.status(500).json({ message: 'Failed to cancel subscription' });
  }
};
