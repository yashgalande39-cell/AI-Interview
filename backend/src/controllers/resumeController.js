const mockDb = require('../models/mockDb');
const pdfParse = require('pdf-parse');
const { generateATSSuggestions, parseResumeText } = require('../services/ai/resumeAnalyzer');

const computeATSAnalysis = (data) => {
  const { name, email, phone, role, skills, experience, projects, education } = data;
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

  return {
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
};

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

    const analysis = computeATSAnalysis({
      name,
      email,
      phone,
      role,
      skills,
      experience,
      projects,
      education
    });

    // === AI-Powered ATS Suggestions (OpenRouter) ===
    try {
      const aiSuggestions = await generateATSSuggestions(
        { name, email, phone, skills, experience, projects, education },
        role,
        analysis.atsScore,
        analysis.missingSkills
      );
      if (Array.isArray(aiSuggestions) && aiSuggestions.length > 0) {
        // Merge AI suggestions with rule-based ones (AI takes priority)
        analysis.suggestions = [...aiSuggestions, ...analysis.suggestions.slice(0, 1)];
        console.log(`✅ OpenRouter generated ${aiSuggestions.length} AI ATS suggestions`);
      }
    } catch (aiErr) {
      console.warn('AI ATS suggestions unavailable, using rule-based:', aiErr.message);
    }

    // Save resume analytical record
    const savedRecord = mockDb.resumes.create({
      userId,
      name,
      email,
      phone: phone || "",
      education: education || [],
      experience: experience || [],
      skills: skills || [],
      projects: projects || [],
      targetRole: role,
      atsScore: analysis.atsScore,
      analysisData: analysis,
      text: `${name} Resume. Email: ${email}. Skills: ${skills.join(', ')}. Projects: ${projects.map(p => p.title).join(', ')}`
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

exports.uploadResume = async (req, res) => {
  try {
    const file = req.file;
    const userId = req.user ? req.user.userId : 'anonymous';

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let rawText = "";
    if (file.mimetype === 'application/pdf') {
      try {
        const parsedPdf = await pdfParse(file.buffer);
        rawText = parsedPdf.text;
      } catch (pdfErr) {
        console.error("PDF Parsing Error, falling back to text read:", pdfErr);
        rawText = file.buffer.toString('utf-8');
      }
    } else {
      rawText = file.buffer.toString('utf-8');
    }

    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ message: "Uploaded file is empty or text could not be extracted" });
    }

    // === Try OpenRouter first for resume parsing (higher quality) ===
    let parsedData = {};
    let parsedWithAI = false;

    try {
      parsedData = await parseResumeText(rawText);
      parsedWithAI = true;
      console.log(`✅ OpenRouter parsed resume for: ${parsedData.name}`);
    } catch (e) {
      console.warn('OpenRouter resume parsing failed, trying Gemini fallback:', e.message);
    }

    // Gemini fallback if OpenRouter failed
    if (!parsedWithAI) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        try {
          const prompt = `You are a resume parsing AI. Parse this resume and return ONLY a JSON object:\n${rawText.slice(0, 3000)}\n\nJSON structure: {"name":...,"email":...,"phone":...,"skills":[...],"experience":[{"company":...,"role":...,"duration":...,"desc":...}],"projects":[{"title":...,"desc":...,"tech":...}],"education":[{"school":...,"degree":...,"year":...}],"targetRole":...}`;
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          const data = await response.json();
          if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            const respText = data.candidates[0].content.parts[0].text;
            parsedData = JSON.parse(respText.replace(/```json|```/g, '').trim());
            parsedWithAI = true;
          }
        } catch (err) {
          console.warn('Gemini fallback also failed, using regex extraction:', err.message);
        }
      }
    }

    // Fallback if Gemini failed or wasn't available
    if (!parsedData.name) {
      parsedData.name = "Extracted Candidate";
      parsedData.email = "";
      parsedData.phone = "";
      parsedData.skills = [];
      parsedData.experience = [];
      parsedData.projects = [];
      parsedData.education = [];
      parsedData.targetRole = "Software Engineer";

      // Basic regex scans for fallback
      const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
      const emailMatch = rawText.match(emailRegex);
      if (emailMatch) parsedData.email = emailMatch[0];

      const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
      const phoneMatch = rawText.match(phoneRegex);
      if (phoneMatch) parsedData.phone = phoneMatch[0];

      const commonSkills = ["React", "JavaScript", "Node.js", "Python", "Java", "C++", "HTML", "CSS", "SQL", "Docker", "Git", "AWS", "Machine Learning", "Deep Learning", "Excel"];
      commonSkills.forEach(s => {
        if (rawText.toLowerCase().includes(s.toLowerCase())) {
          parsedData.skills.push(s);
        }
      });
    }

    const role = parsedData.targetRole || "Software Engineer";
    const analysis = computeATSAnalysis({
      name: parsedData.name,
      email: parsedData.email,
      phone: parsedData.phone,
      role,
      skills: parsedData.skills,
      experience: parsedData.experience,
      projects: parsedData.projects,
      education: parsedData.education
    });

    // Save resume to mock DB
    const savedRecord = mockDb.resumes.create({
      userId,
      name: parsedData.name,
      email: parsedData.email,
      phone: parsedData.phone,
      education: parsedData.education,
      experience: parsedData.experience,
      skills: parsedData.skills,
      projects: parsedData.projects,
      targetRole: role,
      text: rawText,
      filename: file.originalname,
      atsScore: analysis.atsScore,
      analysisData: analysis
    });

    // Award XP (50 XP for uploading resume!)
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
      message: "Resume uploaded and analyzed successfully",
      resume: savedRecord
    });
  } catch (err) {
    console.error("Resume Upload/Analyze Error:", err);
    return res.status(500).json({ message: "Failed to upload and analyze resume" });
  }
};

exports.getUserResumes = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : 'anonymous';
    // Find all resumes uploaded by this user in mock DB
    const resumes = mockDb.resumes.find({ userId });
    return res.status(200).json({ resumes });
  } catch (err) {
    console.error("Get User Resumes Error:", err);
    return res.status(500).json({ message: "Failed to fetch user resumes" });
  }
};
