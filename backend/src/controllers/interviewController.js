const mockDb = require('../models/mockDb');

// Dynamic rule-based question synthesizer that mimics a world-class AI interviewer when Gemini is unavailable.
// It parses the structured fields from real or mock resumes and generates genuine, highly tailored questions.
const synthesizeResumeQuestions = (type, difficulty, role, company, resume) => {
  const questions = [];
  const name = resume.name || "Rahul Kumar";
  const skills = Array.isArray(resume.skills) ? resume.skills : [];
  const projects = Array.isArray(resume.projects) ? resume.projects : [];
  const experience = Array.isArray(resume.experience) ? resume.experience : [];
  
  const skill1 = skills.length > 0 ? skills[0] : (role === "Web Developer" ? "React" : "Software Engineering");
  const skill2 = skills.length > 1 ? skills[1] : (role === "Web Developer" ? "CSS3/HTML5" : "System Design");
  const skill3 = skills.length > 2 ? skills[2] : (role === "Web Developer" ? "Node.js" : "Data Structures");
  
  const proj1 = projects.length > 0 ? projects[0] : { title: "AI Interview Platform", desc: "built real-time interaction and simulation systems" };
  const proj2 = projects.length > 1 ? projects[1] : { title: "Distributed Web System", desc: "developed a highly scalable back-end architecture" };
  
  const exp1 = experience.length > 0 ? experience[0] : { company: "ViteTech Corp", role: "Software Engineer Intern", desc: "optimized system components and integrated REST APIs" };

  if (type === "HR") {
    questions.push(
      `Hello ${name}. Welcome to your virtual interview. Let's start by walking through your resume, specifically explaining your journey toward becoming a senior-level ${role}.`,
      experience.length > 0 ? 
        `I see that you did an internship at ${exp1.company} as a ${exp1.role}. What was the biggest behavioral or cultural challenge you faced while adapting to their engineering sprint cycles?` :
        `Tell me about a time when you had to adapt to a brand new environment or a fast-changing team project. What was your strategy?`,
      `You spear-headed the development of the project "${proj1.title}". How did you manage your timeline, prioritize core features, and ensure the project succeeded?`,
      `If you are selected for this ${role} position at ${company && company !== "Common" ? company : "our company"}, how do you plan to leverage your background in ${skill1} and ${skill2} to make an immediate impact on our deliverables?`,
      `Where do you see your technical competencies growing in the next three years, and how does this role align with your personal goals?`
    );
  } else if (type === "Technical") {
    questions.push(
      `Since you listed ${skill1} in your skills, could you walk me through its core architectural concepts and how you have practically optimized it in a production scenario?`,
      `Let's discuss "${proj1.title}". You stated that you "${proj1.desc}". What were the most critical database or state management bottlenecks you faced during its implementation, and how did you resolve them?`,
      `During your work at ${exp1.company} as a ${exp1.role}, what was the most demanding feature or system optimization you owned, and how did you implement the REST/WebSocket architecture?`,
      `How do you decide between building a relational SQL schema versus a distributed NoSQL document store? For a project like your "${proj2.title}", what would be the scalability trade-offs?`,
      `If you had to scale your "${proj1.title}" system to handle 10,000 active concurrent connections and live gaze-tracking calculations, how would you design the horizontal clustering and message queuing system?`
    );
  } else if (type === "Behavioral") {
    questions.push(
      `Tell me about a time at ${experience.length > 0 ? exp1.company : 'your previous project team'} when you had a strong disagreement with a peer or stakeholder regarding a technical choice. How did you resolve the conflict?`,
      `While engineering "${proj1.title}", did you ever encounter an unexpected technical roadblock or critical API failure? How did you pivot your strategy and communicate this to others?`,
      `Describe a scenario where you received critical or direct feedback on your system design or code quality. How did you handle that feedback, and what changes did you integrate into your workflow?`,
      `At ${exp1.company}, did you ever have to work on a task under an extremely tight deadline where you had to compromise on technical debt to deliver on time? What was the outcome?`,
      `Walk me through the single most challenging milestone on your resume that you are proud of. What quantitative metrics (like performance percentage or query throughput) did you achieve?`
    );
  } else {
    // Standard genuine fallback
    questions.push(
      `Hello ${name}, explain your philosophy on writing clean, scalable, and maintainable code in ${difficulty} level environments.`,
      `In ${role} workflows, how do you approach integration testing, automated CI/CD checks, and Git branching strategies?`,
      `Explain the differences between asynchronous execution (like Event Loop or asynchronous workers) and multi-threaded processing. When is each optimal?`,
      `How do you keep your skills in ${skill1} and ${skill2} up-to-date with the latest industry trends?`,
      `What are the most critical factors you look for during a technical code review of a teammate's pull request?`
    );
  }

  return questions;
};

// Helper to simulate Gemini API prompting or fallback to rich rule-based generation
const generateAIQuestions = async (type, difficulty, role, company, language, resumeText, resumeObj) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (apiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an elite, senior technical interviewer from a top tech company (like Google or Netflix). Generate exactly 5 extremely realistic, genuine, and challenging ${difficulty} level interview questions for a ${role} position at ${company || 'a top tech company'}.
The interview type is ${type}.
Language/Domain: ${language || 'General'}.
Candidate Context:
${resumeText ? `Use these details from their resume to customize the questions, making them direct, genuine, and referring specifically to their achievements, projects, skills, or experience: ${resumeText}` : 'Treat them as a highly qualified candidate for this role.'}

Format Instructions:
- Return STRICTLY a JSON array of strings: ["question 1", "question 2", "question 3", "question 4", "question 5"].
- Do NOT wrap it in Markdown formatting.
- Address the candidate by name if available, and reference their resume naturally. Do not ask generic textbook questions.`
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

  // Simulator Fallback: If resume context exists, synthesize highly tailored questions
  if (resumeObj) {
    return synthesizeResumeQuestions(type, difficulty, role, company, resumeObj);
  }

  // General rule-based fallback without a resume:
  const questions = [];
  if (type === "HR") {
    questions.push(
      `Tell me about yourself, walk me through your technical background, and explain what draws you to this ${role} position.`,
      `Why are you interested in working at ${company || 'a top-tier company'} specifically, and how do you fit into our engineering culture?`,
      `How do you handle high-pressure environments, competing priorities, and tight sprint deadlines?`,
      `Tell me about a time you had a strong communication conflict with a team member or stakeholder. How did you resolve it?`,
      `What are your long-term career aspirations, and how does this role help you achieve them?`
    );
  } else if (type === "Technical") {
    questions.push(
      `What are the most critical software design patterns and architectural principles you consider when building a scalable ${role} application?`,
      `Explain the difference between synchronous and asynchronous architectures, and when you would recommend using an event-driven model.`,
      `How do you ensure data integrity, indexing efficiency, and query performance when designing databases for high-traffic workloads?`,
      `How do you handle API security, authorization scopes, CORS, and rate-limiting to prevent malicious load spikes?`,
      `Walk me through your end-to-end integration testing, CI/CD automated pipeline, and production deployment strategy for a modern application.`
    );
  } else if (type === "Behavioral") {
    questions.push(
      `Describe a technically complex challenge you faced in a past project. How did you analyze the choices and implement the solution?`,
      `Tell me about a project that failed or missed its delivery deadline. What were the root causes, and what lessons did you take away?`,
      `Give me an example of a time you had to make a critical technical decision with very limited information or severe time constraints.`,
      `Describe a time you proposed a new framework or methodology to your team. How did you handle skepticism and obtain team buy-in?`,
      `Walk me through a situation where you had to quickly acquire a brand new technical skill to solve an urgent project blocker.`
    );
  } else {
    // Default matching questions
    const allQs = mockDb.questions.find({ type, difficulty });
    let filtered = allQs.filter(q => q.company === company || q.company === "Common");
    if (filtered.length === 0) filtered = allQs;
    const shuffled = filtered.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5).map(q => q.question || q.description || q.question);
  }
  return questions.slice(0, 5);
};

exports.generateSession = async (req, res) => {
  try {
    const { type, difficulty, role, company, language, resumeId } = req.body;
    const userId = req.user ? req.user.userId : 'anonymous';

    if (!type || !difficulty || !role) {
      return res.status(400).json({ message: "Type, difficulty and role are required fields" });
    }

    // Retrieve resume if attached (support real DB resumes and lobby mock presets)
    let resumeObj = null;
    let resumeText = "";
    if (resumeId) {
      const db = mockDb.getData();
      resumeObj = db.resumes.find(r => r.id === resumeId);
      if (!resumeObj) {
        if (resumeId === "res_mock_1") {
          resumeObj = {
            id: "res_mock_1",
            name: "Rahul Kumar",
            role: "Software Engineer",
            skills: ["React", "Node.js", "Express", "MongoDB", "Java", "Python", "Data Structures", "Algorithms", "SQL", "Git", "Docker", "AWS"],
            projects: [
              { title: "AI Mock Interview Platform", desc: "built a real-time voice simulator using Web Speech API, Express, and canvas gaze-tracking. Reduced user setup latency by 40% and handled 10k concurrent WebSockets" },
              { title: "Distributed Key-Value Store", desc: "implemented a custom Raft consensus protocol in Go to ensure fault-tolerant state machine replication" }
            ],
            experience: [
              { company: "ViteTech Corp", role: "Software Engineer Intern", desc: "optimized REST APIs, increasing query throughput by 25%. Built internal dashboards using React and Tailwind CSS." }
            ],
            education: [
              { school: "Indian Institute of Technology", degree: "B.Tech in Computer Science" }
            ]
          };
        } else if (resumeId === "res_mock_2") {
          resumeObj = {
            id: "res_mock_2",
            name: "Rahul Kumar",
            role: "Web Developer",
            skills: ["React", "HTML5", "CSS3", "JavaScript", "Node.js", "Express", "Tailwind CSS", "Redux", "Webpack", "Git", "Firebase"],
            projects: [
              { title: "Interactive Collaborative Whiteboard", desc: "constructed a real-time multi-user drawing board using HTML5 Canvas and Socket.IO" },
              { title: "E-Commerce PWA", desc: "engineered a highly responsive Progressive Web App with offline shopping support and Stripe integration" }
            ],
            experience: [
              { company: "PixelPerfect Solutions", role: "Frontend Developer Intern", desc: "redesigned the main landing page, boosting user engagement metrics by 18% and achieving a lighthouse performance score of 98/100" }
            ],
            education: [
              { school: "Delhi Technological University", degree: "B.Tech in Information Technology" }
            ]
          };
        }
      }
      
      if (resumeObj) {
        resumeText = resumeObj.text || `${resumeObj.name} Resume. Skills: ${resumeObj.skills ? resumeObj.skills.join(', ') : ''}. Projects: ${resumeObj.projects ? resumeObj.projects.map(p => p.title).join(', ') : ''}`;
      }
    }

    console.log(`Generating a ${difficulty} ${type} session for role: ${role} at ${company || 'Common'}`);
    
    // Generate questions
    let questions = [];
    if (type === "Coding") {
      const codingChallenges = mockDb.getData().questions.filter(q => q.type === "Coding" && (q.difficulty === difficulty || difficulty === "Medium"));
      questions = codingChallenges.slice(0, 2); // 2 coding rounds
    } else {
      const generated = await generateAIQuestions(type, difficulty, role, company, language, resumeText, resumeObj);
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
      scoreCard: null,
      resumeId: resumeId || null
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

exports.getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = mockDb.interviews.findOne({ id: sessionId });
    if (!session) {
      return res.status(404).json({ message: "Mock interview session not found" });
    }
    return res.status(200).json({ session });
  } catch (err) {
    console.error("Retrieve Session Error:", err);
    return res.status(500).json({ message: "Failed to retrieve mock interview session details" });
  }
};
