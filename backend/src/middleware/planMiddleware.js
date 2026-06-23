/**
 * TRESK AI — Plan Enforcement Middleware (PostgreSQL)
 * =====================================================================
 * Verifies the user's current subscription plan before allowing
 * access to gated features.
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
      const result = await query('SELECT plan FROM users WHERE id = $1', [userId]);
      const user = result.rows[0];

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const userPlan = user.plan || 'free';
      const userLevel = PLAN_LEVEL[userPlan] ?? 0;
      const requiredLevel = PLAN_LEVEL[requiredPlan] ?? 0;

      if (userLevel < requiredLevel) {
        return res.status(403).json({
          message: `This feature requires the ${requiredPlan} plan or higher. Please upgrade.`,
          requiredPlan,
          userPlan,
          upgradeUrl: '/pricing'
        });
      }

      req.dbUser = user;
      next();
    } catch (err) {
      const { IS_DEMO_AUTH, requireDemoMode } = require('../config/env');
      if (IS_DEMO_AUTH) {
        requireDemoMode('planMiddleware.requirePlan');
        req.dbUser = { plan: 'pro' };
        return next();
      }
      console.error('[PlanMiddleware] Database error:', err);
      return res.status(503).json({ message: 'Service temporarily unavailable' });
    }
  };
};

module.exports = { requirePlan, PLAN_LEVEL };
