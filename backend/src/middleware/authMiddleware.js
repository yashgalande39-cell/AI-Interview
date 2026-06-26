/**
 * TRESK AI — Auth Middleware
 * =====================================================================
 * Access tokens are issued in the JSON login/register response and
 * stored in-memory by the frontend (never in localStorage).
 * They are sent to the API as: Authorization: Bearer <token>
 *
 * Token payload: { userId, role }
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

module.exports = (req, res, next) => {
  // Read token from Authorization: Bearer header
  const authHeader = req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

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
