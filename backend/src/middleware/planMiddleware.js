const mockDb = require('../models/mockDb');

const PLAN_LEVEL = {
  free: 0,
  pro: 1,
  teams: 2
};

const requirePlan = (requiredPlan) => {
  return (req, res, next) => {
    try {
      const userId = req.user.userId;
      const user = mockDb.users.findOne({ id: userId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userPlan = user.plan || 'free';
      const userLevel = PLAN_LEVEL[userPlan] ?? 0;
      const requiredLevel = PLAN_LEVEL[requiredPlan] ?? 0;

      if (userLevel < requiredLevel) {
        return res.status(403).json({
          message: `This feature requires the ${requiredPlan} plan or higher. Please upgrade.`,
          requiredPlan,
          userPlan
        });
      }

      // Store full user object on the request for downstream controllers to use
      req.dbUser = user;
      next();
    } catch (err) {
      console.error("Plan verification error:", err);
      return res.status(500).json({ message: "Server error verifying plan" });
    }
  };
};

module.exports = {
  requirePlan,
  PLAN_LEVEL
};
