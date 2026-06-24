/**
 * TRESK AI — Plan Enforcement Middleware (PostgreSQL)
 * =====================================================================
 * Verifies the user's current subscription plan before allowing
 * access to gated features. Also enforces plan_expires_at — if a
 * paid plan has expired, the user is automatically downgraded to free.
 *
 * Usage:
 *   router.get('/replay', authMiddleware, requirePlan('pro'), replayController.list);
 */

const { query } = require('../config/pgDb');

const PLAN_LEVEL = {
  free:  0,
  pro:   1,
  teams: 2,
};

const requirePlan = (requiredPlan) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const result = await query(
        'SELECT plan, plan_expires_at FROM users WHERE id = $1',
        [userId]
      );
      const user = result.rows[0];

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      let userPlan = user.plan || 'free';

      // ── Enforce plan expiry ────────────────────────────────────────────────
      // If the user is on a paid plan and their subscription has expired,
      // auto-downgrade them to free before checking access.
      if (userPlan !== 'free' && user.plan_expires_at) {
        const expiry = new Date(user.plan_expires_at);
        if (expiry < new Date()) {
          // Downgrade in the database
          await query(
            "UPDATE users SET plan = 'free', subscription_id = NULL WHERE id = $1",
            [userId]
          );
          userPlan = 'free';
          console.log(`[PlanMiddleware] User ${userId} plan expired at ${expiry.toISOString()}. Downgraded to free.`);
        }
      }

      const userLevel     = PLAN_LEVEL[userPlan]      ?? 0;
      const requiredLevel = PLAN_LEVEL[requiredPlan]  ?? 0;

      if (userLevel < requiredLevel) {
        return res.status(403).json({
          message:     `This feature requires the ${requiredPlan} plan or higher. Please upgrade.`,
          requiredPlan,
          userPlan,
          upgradeUrl:  '/pricing',
          expired:     user.plan !== 'free' && user.plan_expires_at && new Date(user.plan_expires_at) < new Date(),
        });
      }

      req.dbUser = { ...user, plan: userPlan };
      next();
    } catch (err) {
      const { IS_DEMO_AUTH, requireDemoMode } = require('../config/env');
      if (IS_DEMO_AUTH) {
        requireDemoMode('planMiddleware.requirePlan');
        req.dbUser = { plan: 'pro', plan_expires_at: null };
        return next();
      }
      console.error('[PlanMiddleware] Database error:', err);
      return res.status(503).json({ message: 'Service temporarily unavailable' });
    }
  };
};

module.exports = { requirePlan, PLAN_LEVEL };
