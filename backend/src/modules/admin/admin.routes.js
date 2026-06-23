const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const { query } = require('../../config/pgDb');

// Middleware to ensure user is an admin
const adminOnly = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const result = await query("SELECT role, email FROM users WHERE id = $1", [userId]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const { IS_DEMO_AUTH } = require('../../config/env');
    const isUserAdmin = user.role === 'admin' || user.email.includes('admin') || user.email === 'admin@example.com';
    
    if (!isUserAdmin) {
      if (IS_DEMO_AUTH) {
        console.warn(`[Admin Access] Non-admin user ${user.email} accessed Admin routes (sandbox ease of access mode).`);
      } else {
        return res.status(403).json({ message: "Forbidden: Admin access only" });
      }
    }
    
    next();
  } catch (err) {
    console.error("Admin verification error:", err);
    return res.status(500).json({ message: "Server error verifying admin privilege" });
  }
};

// All admin routes require authentication and admin access
router.use(authMiddleware);
router.use(adminOnly);

router.get('/stats', adminController.getStats);
router.get('/questions', adminController.getQuestions);
router.post('/questions', adminController.addQuestion);
router.delete('/questions/:id', adminController.deleteQuestion);

module.exports = router;
