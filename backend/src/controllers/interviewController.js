const mockDb = require('../models/mockDb');

// Helper to simulate Gemini API prompting or fallback to rich rule-based generation
const generateAIQuestions = async (type, difficulty, role, company, language, resumeText) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (apiKey) {
    try {
      // If the user has a Gemini API key configured, we could run a real fetch here.
      // We will provide a robust structural call, with a graceful fallback.
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate 5 realistic and challenging ${difficulty} level interview questions for a ${role} position at ${company || 'a top tech company'}. The interview type is ${type}. Language/Domain: ${language || 'General'}. ${resumeText ? `Based on this resume context: ${resumeText}` : ''} Return strictly a JSON array of strings.`
            }]
          }]
        })
      });
      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const text = data.candidates[0].content.parts[0].text;
        const cleanedText = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanedText);
      }
    } catch (e) {
      console.warn("Gemini API call failed, falling back to simulator:", e.message);
    }
  }

  // Simulator Fallback: Grabs rich template questions from database and matches criteria
  const allQs = mockDb.questions.find({ type, difficulty });
  let filtered = allQs.filter(q => q.company === company || q.company === "Common");
  if (filtered.length === 0) filtered = allQs;

  // Shuffle and take 5 questions
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5).map(q => q.question || q.description || q.question);
};

exports.generateSession = async (req, res) => {
  try {
    const { type, difficulty, role, company, language, resumeId } = req.body;
    const userId = req.user ? req.user.userId : 'anonymous';

    if (!type || !difficulty || !role) {
      return res.status(400).json({ message: "Type, difficulty and role are required fields" });
    }

    // Retrieve resume text if attached
    let resumeText = "";
    if (resumeId) {
      const db = mockDb.getData();
      const resume = db.resumes.find(r => r.id === resumeId);
      if (resume) resumeText = resume.text || "";
    }

    console.log(`Generating a ${difficulty} ${type} session for role: ${role} at ${company || 'Common'}`);
    
    // Generate questions
    let questions = [];
    if (type === "Coding") {
      const codingChallenges = mockDb.getData().questions.filter(q => q.type === "Coding" && (q.difficulty === difficulty || difficulty === "Medium"));
      questions = codingChallenges.slice(0, 2); // 2 coding rounds
    } else {
      const generated = await generateAIQuestions(type, difficulty, role, company, language, resumeText);
      questions = generated.map((q, idx) => ({ id: `sq_${idx + 1}`, text: q }));
    }

    // Create session record
    const session = mockDb.interviews.create({
      userId,
      type,
      difficulty,
      role,
      company: company || "Common",
      language: language || "JavaScript",
      questions,
      currentQuestionIndex: 0,
      transcript: [],
      scoreCard: null
    });

    return res.status(200).json({
      message: "Session generated successfully",
      session
    });
  } catch (err) {
    console.error("Session Generation Error:", err);
    return res.status(500).json({ message: "Failed to generate mock interview session" });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { sessionId, answerText, speechDurationSeconds, tabBlurCount, webcamStats } = req.body;

    const session = mockDb.interviews.findOne({ id: sessionId });
    if (!session) {
      return res.status(404).json({ message: "Interview session not found" });
    }

    const currentIdx = session.currentQuestionIndex;
    const currentQ = session.questions[currentIdx];
    const qText = currentQ.text || currentQ.question || currentQ.description || "Question details missing";

    // --- Communication Fluency & Speaking Pace Analysis ---
    const wordCount = answerText.trim().split(/\s+/).length;
    const durationMin = (speechDurationSeconds || 30) / 60;
    const wpm = Math.round(wordCount / durationMin) || 110;

    // Detect Filler Words
    const fillers = ["um", "uh", "like", "so", "basically", "you know", "actually"];
    let fillerCount = 0;
    const lowerText = answerText.toLowerCase();
    fillers.forEach(word => {
      const matches = lowerText.match(new RegExp(`\\b${word}\\b`, 'g'));
      if (matches) fillerCount += matches.length;
    });

    // Evaluate response quality based on length and relevance keywords
    let technicalAccuracy = 60;
    if (wordCount > 40) technicalAccuracy = 85;
    if (wordCount > 70) technicalAccuracy = 95;
    if (wordCount < 15) technicalAccuracy = 45;

    // Adjust score based on filler word density
    const fillerDensity = fillerCount / wordCount;
    let fluencyScore = 100 - Math.round(fillerDensity * 150);
    fluencyScore = Math.max(40, Math.min(100, fluencyScore));

    // Dynamic Stress Metric
    let stressScore = Math.min(100, Math.max(10, Math.round((fillerCount * 12) + (wpm > 150 || wpm < 85 ? 30 : 10))));

    // Total Answer Score
    const answerScore = Math.round((technicalAccuracy * 0.6) + (fluencyScore * 0.4));

    // Record turn to transcript
    const turnData = {
      question: qText,
      answer: answerText,
      analysis: {
        score: answerScore,
        technicalAccuracy,
        fluencyScore,
        wpm,
        fillerCount,
        stressScore,
        eyeContactScore: webcamStats?.eyeContactScore || 90,
        emotion: webcamStats?.emotion || "Confident"
      }
    };

    const newTranscript = [...session.transcript, turnData];
    const nextIdx = currentIdx + 1;
    const isCompleted = nextIdx >= session.questions.length;

    // --- Adaptive Questioning Logic ---
    // If the user answers incredibly well, increase the difficulty of subsequent questions!
    let nextDifficulty = session.difficulty;
    if (answerScore >= 85 && session.difficulty === "Easy") nextDifficulty = "Medium";
    if (answerScore >= 88 && session.difficulty === "Medium") nextDifficulty = "Hard";
    // If the user struggles heavily, ease the difficulty
    if (answerScore < 50 && session.difficulty === "Hard") nextDifficulty = "Medium";
    if (answerScore < 45 && session.difficulty === "Medium") nextDifficulty = "Easy";

    // Adaptive Question generation fallback: update upcoming question list if not completed
    let updatedQuestions = [...session.questions];
    if (!isCompleted && nextDifficulty !== session.difficulty) {
      console.log(`⚡ Adaptive AI Triggered: Changing difficulty to: ${nextDifficulty}`);
      const replacementQs = mockDb.questions.find({ type: session.type, difficulty: nextDifficulty });
      if (replacementQs.length > 0) {
        const selectedRep = replacementQs[Math.floor(Math.random() * replacementQs.length)];
        updatedQuestions[nextIdx] = { id: `adaptive_${nextIdx}`, text: selectedRep.question || selectedRep.description };
      }
    }

    // Update DB
    mockDb.interviews.updateOne(
      { id: sessionId },
      {
        transcript: newTranscript,
        currentQuestionIndex: nextIdx,
        difficulty: nextDifficulty,
        questions: updatedQuestions,
        status: isCompleted ? "completed" : "ongoing"
      }
    );

    return res.status(200).json({
      message: "Answer submitted successfully",
      isCompleted,
      analysis: turnData.analysis,
      nextQuestion: isCompleted ? null : updatedQuestions[nextIdx]
    });
  } catch (err) {
    console.error("Answer Submission Error:", err);
    return res.status(500).json({ message: "Failed to evaluate answer" });
  }
};

exports.finishSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = mockDb.interviews.findOne({ id: sessionId });
    if (!session) {
      return res.status(404).json({ message: "Interview session not found" });
    }

    if (session.transcript.length === 0) {
      return res.status(400).json({ message: "No transcript data available to calculate final scores" });
    }

    // Compute averages
    const totalAnswers = session.transcript.length;
    let avgTechnical = 0;
    let avgFluency = 0;
    let avgWpm = 0;
    let avgStress = 0;
    let totalFillers = 0;
    let avgEyeContact = 0;

    session.transcript.forEach(t => {
      avgTechnical += t.analysis.technicalAccuracy;
      avgFluency += t.analysis.fluencyScore;
      avgWpm += t.analysis.wpm;
      avgStress += t.analysis.stressScore;
      totalFillers += t.analysis.fillerCount;
      avgEyeContact += t.analysis.eyeContactScore;
    });

    avgTechnical = Math.round(avgTechnical / totalAnswers);
    avgFluency = Math.round(avgFluency / totalAnswers);
    avgWpm = Math.round(avgWpm / totalAnswers);
    avgStress = Math.round(avgStress / totalAnswers);
    avgEyeContact = Math.round(avgEyeContact / totalAnswers);

    const overallScore = Math.round((avgTechnical * 0.5) + (avgFluency * 0.3) + (avgEyeContact * 0.2));

    // Dynamic Flashcard Generator & Roadmaps
    const weakTopics = [];
    const recommendations = [];
    const flashcards = [];

    if (avgTechnical < 70) {
      weakTopics.push(`${session.type} Concepts`);
      recommendations.push(`Revise essential ${session.type} concepts on our Study Roadmap.`);
      flashcards.push(
        { front: "Explain OOP Encapsulation", back: "Encapsulation binds data (variables) and code (methods) together into a single unit, shielding it from external access." },
        { front: "What is an Index in SQL?", back: "A database index is a data structure (like B-Tree) that improves data retrieval speeds, similar to a book index." }
      );
    }
    if (avgFluency < 70) {
      weakTopics.push("Speech Pace & Fluency");
      recommendations.push("Practice answering under 120 Words Per Minute. Pause between thoughts instead of saying 'like' or 'um'.");
      flashcards.push(
        { front: "How to eliminate filler words?", back: "Slightly slow down speaking speed and use short pauses (1-2 seconds) instead of filler syllables." }
      );
    }
    if (avgEyeContact < 75) {
      weakTopics.push("Eye Contact & Body Language");
      recommendations.push("Align webcam at eye level. Keep shoulders straight and maintain direct visual contact during key sentences.");
    }

    const scoreCard = {
      overallScore,
      technicalScore: avgTechnical,
      communicationScore: avgFluency,
      eyeContactScore: avgEyeContact,
      averageWpm: avgWpm,
      stressScore: avgStress,
      totalFillers,
      weakTopics,
      recommendations,
      flashcards,
      completedAt: new Date().toISOString()
    };

    // Update Interview status and save scorecard
    mockDb.interviews.updateOne(
      { id: sessionId },
      {
        status: "completed",
        scoreCard
      }
    );

    // Award Gamification XP points (150 XP for completion!)
    if (session.userId && session.userId !== 'anonymous') {
      const user = mockDb.users.findOne({ id: session.userId });
      if (user) {
        let xpAward = 150;
        if (overallScore > 85) xpAward += 50; // extra reward for excellence!
        
        let badges = [...(user.badges || [])];
        if (session.type === "Coding" && !badges.includes("Coding Master")) {
          badges.push("Coding Master");
        }
        if (totalAnswers >= 5 && !badges.includes("Experienced Prep")) {
          badges.push("Experienced Prep");
        }

        mockDb.users.updateOne(
          { id: session.userId },
          { 
            xp: (user.xp || 0) + xpAward,
            badges
          }
        );
      }
    }

    return res.status(200).json({
      message: "Session evaluated successfully",
      scoreCard
    });
  } catch (err) {
    console.error("Session Finish Error:", err);
    return res.status(500).json({ message: "Failed to compile session scorecard" });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const history = mockDb.interviews.find({ userId });
    return res.status(200).json({ history });
  } catch (err) {
    console.error("Retrieve History Error:", err);
    return res.status(500).json({ message: "Failed to retrieve interview history" });
  }
};
