const mockDb = require('../models/mockDb');

exports.getStats = async (req, res) => {
  try {
    const db = mockDb.getData();
    const totalUsers = db.users.length;
    const totalInterviews = db.interviews.length;
    
    // Calculate average score
    const completedInterviews = db.interviews.filter(i => i.status === 'completed' && i.scoreCard);
    let avgScore = 0;
    if (completedInterviews.length > 0) {
      const sum = completedInterviews.reduce((a, b) => a + (b.scoreCard.overallScore || 0), 0);
      avgScore = Math.round(sum / completedInterviews.length);
    } else {
      avgScore = 75; // fallback default
    }

    // Calculate active today
    const todayStr = new Date().toISOString().split('T')[0];
    const activeToday = db.users.filter(u => {
      if (!u.lastActive) return false;
      return u.lastActive.startsWith(todayStr);
    }).length;

    return res.status(200).json({
      totalUsers,
      totalInterviews,
      avgScore,
      activeToday: activeToday || 1
    });
  } catch (err) {
    console.error("Admin Stats Error:", err);
    return res.status(500).json({ message: "Failed to load admin stats" });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const db = mockDb.getData();
    return res.status(200).json({ questions: db.questions || [] });
  } catch (err) {
    console.error("Admin Get Questions Error:", err);
    return res.status(500).json({ message: "Failed to retrieve questions" });
  }
};

exports.addQuestion = async (req, res) => {
  try {
    const { type, difficulty, role, company, question } = req.body;
    if (!type || !difficulty || !role || !company || !question) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newQuestion = mockDb.questions.create({
      type,
      difficulty,
      role,
      company,
      question
    });

    return res.status(201).json({
      message: "Question added successfully",
      question: newQuestion
    });
  } catch (err) {
    console.error("Admin Add Question Error:", err);
    return res.status(500).json({ message: "Failed to add question" });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const db = mockDb.getData();
    
    const initialLength = db.questions.length;
    db.questions = db.questions.filter(q => q.id !== id);
    
    if (db.questions.length === initialLength) {
      return res.status(404).json({ message: "Question not found" });
    }
    
    mockDb.saveData(db);
    return res.status(200).json({ message: "Question deleted successfully" });
  } catch (err) {
    console.error("Admin Delete Question Error:", err);
    return res.status(500).json({ message: "Failed to delete question" });
  }
};
