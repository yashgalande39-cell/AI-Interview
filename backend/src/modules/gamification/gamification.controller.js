/**
 * TRESK AI — Gamification & Learning Controller (PostgreSQL)
 * =====================================================================
 * Handles gamification features including Leaderboard, Daily Challenges,
 * Aptitude tests, and Group Discussion topics.
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
    const result = await query(
      "SELECT name, xp, streak, badges FROM users ORDER BY xp DESC, streak DESC LIMIT 10"
    );

    const leaderboard = result.rows.map((row, index) => ({
      rank: index + 1,
      name: row.name,
      xp: row.xp || 0,
      streak: row.streak || 1,
      badges: row.badges || []
    }));

    return res.status(200).json({ leaderboard });
  } catch (err) {
    console.warn("Leaderboard Error, returning mock leaderboard fallback:", err.message);
    const mockLeaderboard = [
      { rank: 1, name: "Aarav Sharma", xp: 3200, streak: 12, badges: ["Novice Prep", "Coding Master", "Placement Ready"] },
      { rank: 2, name: "Priya Patel", xp: 2850, streak: 8, badges: ["Novice Prep", "Interview Scholar", "Coding Master"] },
      { rank: 3, name: "Rohan Das", xp: 2400, streak: 5, badges: ["Novice Prep", "Interview Scholar"] },
      { rank: 4, name: "Sneha Reddy", xp: 1950, streak: 4, badges: ["Novice Prep", "Coding Master"] },
      { rank: 5, name: "Amit Gupta", xp: 1550, streak: 3, badges: ["Novice Prep"] }
    ];
    return res.status(200).json({ leaderboard: mockLeaderboard });
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
      const uResult = await query("SELECT xp FROM users WHERE id = $1", [userId]);
      if (uResult.rows.length > 0) {
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

        const currentXP = uResult.rows[0].xp || 0;
        updatedXP = currentXP + xpReward;

        await query("UPDATE users SET xp = $1 WHERE id = $2", [updatedXP, userId]);
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
        SELECT id, question, templates, description, difficulty, role 
        FROM questions 
        WHERE type = 'Aptitude' 
          AND is_active = true
          AND ($1 = 'All' OR difficulty = $1)
          AND ($2 = 'All' OR role = $2)
      `, [difficulty, section]);
      
      if (qResult.rows.length > 0) {
        pool = qResult.rows.map((row, idx) => {
          let opts = [];
          try {
            opts = typeof row.templates === 'string' ? JSON.parse(row.templates) : (row.templates || []);
          } catch (pe) {
            opts = row.templates || [];
          }
          return {
            id: row.id || `apt_${idx}`,
            question: row.question,
            options: opts,
            answer: row.description,
            difficulty: row.difficulty,
            section: row.role || 'General',
            set: 1
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

/**
 * Fetch Roundtable group discussion topic details.
 */
exports.getGDTopic = async (req, res) => {
  try {
    const gdTopics = [
      {
        id: "gd_1",
        title: "Will AI and Automation eliminate Software Engineering jobs?",
        description: "Analyze the implications of generative code assistants (like Gemini/GitHub Copilot) on junior developer roles and engineering careers.",
        participants: [
          { name: "Rohit (AI Enthusiast)", avatar: "🤖", color: "border-purple-500 text-purple-400" },
          { name: "Sneha (Experienced Manager)", avatar: "💼", color: "border-cyan-500 text-cyan-400" },
          { name: "David (Ethicist)", avatar: "⚖️", color: "border-amber-500 text-amber-400" },
          { name: "Anjali (Junior Dev)", avatar: "💻", color: "border-pink-500 text-pink-400" }
        ],
        aiDialogueTemplates: [
          "I agree with Sneha that AI is an enhancer, not a total replacement. It takes over routine boilerplate code, leaving us to solve core architecture problems.",
          "Actually, looking at previous industrial revolutions, automation increases productivity which historically expands job markets rather than killing them.",
          "However, we must consider the ethical risks of code plagiarism and the threat to entry-level learning curves. How will juniors learn if AI writes all basic functions?"
        ]
      }
    ];

    const selected = gdTopics[Math.floor(Math.random() * gdTopics.length)];
    return res.status(200).json({ gdTopic: selected });
  } catch (err) {
    console.error("GD Fetch Error:", err);
    return res.status(500).json({ message: "Failed to load group discussion session" });
  }
};
