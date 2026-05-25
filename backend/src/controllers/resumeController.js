const mockDb = require('../models/mockDb');

exports.buildResume = async (req, res) => {
  try {
    const { name, email, phone, education, experience, skills, projects } = req.body;
    const userId = req.user ? req.user.userId : 'anonymous';

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required to construct a resume" });
    }

    // Save resume to mock DB
    const newResume = mockDb.resumes.create({
      userId,
      name,
      email,
      phone: phone || "",
      education: education || [],
      experience: experience || [],
      skills: skills || [],
      projects: projects || [],
      text: `${name} Resume. Email: ${email}. Skills: ${skills.join(', ')}. Projects: ${projects.map(p => p.title).join(', ')}`
    });

    // Award XP (50 XP for constructing resume!)
    if (userId !== 'anonymous') {
      const user = mockDb.users.findOne({ id: userId });
      if (user) {
        mockDb.users.updateOne(
          { id: userId },
          { xp: (user.xp || 0) + 50 }
        );
      }
    }

    return res.status(200).json({
      message: "Resume saved successfully",
      resume: newResume
    });
  } catch (err) {
    console.error("Resume Build Error:", err);
    return res.status(500).json({ message: "Failed to construct resume" });
  }
};

exports.analyzeResume = async (req, res) => {
  try {
    const { role, skills } = req.body; // Expects skills listed in the resume and targeted job role
    const userId = req.user ? req.user.userId : 'anonymous';

    if (!role) {
      return res.status(400).json({ message: "Target Job Role is required for ATS analysis" });
    }

    const providedSkills = Array.isArray(skills) ? skills : [];
    
    // Core keywords based on target roles
    const roleKeywords = {
      "Software Engineer": ["Data Structures", "Algorithms", "System Design", "Git", "Java", "Python", "C++", "DBMS"],
      "Web Developer": ["React", "HTML5", "CSS3", "JavaScript", "Node.js", "Express", "REST APIs", "Tailwind CSS"],
      "Data Analyst": ["Python", "SQL", "Excel", "Tableau", "Pandas", "PowerBI", "Statistics", "Machine Learning"],
      "AI/ML Engineer": ["Python", "PyTorch", "TensorFlow", "Deep Learning", "NLP", "Computer Vision", "Scikit-Learn"],
      "Cybersecurity Analyst": ["Network Security", "Cryptography", "Penetration Testing", "Linux", "Firewalls", "Wireshark"]
    };

    const targetKeywords = roleKeywords[role] || roleKeywords["Software Engineer"];
    const matchingSkills = providedSkills.filter(s => 
      targetKeywords.some(tk => tk.toLowerCase() === s.toLowerCase() || s.toLowerCase().includes(tk.toLowerCase()))
    );

    const missingKeywords = targetKeywords.filter(tk => 
      !providedSkills.some(ps => ps.toLowerCase() === tk.toLowerCase() || ps.toLowerCase().includes(tk.toLowerCase()))
    );

    // Compute ATS Score
    const matchRatio = matchingSkills.length / targetKeywords.length;
    let atsScore = Math.round(40 + (matchRatio * 50));
    atsScore = Math.max(45, Math.min(98, atsScore));

    // Dynamic tailored questions mapping based on candidate skills
    const mappedQuestions = providedSkills.slice(0, 3).map(skill => 
      `In your resume, you listed ${skill}. Can you walk me through a complex problem you solved using this technology?`
    );

    // Provide default generic questions if no skills mapped
    if (mappedQuestions.length === 0) {
      mappedQuestions.push(
        "Walk me through the most technically challenging software project you've listed on your resume.",
        "How do you handle testing and code reviews in your personal project workflow?",
        "Explain how you design scale configurations for data structures in your application."
      );
    }

    const analysis = {
      atsScore,
      targetRole: role,
      matchedSkills: matchingSkills,
      missingSkills: missingKeywords,
      suggestions: [
        `Consider adding key technologies: ${missingKeywords.slice(0, 3).join(', ')} to boost your score above 85%.`,
        "Write detailed metric-focused bullet points for your projects (e.g., 'Optimized system efficiency by 25%').",
        "Include links to live project demos and your active GitHub profile directly under project headers."
      ],
      recommendedQuestions: mappedQuestions
    };

    // Save resume analytical record
    const savedRecord = mockDb.resumes.create({
      userId,
      targetRole: role,
      atsScore,
      analysisData: analysis
    });

    return res.status(200).json({
      message: "ATS analysis complete",
      analysis: { ...analysis, recordId: savedRecord.id }
    });
  } catch (err) {
    console.error("ATS Scanner Error:", err);
    return res.status(500).json({ message: "Failed to scan and analyze resume" });
  }
};
