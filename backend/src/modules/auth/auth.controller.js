/**
 * TRESK AI — Auth Controller (PostgreSQL)
 * =====================================================================
 * Replaces the legacy mockDb-based authController.js.
 * All user data is persisted to and read from PostgreSQL.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../../config/pgDb');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_ai_interview_token';
const FIREBASE_PROJECT_ID = 'ai-interview-auth-530ed';

// ── Helper: strip sensitive fields ───────────────────────────────────────────
const sanitize = (user) => {
  const { password_hash, ...safe } = user;
  return safe;
};

// ── Helper: compute XP badge ─────────────────────────────────────────────────
const computeBadges = (xp, existing = []) => {
  const badges = Array.isArray(existing) ? [...existing] : ['Novice Prep'];
  if (xp >= 500  && !badges.includes('Interview Scholar'))  badges.push('Interview Scholar');
  if (xp >= 1500 && !badges.includes('Coding Master'))     badges.push('Coding Master');
  if (xp >= 3000 && !badges.includes('Placement Ready'))   badges.push('Placement Ready');
  return badges;
};

// ── Register ─────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, collegeName, branch, graduationYear } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // Check for duplicate
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await query(`
      INSERT INTO users (name, email, password_hash, college_name, branch, graduation_year, xp, streak, badges, plan, auth_provider, last_active)
      VALUES ($1, $2, $3, $4, $5, $6, 100, 1, '{"Novice Prep"}', 'free', 'local', NOW())
      RETURNING *
    `, [name, email, password_hash, collegeName || '', branch || '', graduationYear || '']);

    const newUser = result.rows[0];
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: sanitize(newUser)
    });
  } catch (err) {
    console.error('Register Error:', err);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash || '');
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Streak calculation
    const now = new Date();
    const lastActive = new Date(user.last_active);
    const diffDays = Math.ceil(Math.abs(now - lastActive) / (1000 * 60 * 60 * 24));
    let streak = user.streak || 1;
    if (diffDays === 1)      streak += 1;
    else if (diffDays > 1)  streak = 1;

    const updated = await query(
      'UPDATE users SET last_active = NOW(), streak = $1 WHERE id = $2 RETURNING *',
      [streak, user.id]
    );

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: sanitize(updated.rows[0])
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// ── Get Profile ───────────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ user: sanitize(user) });
  } catch (err) {
    console.error('Get Profile Error:', err);
    return res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

// ── Update Profile ────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, currentRole, location, bio, collegeName, branch, graduationYear } = req.body;

    const result = await query(`
      UPDATE users
      SET name = COALESCE($1, name),
          current_role = COALESCE($2, current_role),
          location = COALESCE($3, location),
          bio = COALESCE($4, bio),
          college_name = COALESCE($5, college_name),
          branch = COALESCE($6, branch),
          graduation_year = COALESCE($7, graduation_year)
      WHERE id = $8
      RETURNING *
    `, [name, currentRole, location, bio, collegeName, branch, graduationYear, userId]);

    if (!result.rows[0]) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ message: 'Profile updated', user: sanitize(result.rows[0]) });
  } catch (err) {
    console.error('Update Profile Error:', err);
    return res.status(500).json({ message: 'Server error updating profile' });
  }
};

// ── Update XP & Streak ────────────────────────────────────────────────────────
exports.updateXpAndStreak = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { xpAmount, badgeToEarn } = req.body;

    const existing = await query('SELECT xp, badges FROM users WHERE id = $1', [userId]);
    if (!existing.rows[0]) return res.status(404).json({ message: 'User not found' });

    const currentXP = existing.rows[0].xp || 0;
    const newXP = currentXP + (xpAmount || 0);

    let badges = computeBadges(newXP, existing.rows[0].badges);
    if (badgeToEarn && !badges.includes(badgeToEarn)) badges.push(badgeToEarn);

    const result = await query(
      'UPDATE users SET xp = $1, badges = $2 WHERE id = $3 RETURNING *',
      [newXP, badges, userId]
    );

    return res.status(200).json({ message: 'Progress updated', user: sanitize(result.rows[0]) });
  } catch (err) {
    console.error('XP Update Error:', err);
    return res.status(500).json({ message: 'Server error updating progress' });
  }
};

// ── Update Plan ───────────────────────────────────────────────────────────────
exports.updatePlan = async (req, res) => {
  try {
    const { plan } = req.body;
    const validPlans = ['free', 'pro', 'teams'];
    if (!validPlans.includes(plan)) return res.status(400).json({ message: 'Invalid plan' });

    const result = await query(
      'UPDATE users SET plan = $1, plan_activated_at = NOW() WHERE id = $2 RETURNING *',
      [plan, req.user.userId]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ message: 'Plan updated', user: sanitize(result.rows[0]) });
  } catch (err) {
    console.error('Update Plan Error:', err);
    return res.status(500).json({ message: 'Server error updating plan' });
  }
};

// ── Change Password ───────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new passwords are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const result = await query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash || '');
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, user.id]);

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change Password Error:', err);
    return res.status(500).json({ message: 'Server error changing password' });
  }
};

// ── Firebase Helpers ──────────────────────────────────────────────────────────
async function getFirebasePublicKeys() {
  const res = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
  if (!res.ok) throw new Error('Failed to fetch Firebase public keys');
  return res.json();
}

async function verifyFirebaseIdToken(idToken) {
  const decoded = jwt.decode(idToken, { complete: true });
  if (!decoded?.header?.kid) throw new Error('Malformed Firebase ID token');
  const keys = await getFirebasePublicKeys();
  const publicKey = keys[decoded.header.kid];
  if (!publicKey) throw new Error('Unknown Firebase signing key');
  return jwt.verify(idToken, publicKey, {
    algorithms: ['RS256'],
    audience: FIREBASE_PROJECT_ID,
    issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
  });
}

// ── Google Auth ───────────────────────────────────────────────────────────────
exports.googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'Firebase ID token is required' });

    let firebasePayload;
    try {
      firebasePayload = await verifyFirebaseIdToken(idToken);
    } catch (e) {
      return res.status(401).json({ message: 'Invalid or expired Google token.' });
    }

    const { uid: googleId, email, name, picture } = firebasePayload;
    if (!email) return res.status(400).json({ message: 'Google account must have an email' });

    const existing = await query('SELECT * FROM users WHERE email = $1', [email]);
    let user;

    if (existing.rows.length === 0) {
      // New user — auto-register
      const result = await query(`
        INSERT INTO users (name, email, google_id, avatar, xp, streak, badges, plan, auth_provider, last_active)
        VALUES ($1, $2, $3, $4, 100, 1, '{"Novice Prep"}', 'free', 'google', NOW())
        RETURNING *
      `, [name || email.split('@')[0], email, googleId, picture || '']);
      user = result.rows[0];
      console.log(`✅ New Google user registered: ${email}`);
    } else {
      // Returning user — update streak & profile
      const prev = existing.rows[0];
      const now = new Date();
      const diffDays = Math.ceil(Math.abs(now - new Date(prev.last_active)) / (1000 * 60 * 60 * 24));
      let streak = prev.streak || 1;
      if (diffDays === 1) streak += 1;
      else if (diffDays > 1) streak = 1;

      const result = await query(
        'UPDATE users SET last_active = NOW(), streak = $1, google_id = $2, avatar = COALESCE($3, avatar) WHERE id = $4 RETURNING *',
        [streak, googleId, picture || null, prev.id]
      );
      user = result.rows[0];
      console.log(`✅ Returning Google user: ${email}`);
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(200).json({ message: 'Google authentication successful', token, user: sanitize(user) });
  } catch (err) {
    console.error('Google Auth Error:', err);
    return res.status(500).json({ message: 'Server error during Google authentication' });
  }
};

// ── Legacy Chat Assistant (redirected to TRESK) ───────────────────────────────
exports.chatAssistant = async (req, res) => {
  return res.status(301).json({
    message: 'This endpoint has moved to /api/tresk/chat',
    redirectTo: '/api/tresk/chat'
  });
};
