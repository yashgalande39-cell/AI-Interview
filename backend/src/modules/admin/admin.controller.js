/**
 * TRESK AI — Admin Controller (PostgreSQL)
 * =====================================================================
 * Handles administrative overview statistics and global question banking.
 */

const { query } = require('../../config/pgDb');

/**
 * Fetch platform overview statistics.
 */
exports.getStats = async (req, res) => {
  try {
    // 1. Total users
    const userCountRes = await query("SELECT COUNT(*) FROM users");
    const totalUsers = parseInt(userCountRes.rows[0].count, 10) || 0;

    // 2. Total interviews
    const interviewCountRes = await query("SELECT COUNT(*) FROM interview_sessions");
    const totalInterviews = parseInt(interviewCountRes.rows[0].count, 10) || 0;

    // 3. Average score of completed interviews
    const avgScoreRes = await query("SELECT AVG(score_overall) as avg_score FROM interview_sessions WHERE status = 'completed'");
    const avgScore = Math.round(parseFloat(avgScoreRes.rows[0].avg_score) || 75);

    // 4. Users active today
    const activeTodayRes = await query("SELECT COUNT(*) FROM users WHERE last_active >= NOW() - INTERVAL '1 day'");
    const activeToday = parseInt(activeTodayRes.rows[0].count, 10) || 1;

    return res.status(200).json({
      totalUsers,
      totalInterviews,
      avgScore,
      activeToday
    });
  } catch (err) {
    console.error("Admin Stats Error:", err);
    return res.status(500).json({ message: "Failed to load admin stats" });
  }
};

/**
 * Fetch all platform questions from questions table.
 */
exports.getQuestions = async (req, res) => {
  try {
    const qResult = await query("SELECT * FROM questions ORDER BY created_at DESC");
    
    // Map database columns to the format frontend expects
    const questions = qResult.rows.map(row => ({
      id: row.id,
      type: row.type,
      difficulty: row.difficulty,
      role: row.role,
      company: row.company,
      question: row.question || row.description,
      title: row.title,
      description: row.description,
      testCases: row.test_cases,
      templates: row.templates,
      tags: row.tags,
      isActive: row.is_active,
      createdAt: row.created_at
    }));

    return res.status(200).json({ questions });
  } catch (err) {
    console.error("Admin Get Questions Error:", err);
    return res.status(500).json({ message: "Failed to retrieve questions" });
  }
};

/**
 * Add a new question to questions bank.
 */
exports.addQuestion = async (req, res) => {
  try {
    const { type, difficulty, role, company, question } = req.body;
    if (!type || !difficulty || !role || !company || !question) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const result = await query(`
      INSERT INTO questions (type, difficulty, role, company, question, title, description, is_active, created_at)
      VALUES ($1, $2, $3, $4, $5, $5, $5, true, NOW())
      RETURNING *
    `, [type, difficulty, role, company, question]);

    const newQuestion = result.rows[0];

    return res.status(201).json({
      message: "Question added successfully",
      question: {
        id: newQuestion.id,
        type: newQuestion.type,
        difficulty: newQuestion.difficulty,
        role: newQuestion.role,
        company: newQuestion.company,
        question: newQuestion.question
      }
    });
  } catch (err) {
    console.error("Admin Add Question Error:", err);
    return res.status(500).json({ message: "Failed to add question" });
  }
};

/**
 * Delete a question from the database.
 */
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM questions WHERE id = $1 RETURNING *", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Question not found" });
    }
    
    return res.status(200).json({ message: "Question deleted successfully" });
  } catch (err) {
    console.error("Admin Delete Question Error:", err);
    return res.status(500).json({ message: "Failed to delete question" });
  }
};
