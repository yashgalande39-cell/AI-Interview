const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. No authentication token provided." });
  }

  try {
    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
      return res.status(401).json({ message: "Access denied. Invalid token format." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ message: "Access denied. Expired or invalid token." });
  }
};
