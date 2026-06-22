const billingService = require('./razorpay.service');
const mockDb = require('../../models/mockDb');

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

    // Demo mode: accept orders with demo_ prefix without signature check
    const isDemoOrder = orderId.startsWith('order_demo_');
    const isValid = isDemoOrder || billingService.verifySignature(orderId, paymentId, signature);

    if (!isValid) {
      return res.status(400).json({ message: 'Payment signature verification failed' });
    }

    // Activate the plan for the user
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month subscription

    const updatedUser = mockDb.users.updateOne(
      { id: userId },
      {
        plan,
        subscriptionId: paymentId,
        planActivatedAt: new Date().toISOString(),
        planExpiresAt: expiresAt.toISOString(),
      }
    );

    const { password: _, ...userWithoutPassword } = updatedUser;
    return res.status(200).json({
      message: `${plan.charAt(0).toUpperCase() + plan.slice(1)} plan activated successfully! 🎉`,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error('Verify Payment Error:', err.message);
    return res.status(500).json({ message: 'Payment verification failed' });
  }
};

// GET /api/billing/subscription
exports.getSubscription = (req, res) => {
  const userId = req.user.userId;
  const user = mockDb.users.findOne({ id: userId });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const plans = billingService.PLANS;
  const currentPlan = plans[user.plan] || plans.free;

  return res.status(200).json({
    plan: user.plan || 'free',
    planName: currentPlan.name,
    activatedAt: user.planActivatedAt || null,
    expiresAt: user.planExpiresAt || null,
    limits: currentPlan.limits,
  });
};

// POST /api/billing/cancel
exports.cancelSubscription = (req, res) => {
  const userId = req.user.userId;
  const user = mockDb.users.findOne({ id: userId });
  if (!user) return res.status(404).json({ message: 'User not found' });

  mockDb.users.updateOne({ id: userId }, { plan: 'free', subscriptionId: null, planExpiresAt: null });
  return res.status(200).json({ message: 'Subscription cancelled. You have been moved to the Free plan.' });
};
