/**
 * TRESK AI — Gamification & Learning Controller (PostgreSQL)
 * =====================================================================
 * Handles gamification features including Leaderboard, Daily Challenges,
 * and Aptitude tests.
 */

const fs = require('fs');
const path = require('path');
const { query } = require('../../config/pgDb');

const APTITUDE_PATH = path.join(__dirname, '../../../data/aptitude_questions.json');
let fileAptitudePool = [];
try {
  if (fs.existsSync(APTITUDE_PATH)) {
    fileAptitudePool = JSON.parse(fs.readFileSync(APTITUDE_PATH, 'utf-8'));
    console.log(`[GamificationController] Loaded ${fileAptitudePool.length} aptitude questions from JSON.`);
  }
} catch (err) {
  console.error("[GamificationController] Error loading aptitude questions from file:", err);
}

/**
 * Fetch top users sorted by XP descending.
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. Get current user's profile to check peers & rank
    const userRes = await query('SELECT college_name, branch, xp FROM users WHERE id = $1', [userId]);
    const currentUser = userRes.rows[0] || {};
    const college = currentUser.college_name;
    const branch = currentUser.branch;
    const userXP = currentUser.xp || 0;

    // Calculate user's rank
    const rankResult = await query(
      "SELECT COUNT(*) FROM users WHERE xp > $1",
      [userXP]
    );
    const userRank = parseInt(rankResult.rows[0].count) + 1;

    // Calculate total users
    const totalResult = await query("SELECT COUNT(*) FROM users");
    const totalUsers = parseInt(totalResult.rows[0].count) || 1;

    // Calculate percentile
    const percentile = Math.max(1, Math.min(100, Math.round((userRank / totalUsers) * 100)));

    // 2. Fetch Season Rankings (Top 10 users by total XP)
    const seasonRes = await query(
      "SELECT id, name, xp, streak, badges, avatar FROM users ORDER BY xp DESC, streak DESC LIMIT 10"
    );

    // 3. Fetch Global Leaderboard (Top 20 users by total XP)
    const globalRes = await query(
      "SELECT id, name, xp, streak, badges, avatar FROM users ORDER BY xp DESC, streak DESC LIMIT 20"
    );

    // 4. Fetch Friends / Peers (Same college or branch, fallback to global top 10)
    let friendsRes;
    if (college || branch) {
      friendsRes = await query(
        `SELECT id, name, xp, streak, badges, avatar FROM users 
         WHERE (college_name = $1 OR branch = $2) AND id != $3
         ORDER BY xp DESC, streak DESC LIMIT 10`,
        [college, branch, userId]
      );
    }

    let friendsList = friendsRes ? friendsRes.rows : [];
    // Always include the current user in the friends list if not already there
    const meRes = await query("SELECT id, name, xp, streak, badges, avatar FROM users WHERE id = $1", [userId]);
    if (meRes.rows[0]) {
      friendsList.unshift(meRes.rows[0]);
    }
    // Deduplicate friendsList by id
    const seen = new Set();
    friendsList = friendsList.filter(u => {
      if (seen.has(u.id)) return false;
      seen.add(u.id);
      return true;
    });

    // If no other friends/peers, fallback to the top users
    if (friendsList.length <= 1) {
      friendsList = globalRes.rows.slice(0, 10);
    }

    // Helper to format rows
    const formatUser = (row, index) => ({
      rank: index + 1,
      name: row.name,
      xp: row.xp || 0,
      streak: row.streak || 1,
      badges: row.badges || [],
      avatar: row.avatar || '',
      isMe: row.id === userId
    });

    const seasonRankings = seasonRes.rows.map(formatUser);
    const globalRankings = globalRes.rows.map(formatUser);
    const friendsRankings = friendsList.map((row, index) => ({
      ...formatUser(row, index),
      rank: index + 1
    }));

    return res.status(200).json({
      season: seasonRankings,
      global: globalRankings,
      friends: friendsRankings,
      userRank,
      percentile
    });
  } catch (err) {
    console.warn("Leaderboard Error, returning mock leaderboard fallback:", err.message);
    const mockSeason = [
      { rank: 1, name: "Aarav Sharma", xp: 3200, streak: 12, badges: ["Novice Prep", "Coding Master", "Placement Ready"], avatar: "" },
      { rank: 2, name: "Priya Patel", xp: 2850, streak: 8, badges: ["Novice Prep", "Interview Scholar", "Coding Master"], avatar: "" },
      { rank: 3, name: "Rohan Das", xp: 2400, streak: 5, badges: ["Novice Prep", "Interview Scholar"], avatar: "" },
      { rank: 4, name: "Sneha Reddy", xp: 1950, streak: 4, badges: ["Novice Prep", "Coding Master"], avatar: "" },
      { rank: 5, name: "Amit Gupta", xp: 1550, streak: 3, badges: ["Novice Prep"], avatar: "" }
    ];
    const mockGlobal = [
      ...mockSeason,
      { rank: 6, name: "Sarah Jenkins", xp: 1400, streak: 25, badges: ["Interview Scholar"], avatar: "" },
      { rank: 7, name: "Elena Rostova", xp: 980, streak: 12, badges: ["Coding Master"], avatar: "" }
    ];
    const mockFriends = [
      { rank: 1, name: "Aarav Sharma", xp: 3200, streak: 12, badges: ["Novice Prep", "Coding Master", "Placement Ready"], avatar: "" },
      { rank: 2, name: "Dev Friend", xp: 950, streak: 2, badges: ["Coding Master"], avatar: "" }
    ];
    return res.status(200).json({
      season: mockSeason,
      global: mockGlobal,
      friends: mockFriends,
      userRank: 4,
      percentile: 10
    });
  }
};

/**
 * Get daily challenges.
 */
exports.getChallenges = async (req, res) => {
  try {
    // Check daily_challenges table first
    let challenges = [];
    try {
      const cResult = await query(
        "SELECT id, problem_id, problem_title, difficulty, xp_reward, tags FROM daily_challenges WHERE active = true LIMIT 5"
      );
      challenges = cResult.rows.map(row => ({
        id: row.id,
        problemId: row.problem_id,
        title: row.problem_title,
        difficulty: row.difficulty,
        xp: row.xp_reward,
        tags: row.tags || []
      }));
    } catch (dbErr) {
      console.warn('DB query for daily challenges failed, falling back to static challenges:', dbErr.message);
    }

    if (challenges.length === 0) {
      // Fallback
      challenges = [
        { id: "c_daily_1", problemId: "q_code_dsa_1", title: "Reverse a String", difficulty: "easy", xp: 150, tags: ["Strings", "Algorithms"] },
        { id: "c_daily_2", problemId: "q_code_dsa_2", title: "Is Palindrome Check", difficulty: "easy", xp: 150, tags: ["Strings"] }
      ];
    }

    return res.status(200).json({ challenges });
  } catch (err) {
    console.error("Challenges Error:", err);
    return res.status(500).json({ message: "Failed to load daily challenges" });
  }
};

/**
 * Complete a daily challenge and award user XP.
 */
exports.completeChallenge = async (req, res) => {
  try {
    const { challengeId } = req.body;
    const userId = req.user.userId;

    let xpReward = 150;
    let updatedXP = 1350; // mock default xp plus reward

    let dbOffline = false;
    try {
      // Determine XP award amount
      try {
        const cResult = await query("SELECT id, xp_reward FROM daily_challenges WHERE id = $1", [challengeId]);
        if (cResult.rows.length > 0) {
          xpReward = cResult.rows[0].xp_reward;
          
          // Log completion
          await query(
            "INSERT INTO daily_challenge_completions (challenge_id, user_id, completed_at) VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING",
            [challengeId, userId]
          );
        }
      } catch (dbErr) {
        console.warn('DB query/logging for daily challenges failed:', dbErr.message);
      }

      const updateResult = await query("UPDATE users SET xp = xp + $1 WHERE id = $2 RETURNING xp", [xpReward, userId]);
      if (updateResult.rows.length > 0) {
        updatedXP = updateResult.rows[0].xp;
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    } catch (err) {
      dbOffline = true;
      console.warn("Database offline during completeChallenge:", err.message);
    }

    const { IS_DEMO_AUTH, requireDemoMode } = require('../../config/env');
    if (dbOffline) {
      if (!IS_DEMO_AUTH) {
        return res.status(503).json({ message: "Service temporarily unavailable" });
      }
      requireDemoMode('gamification.completeChallenge');
    }

    return res.status(200).json({
      message: `Challenge completed! +${xpReward} XP awarded. (offline mode)`,
      xp: updatedXP
    });
  } catch (err) {
    console.error("Complete Challenge Error:", err);
    return res.status(500).json({ message: "Failed to complete challenge" });
  }
};

/**
 * Fetch aptitude questions.
 */
exports.getAptitudeQuestions = async (req, res) => {
  try {
    const setNum = parseInt(req.query.set, 10);
    const difficulty = req.query.difficulty || 'All';
    const section = req.query.section || 'All';
    const limit = parseInt(req.query.limit, 10) || 10;

    let pool = [];
    let dbSuccess = false;

    // Check DB first for aptitude questions if seeded under type 'Aptitude'
    try {
      const qResult = await query(`
        SELECT id, question, templates, description, difficulty, role, test_cases 
        FROM questions 
        WHERE type = 'Aptitude' 
          AND is_active = true
          AND ($1 = 'All' OR LOWER(difficulty) = LOWER($1))
          AND ($2 = 'All' OR LOWER(role) = LOWER($2))
      `, [difficulty, section]);
      
      if (qResult.rows.length > 0) {
        pool = qResult.rows.map((row, idx) => {
          let opts = [];
          try {
            opts = typeof row.templates === 'string' ? JSON.parse(row.templates) : (row.templates || []);
          } catch (pe) {
            opts = row.templates || [];
          }
          
          let tc = {};
          try {
            tc = typeof row.test_cases === 'string' ? JSON.parse(row.test_cases) : (row.test_cases || {});
          } catch (pe) {
            tc = row.test_cases || {};
          }
          
          return {
            id: row.id || `apt_${idx}`,
            question: row.question,
            options: opts,
            correctIndex: tc.correctIndex !== undefined ? tc.correctIndex : 0,
            explanation: row.description,
            difficulty: row.difficulty,
            section: row.role || 'General',
            set: tc.set !== undefined ? tc.set : 1
          };
        });
        dbSuccess = true;
      }
    } catch (e) {
      console.warn('DB query for aptitude failed:', e.message);
    }

    if (!dbSuccess) {
      pool = fileAptitudePool;
      if (difficulty && difficulty !== 'All') {
        pool = pool.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
      }
      if (section && section !== 'All') {
        pool = pool.filter(q => q.section.toLowerCase() === section.toLowerCase());
      }
    }

    if (!isNaN(setNum)) {
      pool = pool.filter(q => q.set === setNum);
    }

    pool = [...pool].sort(() => 0.5 - Math.random());
    const subset = pool.slice(0, limit);

    return res.status(200).json({
      questions: subset,
      totalCount: pool.length
    });
  } catch (err) {
    console.error("Aptitude Fetch Error:", err);
    return res.status(500).json({ message: "Failed to load aptitude test" });
  }
};
