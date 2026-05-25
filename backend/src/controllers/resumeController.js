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
    const { name, email, phone, role, skills, experience, projects, education } = req.body;
    const userId = req.user ? req.user.userId : 'anonymous';

    if (!role) {
      return res.status(400).json({ message: "Target Job Role is required for ATS analysis" });
    }

    const providedSkills = Array.isArray(skills) ? skills : [];
    const providedExp = Array.isArray(experience) ? experience : [];
    const providedProj = Array.isArray(projects) ? projects : [];
    const providedEdu = Array.isArray(education) ? education : [];
    
    // 1. Keyword Alignment Score (40% weight)
    const roleKeywords = {
      "Software Engineer": ["Data Structures", "Algorithms", "System Design", "Git", "Java", "Python", "C++", "DBMS", "OOP", "SQL", "Docker", "REST APIs"],
      "Web Developer": ["React", "HTML5", "CSS3", "JavaScript", "Node.js", "Express", "REST APIs", "Tailwind CSS", "TypeScript", "Redux", "Webpack", "Git"],
      "Data Analyst": ["Python", "SQL", "Excel", "Tableau", "Pandas", "PowerBI", "Statistics", "Machine Learning", "Data Mining", "NumPy", "Matplotlib", "Git"],
      "AI/ML Engineer": ["Python", "PyTorch", "TensorFlow", "Deep Learning", "NLP", "Computer Vision", "Scikit-Learn", "Neural Networks", "Keras", "Model Deployment", "Git"],
      "Cybersecurity Analyst": ["Network Security", "Cryptography", "Penetration Testing", "Linux", "Firewalls", "Wireshark", "SIEM", "Vulnerability Assessment", "CompTIA", "CISSP"]
    };

    const targetKeywords = roleKeywords[role] || roleKeywords["Software Engineer"];
    const matchingSkills = providedSkills.filter(s => 
      targetKeywords.some(tk => tk.toLowerCase() === s.toLowerCase() || s.toLowerCase().includes(tk.toLowerCase()))
    );

    const missingKeywords = targetKeywords.filter(tk => 
      !providedSkills.some(ps => ps.toLowerCase() === tk.toLowerCase() || ps.toLowerCase().includes(tk.toLowerCase()))
    );

    const keywordScore = targetKeywords.length > 0 
      ? Math.round((matchingSkills.length / targetKeywords.length) * 100) 
      : 50;

    // 2. Quantifiable Impact Score (30% weight)
    // Scan all descriptions (experience + projects) for numeric statistics, percentages, or multipliers
    let textToAnalyze = "";
    providedExp.forEach(e => {
      textToAnalyze += ` ${e.company || ""} ${e.role || ""} ${e.desc || ""}`;
    });
    providedProj.forEach(p => {
      textToAnalyze += ` ${p.title || ""} ${p.desc || ""}`;
    });

    const metricsRegexes = [
      /\b\d+%\b/,                   // percentages (e.g. 25%, 100%)
      /\$\d+(?:,\d+)*(?:\.\d+)?\b/,  // dollar metrics (e.g. $10,000, $5k)
      /\b\d+x\b/i,                  // growth multipliers (e.g. 2x, 5X)
      /\b\d+(?:\.\d+)?\s*(?:million|thousand|users|queries|ms|sec|hours|days|weeks|months|years|lbs|k|m)\b/i, // scales or time units
      /\b\d{3,}\b/                  // larger numbers (e.g. 500 users)
    ];

    let matchesCount = 0;
    metricsRegexes.forEach(regex => {
      const matches = textToAnalyze.match(new RegExp(regex, 'g'));
      if (matches) matchesCount += matches.length;
    });

    // Score based on count of dynamic metrics
    let impactScore = 20; // baseline
    if (matchesCount > 0) impactScore += 30;
    if (matchesCount > 2) impactScore += 30;
    if (matchesCount > 4) impactScore += 20;
    impactScore = Math.min(100, impactScore);

    // 3. Profile Completeness Score (30% weight)
    let completenessScore = 0;
    if (email) completenessScore += 15;
    if (phone) completenessScore += 15;
    if (providedSkills.length >= 3) completenessScore += 20;
    if (providedEdu.length >= 1 && providedEdu[0].school) completenessScore += 15;
    if (providedExp.length >= 1 && providedExp[0].company) completenessScore += 15;
    if (providedProj.length >= 1 && providedProj[0].title) completenessScore += 20;

    // 4. Compute Dynamic Overall ATS Score
    let atsScore = Math.round((keywordScore * 0.4) + (impactScore * 0.3) + (completenessScore * 0.3));
    atsScore = Math.max(35, Math.min(99, atsScore));

    // Dynamic tailored recommendations based on scorecard results
    const suggestions = [];
    if (completenessScore < 100) {
      if (!email || !phone) {
        suggestions.push("⚠️ Add complete contact coordinates (phone number and active email) to your resume header.");
      }
      if (providedEdu.length === 0 || !providedEdu[0].school) {
        suggestions.push("⚠️ Incorporate your formal education history, listing degrees and graduation years.");
      }
      if (providedExp.length === 0 || !providedExp[0].company) {
        suggestions.push("⚠️ Add professional work history or internship records to highlight career experience.");
      }
      if (providedProj.length === 0 || !providedProj[0].title) {
        suggestions.push("⚠️ Incorporate structural software project listings to showcase practical coding expertise.");
      }
    }

    if (impactScore < 80) {
      suggestions.push("📈 ATS Priority: Add more quantifiable metrics (e.g., 'Boosted efficiency by 30%', 'Reduced loading latency by 150ms') to your project and job descriptions. Recruiters favor measurable results.");
    }

    if (missingKeywords.length > 0) {
      suggestions.push(`💡 Integrate critical keywords relevant for ${role}: ${missingKeywords.slice(0, 3).join(', ')} to push your alignment score past 85%.`);
    }

    if (suggestions.length === 0) {
      suggestions.push("🏆 Excellent work! Your resume covers all core structural sections, lists dynamic keywords, and showcases measurable metrics.");
    }

    // Custom prep questions tailored directly to listed skills
    const mappedQuestions = providedSkills.slice(0, 3).map(skill => 
      `In your resume, you listed ${skill}. Can you walk me through a technically challenging problem you solved using this technology?`
    );

    if (mappedQuestions.length === 0) {
      mappedQuestions.push(
        "Walk me through the most technically complex software project you've listed on your resume.",
        "How do you handle test coverage and CI/CD pipelines in your personal project workflow?"
      );
    }

    const analysis = {
      atsScore,
      keywordScore,
      impactScore,
      completenessScore,
      targetRole: role,
      matchedSkills: matchingSkills,
      missingSkills: missingKeywords,
      suggestions: suggestions,
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
