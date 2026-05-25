const mockDb = require('../models/mockDb');
const fs = require('fs');
const path = require('path');

const APTITUDE_PATH = path.join(__dirname, '../../data/aptitude_questions.json');
let aptitudePool = [];
try {
  if (fs.existsSync(APTITUDE_PATH)) {
    aptitudePool = JSON.parse(fs.readFileSync(APTITUDE_PATH, 'utf-8'));
    console.log(`[GamificationController] Loaded ${aptitudePool.length} aptitude questions successfully.`);
  }
} catch (err) {
  console.error("[GamificationController] Error loading aptitude questions:", err);
}


exports.getLeaderboard = async (req, res) => {
  try {
    const db = mockDb.getData();
    // Sort users by XP descending
    const users = [...db.users].sort((a, b) => (b.xp || 0) - (a.xp || 0));
    
    // Select top 10 profiles
    const leaderboard = users.map((u, index) => ({
      rank: index + 1,
      name: u.name,
      xp: u.xp || 0,
      streak: u.streak || 1,
      badges: u.badges || []
    }));

    return res.status(200).json({ leaderboard });
  } catch (err) {
    console.error("Leaderboard Error:", err);
    return res.status(500).json({ message: "Failed to retrieve leaderboard statistics" });
  }
};

exports.getChallenges = async (req, res) => {
  try {
    const db = mockDb.getData();
    return res.status(200).json({ challenges: db.challenges || [] });
  } catch (err) {
    console.error("Challenges Error:", err);
    return res.status(500).json({ message: "Failed to load daily challenges" });
  }
};

exports.completeChallenge = async (req, res) => {
  try {
    const { challengeId } = req.body;
    const userId = req.user.userId;

    const user = mockDb.users.findOne({ id: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const db = mockDb.getData();
    const challenge = db.challenges.find(c => c.id === challengeId);
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });

    const updatedXP = (user.xp || 0) + challenge.xp;
    
    mockDb.users.updateOne(
      { id: userId },
      { xp: updatedXP }
    );

    return res.status(200).json({
      message: `Challenge '${challenge.title}' completed! +${challenge.xp} XP awarded.`,
      xp: updatedXP
    });
  } catch (err) {
    console.error("Complete Challenge Error:", err);
    return res.status(500).json({ message: "Failed to complete challenge" });
  }
};

exports.getAptitudeQuestions = async (req, res) => {
  try {
    const setNum = parseInt(req.query.set);
    const difficulty = req.query.difficulty || 'All';
    const section = req.query.section || 'All';
    const limit = parseInt(req.query.limit) || 10;

    let pool = aptitudePool;

    if (!isNaN(setNum)) {
      pool = pool.filter(q => q.set === setNum);
    } else {
      if (difficulty && difficulty !== 'All') {
        pool = pool.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
      }
      if (section && section !== 'All') {
        pool = pool.filter(q => q.section.toLowerCase() === section.toLowerCase());
      }
      // Shuffle randomly
      pool = [...pool].sort(() => 0.5 - Math.random());
    }

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
