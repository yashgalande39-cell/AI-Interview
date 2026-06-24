/**
 * TRESK AI — Auth Middleware
 * =====================================================================
 * Phase 2: Supports both httpOnly cookie (preferred) and
 * Authorization: Bearer <token> header (legacy / mobile clients).
 *
 * Token payload: { userId, role }
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

module.exports = (req, res, next) => {
  let token = null;

  // 1. Prefer httpOnly cookie (XSS-safe)
  if (req.cookies?.tresk_access) {
    token = req.cookies.tresk_access;
  }

  // 2. Fallback: Authorization header (for API clients / legacy)
  if (!token) {
    const authHeader = req.header('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No authentication token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // decoded = { userId, role, iat, exp }
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please refresh your token.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Access denied. Invalid token.', code: 'TOKEN_INVALID' });
  }
};
