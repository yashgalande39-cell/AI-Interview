/**
 * TRESK AI — Billing Controller (PostgreSQL)
 * =====================================================================
 * Handles Razorpay plan subscription lifecycle, backed by PostgreSQL.
 */

const billingService = require('./razorpay.service');
const { query } = require('../../config/pgDb');
const { IS_DEMO_AUTH, requireDemoMode } = require('../../config/env');

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
    const { orderId, paymentId, signature } = req.body;
    const userId = req.user.userId;

    if (!orderId || !paymentId) {
      return res.status(400).json({ message: 'Missing payment details' });
    }

    const isDemoOrder = IS_DEMO_AUTH && orderId.startsWith('order_demo_');

    // ── SECURITY: Derive plan server-side from order metadata ─────────────────
    // Never trust the plan value submitted from the client.
    let plan;
    if (isDemoOrder) {
      // Demo orders encode plan in the ID: order_demo_<plan>_<timestamp>
      const parts = orderId.split('_');
      plan = parts[2] || 'pro'; // fallback to 'pro' for legacy demo orders
    } else {
      try {
        const orderDetails = await billingService.fetchOrder(orderId);
        plan = orderDetails?.notes?.plan;
      } catch (fetchErr) {
        console.error('[verifyPayment] Failed to fetch order from Razorpay:', fetchErr.message);
        return res.status(400).json({ message: 'Could not verify order details' });
      }
    }

    const validPlans = ['pro', 'teams'];
    if (!plan || !validPlans.includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan in order metadata' });
    }

    const isValid = isDemoOrder || billingService.verifySignature(orderId, paymentId, signature);

    if (!isValid) {
      return res.status(400).json({ message: 'Payment signature verification failed' });
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    let user;
    try {
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
        console.warn('Payment log insert failed:', logErr.message);
      }

      user = updatedResult.rows[0];

      // Send upgrade confirmation email (fire-and-forget)
      const emailService = require('../auth/email.service');
      const planData = billingService.PLANS[plan];
      emailService.sendPlanUpgradeEmail(user.email, user.name, planData?.name || plan, expiresAt)
        .catch(err => console.warn('[verifyPayment] Upgrade email failed:', err.message));

    } catch (dbErr) {
      if (IS_DEMO_AUTH) {
        requireDemoMode('billing.verifyPayment');
        user = {
          id: userId,
          name: 'Test User',
          email: 'user@example.com',
          plan: plan,
          plan_activated_at: new Date().toISOString(),
          plan_expires_at: expiresAt.toISOString(),
          xp: 100,
          streak: 1,
          badges: ['Novice Prep']
        };
      } else {
        console.error('[verifyPayment] Database error:', dbErr);
        return res.status(503).json({ message: 'Service temporarily unavailable' });
      }
    }

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
    let user;
    let dbOffline = false;
    try {
      const result = await query(
        'SELECT plan, plan_activated_at, plan_expires_at, subscription_id FROM users WHERE id = $1',
        [req.user.userId]
      );
      user = result.rows[0];
    } catch (dbErr) {
      dbOffline = true;
      console.warn('Database offline, using getSubscription offline mockup:', dbErr.message);
    }

    const { IS_DEMO_AUTH, requireDemoMode } = require('../../config/env');
    if (dbOffline) {
      if (!IS_DEMO_AUTH) {
        return res.status(503).json({ message: 'Service temporarily unavailable' });
      }
      requireDemoMode('billing.getSubscription');
    }

    const plans = billingService.PLANS;
    const userPlan = user?.plan || (IS_DEMO_AUTH ? 'pro' : 'free');
    const currentPlan = plans[userPlan] || plans.free;

    return res.status(200).json({
      plan: userPlan,
      planName: currentPlan.name,
      activatedAt: user?.plan_activated_at || new Date().toISOString(),
      expiresAt: user?.plan_expires_at || new Date(Date.now() + 30*24*3600*1000).toISOString(),
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
    let dbOffline = false;
    try {
      await query(
        "UPDATE users SET plan = 'free', subscription_id = NULL, plan_expires_at = NULL WHERE id = $1",
        [req.user.userId]
      );
    } catch (dbErr) {
      dbOffline = true;
      console.warn('Database offline, skipping cancel query in cancelSubscription:', dbErr.message);
    }
    const { IS_DEMO_AUTH, requireDemoMode } = require('../../config/env');
    if (dbOffline) {
      if (!IS_DEMO_AUTH) {
        return res.status(503).json({ message: 'Service temporarily unavailable' });
      }
      requireDemoMode('billing.cancelSubscription');
    }
    return res.status(200).json({ message: 'Subscription cancelled. Moved to Free plan.' });
  } catch (err) {
    console.error('Cancel Subscription Error:', err);
    return res.status(500).json({ message: 'Failed to cancel subscription' });
  }
};

// GET /api/billing/history
exports.getPaymentHistory = async (req, res) => {
  try {
    let payments = [];
    try {
      const result = await query(
        'SELECT plan, amount_paise, status, paid_at, created_at, razorpay_order_id, razorpay_payment_id FROM payments WHERE user_id = $1 ORDER BY paid_at DESC NULLS LAST LIMIT 20',
        [req.user.userId]
      );
      payments = result.rows;
    } catch (dbErr) {
      console.warn('[getPaymentHistory] DB error:', dbErr.message);
      const { IS_DEMO_AUTH } = require('../../config/env');
      if (!IS_DEMO_AUTH) {
        return res.status(503).json({ message: 'Service temporarily unavailable' });
      }
    }
    return res.status(200).json({ payments });
  } catch (err) {
    console.error('Get Payment History Error:', err);
    return res.status(500).json({ message: 'Failed to fetch payment history' });
  }
};



// ── POST /api/billing/webhook (Razorpay Webhook) ──────────────────────────────
/**
 * Razorpay sends webhook events here for async payment confirmation.
 * This is the AUTHORITATIVE way to update subscription status — it runs
 * server-side using Razorpay's signature, no client involvement.
 *
 * Setup: In Razorpay Dashboard → Webhooks → Add URL:
 *   https://your-api.com/api/billing/webhook
 * Select events: payment.captured, payment.failed, order.paid
 *
 * Env var: RAZORPAY_WEBHOOK_SECRET (separate from key secret)
 */
exports.handleWebhook = async (req, res) => {
  try {
    const crypto = require('crypto');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn('[Webhook] RAZORPAY_WEBHOOK_SECRET not set — skipping signature verification');
    } else {
      // Verify webhook signature
      const razorpaySignature = req.headers['x-razorpay-signature'];
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (razorpaySignature !== expectedSignature) {
        console.warn('[Webhook] Invalid Razorpay webhook signature');
        return res.status(400).json({ message: 'Invalid webhook signature' });
      }
    }

    const event   = req.body.event;
    const payload = req.body.payload;

    console.log(`[Webhook] Received event: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const payment = payload?.payment?.entity || payload?.order?.entity;
      if (!payment) return res.status(200).json({ status: 'ok' });

      const orderId   = payment.order_id;
      const paymentId = payment.id;
      const notes     = payment.notes || {};
      const plan      = notes.plan;

      const validPlans = ['pro', 'teams'];
      if (!plan || !validPlans.includes(plan)) {
        console.warn(`[Webhook] Unknown plan in payment notes: ${plan}`);
        return res.status(200).json({ status: 'ok' });
      }

      // Find user by looking up the payment record
      const paymentRecord = await query(
        'SELECT user_id FROM payments WHERE razorpay_order_id = $1',
        [orderId]
      );

      if (!paymentRecord.rows[0]) {
        console.warn(`[Webhook] No payment record found for order ${orderId}`);
        return res.status(200).json({ status: 'ok' });
      }

      const userId   = paymentRecord.rows[0].user_id;
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      await query(`
        UPDATE users
        SET plan = $1, subscription_id = $2, plan_activated_at = NOW(), plan_expires_at = $3
        WHERE id = $4
      `, [plan, paymentId, expiresAt.toISOString(), userId]);

      await query(`
        UPDATE payments SET status = 'paid', paid_at = NOW(), razorpay_payment_id = $1
        WHERE razorpay_order_id = $2
      `, [paymentId, orderId]);

      console.log(`[Webhook] ✅ Plan ${plan} activated for user ${userId}`);
    }

    if (event === 'payment.failed') {
      const payment = payload?.payment?.entity;
      if (payment?.order_id) {
        await query(
          "UPDATE payments SET status = 'failed' WHERE razorpay_order_id = $1",
          [payment.order_id]
        ).catch(err => console.warn('[Webhook] Failed to update payment status:', err.message));
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('[Webhook] Error:', err.message);
    // Always return 200 to Razorpay to prevent re-delivery
    return res.status(200).json({ status: 'error', message: err.message });
  }
};
