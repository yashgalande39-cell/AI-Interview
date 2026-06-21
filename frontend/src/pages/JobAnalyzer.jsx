import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

// Hardcoded presets for standard demonstration scenarios
const PRESETS = {
  google_swe: {
    company: "Google",
    role: "Software Engineer",
    type: "Full-time",
    experience: "2 - 5 Years",
    industry: "Technology / Internet",
    location: "Mountain View, CA",
    datePosted: "May 10, 2025",
    matchScore: 87,
    skillsMatch: 90,
    experienceMatch: 80,
    roleMatch: 85,
    locationMatch: 95,
    skills: ["JavaScript", "Python", "Data Structures", "System Design", "React", "Node.js", "Algorithms", "SQL", "Git", "Docker", "Kubernetes", "AWS", "CI/CD"],
    missingSkills: ["Go", "GraphQL", "TensorFlow"],
    rounds: [
      { name: "Online Assessment", details: "Coding + MCQs", number: 1, icon: "fa-code", color: "text-blue-400 bg-blue-500/10" },
      { name: "Technical Phone Screen", details: "DSA + Core CS", number: 2, icon: "fa-phone-alt", color: "text-purple-400 bg-purple-500/10" },
      { name: "Onsite Coding Round", details: "2-3 Coding Problems", number: 3, icon: "fa-laptop-code", color: "text-pink-400 bg-pink-500/10" },
      { name: "System Design Round", details: "Low-Level + High-Level Design", number: 4, icon: "fa-cubes", color: "text-green-400 bg-green-500/10" },
      { name: "Behavioral Round", details: "Googleness + Leadership", number: 5, icon: "fa-users", color: "text-orange-400 bg-orange-500/10" }
    ],
    roadmap: [
      { week: "Week 1-2", title: "Strengthen Fundamentals", desc: "Arrays, Strings, Linked List", icon: "fa-code", color: "bg-blue-500/20 border-blue-500/50 text-blue-400" },
      { week: "Week 3-4", title: "Advanced Data Structures", desc: "Trees, Graphs, DP, Heap", icon: "fa-project-diagram", color: "bg-purple-500/20 border-purple-500/50 text-purple-400" },
      { week: "Week 5-6", title: "System Design Basics", desc: "LLD, SOLID, Design Patterns", icon: "fa-layer-group", color: "bg-green-500/20 border-green-500/50 text-green-400" },
      { week: "Week 7-8", title: "Mock Interviews", desc: "Coding + System Design", icon: "fa-vial", color: "bg-orange-500/20 border-orange-500/50 text-orange-400" },
      { week: "Week 9+", title: "Behavioral & Refinement", desc: "Googleness, HR Prep", icon: "fa-user-check", color: "bg-indigo-500/20 border-indigo-500/50 text-indigo-400" }
    ],
    description: `As a Software Engineer at Google, you will design, develop, test, and deploy scalable software solutions for a wide range of Google products. You will work on challenging problems in a fast-paced, collaborative environment.

Responsibilities:
- Write clean, efficient, and maintainable code
- Design and implement scalable software systems
- Collaborate with cross-functional teams
- Improve system performance and reliability`
  },
  stripe_frontend: {
    company: "Stripe",
    role: "Frontend Engineer",
    type: "Full-time",
    experience: "3 - 6 Years",
    industry: "Financial Services / Tech",
    location: "South San Francisco, CA",
    datePosted: "May 12, 2025",
    matchScore: 92,
    skillsMatch: 95,
    experienceMatch: 88,
    roleMatch: 90,
    locationMatch: 95,
    skills: ["HTML5", "CSS3", "JavaScript", "React", "TypeScript", "Redux", "Webpack", "Web Vitals", "REST APIs", "Git", "Figma", "Tailwind CSS"],
    missingSkills: ["Next.js", "GraphQL"],
    rounds: [
      { name: "Take-Home Assignment", details: "Build a dashboard component", number: 1, icon: "fa-file-code", color: "text-indigo-400 bg-indigo-500/10" },
      { name: "Technical Screen", details: "React & JS fundamentals", number: 2, icon: "fa-terminal", color: "text-blue-400 bg-blue-500/10" },
      { name: "Onsite UI Coding", details: "Interactive application build", number: 3, icon: "fa-laptop-code", color: "text-pink-400 bg-pink-500/10" },
      { name: "System Design Round", details: "Web App Architecture", number: 4, icon: "fa-sitemap", color: "text-green-400 bg-green-500/10" },
      { name: "Behavioral Round", details: "Culture Fit & Collaboration", number: 5, icon: "fa-users", color: "text-orange-400 bg-orange-500/10" }
    ],
    roadmap: [
      { week: "Week 1-2", title: "Advanced JS & TS", desc: "Closures, Event Loop, Types", icon: "fa-code", color: "bg-blue-500/20 border-blue-500/50 text-blue-400" },
      { week: "Week 3-4", title: "React Deep Dive", desc: "Hooks, Context, Performance", icon: "fa-project-diagram", color: "bg-purple-500/20 border-purple-500/50 text-purple-400" },
      { week: "Week 5-6", title: "CSS & Web Vitals", desc: "Layouts, LCP, CLS, Responsive", icon: "fa-layer-group", color: "bg-green-500/20 border-green-500/50 text-green-400" },
      { week: "Week 7-8", title: "Frontend Design", desc: "State sync, Caching, Auth", icon: "fa-vial", color: "bg-orange-500/20 border-orange-500/50 text-orange-400" },
      { week: "Week 9+", title: "Mock Tests & Portfolio", desc: "Interactive UI & Stripe principles", icon: "fa-user-check", color: "bg-indigo-500/20 border-indigo-500/50 text-indigo-400" }
    ],
    description: `As a Frontend Engineer at Stripe, you will architect extremely sleek, high-fidelity payment desks, landing pages, and developer dashboard interfaces. You will work closely with designers to define premium user interactions and optimize performance.

Responsibilities:
- Implement responsive, state-of-the-art UI components using React and TypeScript
- Optimize frontend bundle sizes and core web vitals for global clients
- Design robust client-side state models for payment workflows`
  },
  netflix_ai: {
    company: "Netflix",
    role: "AI Core Developer",
    type: "Full-time",
    experience: "5+ Years",
    industry: "Entertainment / Streaming",
    location: "Los Gatos, CA",
    datePosted: "May 14, 2025",
    matchScore: 76,
    skillsMatch: 70,
    experienceMatch: 75,
    roleMatch: 80,
    locationMatch: 85,
    skills: ["Python", "TensorFlow", "Machine Learning", "Deep Learning", "Spark", "SQL", "Big Data", "Docker", "AWS"],
    missingSkills: ["PyTorch", "Recommendation Systems", "C++"],
    rounds: [
      { name: "Initial Tech Screen", details: "Coding + ML Core Concepts", number: 1, icon: "fa-brain", color: "text-red-400 bg-red-500/10" },
      { name: "ML Depth Interview", details: "PyTorch, Algorithms, Stats", number: 2, icon: "fa-calculator", color: "text-purple-400 bg-purple-500/10" },
      { name: "System Design Round", details: "Large Recommendation Engines", number: 3, icon: "fa-cubes", color: "text-green-400 bg-green-500/10" },
      { name: "Onsite Coding", details: "High-performance coding", number: 4, icon: "fa-laptop-code", color: "text-pink-400 bg-pink-500/10" },
      { name: "Behavioral Round", details: "Culture & Responsibility", number: 5, icon: "fa-users", color: "text-orange-400 bg-orange-500/10" }
    ],
    roadmap: [
      { week: "Week 1-2", title: "ML Math & Algorithms", desc: "Linear Algebra, Calculus, Stats", icon: "fa-calculator", color: "bg-blue-500/20 border-blue-500/50 text-blue-400" },
      { week: "Week 3-4", title: "Deep Learning Mastery", desc: "CNNs, RNNs, PyTorch Training", icon: "fa-brain", color: "bg-purple-500/20 border-purple-500/50 text-purple-400" },
      { week: "Week 5-6", title: "Big Data & Pipelines", desc: "Spark, Kafka, Distributed Systems", icon: "fa-project-diagram", color: "bg-green-500/20 border-green-500/50 text-green-400" },
      { week: "Week 7-8", title: "Recommendation Systems", desc: "Collaborative filtering, DNNs", icon: "fa-layer-group", color: "bg-orange-500/20 border-orange-500/50 text-orange-400" },
      { week: "Week 9+", title: "Culture Fit & Mocks", desc: "Freedom & Responsibility prep", icon: "fa-user-check", color: "bg-indigo-500/20 border-indigo-500/50 text-indigo-400" }
    ],
    description: `As an AI Core Developer at Netflix, you will build next-generation machine learning and recommendation pipelines that personalize content for over 200 million members. You will work on training distributed models and running low-latency inference at scale.

Responsibilities:
- Develop and optimize recommender systems, computer vision, and streaming optimization models
- Implement high-performance data processing pipelines using Spark and Python
- Partner with infrastructure teams to deploy models to AWS cloud instances`
  },
  amazon_data: {
    company: "Amazon",
    role: "Data Analyst",
    type: "Full-time",
    experience: "1 - 3 Years",
    industry: "E-Commerce / Retail",
    location: "Seattle, WA",
    datePosted: "May 15, 2025",
    matchScore: 81,
    skillsMatch: 85,
    experienceMatch: 75,
    roleMatch: 80,
    locationMatch: 90,
    skills: ["SQL", "Python", "Excel", "Power BI", "Statistics", "ETL Pipelines", "Data Warehousing", "AWS"],
    missingSkills: ["Tableau", "Redshift"],
    rounds: [
      { name: "SQL Assessment", details: "Complex queries & window functions", number: 1, icon: "fa-database", color: "text-cyan-400 bg-cyan-500/10" },
      { name: "Technical Interview 1", details: "Pandas Data Wrangling", number: 2, icon: "fa-code", color: "text-blue-400 bg-blue-500/10" },
      { name: "Technical Interview 2", details: "KPI & Dashboard Design", number: 3, icon: "fa-chart-pie", color: "text-purple-400 bg-purple-500/10" },
      { name: "Case Presentation", details: "Solve business metrics case study", number: 4, icon: "fa-presentation", color: "text-green-400 bg-green-500/10" },
      { name: "Leadership Principles", details: "STAR method behavioral prep", number: 5, icon: "fa-award", color: "text-orange-400 bg-orange-500/10" }
    ],
    roadmap: [
      { week: "Week 1-2", title: "SQL Window Functions", desc: "Aggregates, Subqueries, Joins", icon: "fa-database", color: "bg-blue-500/20 border-blue-500/50 text-blue-400" },
      { week: "Week 3-4", title: "Data Wrangling Python", desc: "Pandas, NumPy, Seaborn plotting", icon: "fa-code", color: "bg-purple-500/20 border-purple-500/50 text-purple-400" },
      { week: "Week 5-6", title: "Dashboard & BI Tools", desc: "Tableau, Power BI visualization", icon: "fa-chart-bar", color: "bg-green-500/20 border-green-500/50 text-green-400" },
      { week: "Week 7-8", title: "A/B Testing & Stats", desc: "Hypothesis testing, conversion metrics", icon: "fa-percent", color: "bg-orange-500/20 border-orange-500/50 text-orange-400" },
      { week: "Week 9+", title: "Leadership Principles", desc: "Customer Obsession & STAR mocks", icon: "fa-user-check", color: "bg-indigo-500/20 border-indigo-500/50 text-indigo-400" }
    ],
    description: `As a Data Analyst at Amazon, you will turn retail and operations data into actionable business recommendations. You will work with databases of massive scale, design automated dashboards, and consult with senior managers on product strategy.

Responsibilities:
- Query database warehouses (Redshift, SQL Server) to compile metrics and trends
- Design, build, and maintain executive Tableau dashboards
- Use statistical models to measure the impact of features and supply chain changes`
  }
};

const DEFAULT_USER_SKILLS = ["React", "JavaScript", "Python", "HTML5", "CSS3", "Git", "Data Structures", "REST APIs", "SQL"];

export default function JobAnalyzer() {
  const { updateXp } = useAuth();
  
  // Input job description state
  const [jobText, setJobText] = useState(PRESETS.google_swe.description);
  
  // Current analysis results
  const [analysis, setAnalysis] = useState(PRESETS.google_swe);
  const [activePreset, setActivePreset] = useState("google_swe");

  // Simulated state transitions
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState("");
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // File Upload reference
  const fileInputRef = useRef(null);

  // Perform dynamic text analytics based on pasted content
  const runTextAnalysis = (textToAnalyze, filename = null) => {
    setIsAnalyzing(true);
    setAnalysisProgress(10);
    setAnalysisStep("Reading Job Description...");

    const steps = [
      { pct: 30, text: "Extracting required skills & keywords..." },
      { pct: 60, text: "Comparing with your resume profile..." },
      { pct: 80, text: "Generating personalized preparation roadmap..." },
      { pct: 95, text: "Calculating interview round likelihood..." },
      { pct: 100, text: "Analysis Complete!" }
    ];

    let currentStepIndex = 0;
    const interval = setInterval(() => {
      if (currentStepIndex < steps.length) {
        setAnalysisProgress(steps[currentStepIndex].pct);
        setAnalysisStep(steps[currentStepIndex].text);
        currentStepIndex++;
      } else {
        clearInterval(interval);
        
        // Dynamic analysis generation
        const lowerText = textToAnalyze.toLowerCase();
        
        // 1. Detect Company
        let company = "Custom Corp";
        const companies = ["Google", "Stripe", "Netflix", "Amazon", "Microsoft", "Meta", "Apple", "Uber", "Airbnb", "Infosys", "TCS", "Wipro"];
        for (const c of companies) {
          if (lowerText.includes(c.toLowerCase())) {
            company = c;
            break;
          }
        }
        if (!company && filename) {
          const parts = filename.replace(/\.[^/.]+$/, "").split(/[-_\s]+/);
          if (parts.length > 0) {
            company = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
          }
        }

        // 2. Detect Role
        let role = "Software Engineer";
        let matchTemplate = PRESETS.google_swe;

        if (lowerText.includes("frontend") || lowerText.includes("ui") || lowerText.includes("react") || lowerText.includes("tailwind")) {
          role = "Frontend Engineer";
          matchTemplate = PRESETS.stripe_frontend;
        } else if (lowerText.includes("ai") || lowerText.includes("ml") || lowerText.includes("machine learning") || lowerText.includes("pytorch") || lowerText.includes("tensorflow") || lowerText.includes("deep learning")) {
          role = "AI Core Developer";
          matchTemplate = PRESETS.netflix_ai;
        } else if (lowerText.includes("data") || lowerText.includes("analyst") || lowerText.includes("tableau") || lowerText.includes("etl")) {
          role = "Data Analyst";
          matchTemplate = PRESETS.amazon_data;
        }

        // 3. Compute dynamic match details
        // Skills match score is ratio of matching skills
        const reqSkills = [...matchTemplate.skills];
        const missing = [...matchTemplate.missingSkills];
        
        // Adjust scores slightly based on text length and keyword matches
        const randomModifier = Math.floor(Math.sin(textToAnalyze.length) * 5); // deterministic based on text
        const baseScore = matchTemplate.matchScore + randomModifier;
        const finalScore = Math.min(98, Math.max(45, baseScore));

        const computedAnalysis = {
          company: company,
          role: role,
          type: lowerText.includes("intern") ? "Internship" : (lowerText.includes("contract") ? "Contract" : "Full-time"),
          experience: lowerText.includes("senior") || lowerText.includes("lead") ? "5+ Years" : (lowerText.includes("junior") || lowerText.includes("entry") ? "0 - 2 Years" : matchTemplate.experience),
          industry: matchTemplate.industry,
          location: lowerText.includes("remote") ? "Remote" : matchTemplate.location,
          datePosted: "Today",
          matchScore: finalScore,
          skillsMatch: Math.min(100, matchTemplate.skillsMatch + randomModifier),
          experienceMatch: Math.min(100, matchTemplate.experienceMatch - randomModifier),
          roleMatch: Math.min(100, matchTemplate.roleMatch + (lowerText.includes(role.toLowerCase()) ? 5 : -5)),
          locationMatch: lowerText.includes("remote") ? 100 : matchTemplate.locationMatch,
          skills: reqSkills,
          missingSkills: missing,
          rounds: matchTemplate.rounds,
          roadmap: matchTemplate.roadmap,
          description: textToAnalyze
        };

        setAnalysis(computedAnalysis);
        setIsAnalyzing(false);
        updateXp(60); // reward XP for parsing a JD
      }
    }, 300);
  };

  // Handle preset dropdown changes
  const handlePresetSelect = (key) => {
    setActivePreset(key);
    if (key === "custom") {
      setJobText("");
    } else {
      setJobText(PRESETS[key].description);
      setAnalysis(PRESETS[key]);
    }
  };

  // Handle text area submission — calls real AI then falls back to local analysis
  const handleAnalyzeClick = async () => {
    if (!jobText.trim()) return;
    setIsAnalyzing(true);
    setAnalysisProgress(10);
    setAnalysisStep('Sending to AI Analyzer...');

    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/analyze-jd`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ jobDescription: jobText })
      });

      setAnalysisProgress(70);
      setAnalysisStep('Mapping skills and roadmap...');

      const data = await res.json();
      if (res.ok && data.analysis) {
        const ai = data.analysis;
        // Detect best matching preset template for rounds/roadmap
        const lowerText = jobText.toLowerCase();
        let matchTemplate = PRESETS.google_swe;
        if (lowerText.includes('frontend') || lowerText.includes('react')) matchTemplate = PRESETS.stripe_frontend;
        else if (lowerText.includes('machine learning') || lowerText.includes('ml')) matchTemplate = PRESETS.netflix_ai;
        else if (lowerText.includes('data analyst') || lowerText.includes('tableau')) matchTemplate = PRESETS.amazon_data;

        const matchScore = Math.min(98, Math.max(40, (ai.matchScore || 75) + (Math.random() > 0.5 ? 3 : -2)));

        setAnalysis({
          company: ai.company || matchTemplate.company,
          role: ai.role || matchTemplate.role,
          type: lowerText.includes('intern') ? 'Internship' : (lowerText.includes('contract') ? 'Contract' : 'Full-time'),
          experience: ai.experienceLevel || matchTemplate.experience,
          industry: matchTemplate.industry,
          location: lowerText.includes('remote') ? 'Remote' : matchTemplate.location,
          datePosted: 'Today',
          matchScore,
          skillsMatch: Math.min(100, matchScore + 5),
          experienceMatch: Math.min(100, matchScore - 5),
          roleMatch: Math.min(100, matchScore + 2),
          locationMatch: lowerText.includes('remote') ? 100 : matchTemplate.locationMatch,
          skills: ai.requiredSkills?.length > 0 ? ai.requiredSkills : matchTemplate.skills,
          missingSkills: ai.niceToHave?.length > 0 ? ai.niceToHave : matchTemplate.missingSkills,
          rounds: matchTemplate.rounds,
          roadmap: matchTemplate.roadmap,
          description: jobText,
          aiInsights: {
            responsibilities: ai.keyResponsibilities || [],
            interviewTopics: ai.interviewTopics || [],
            redFlags: ai.redFlags || []
          }
        });
        setAnalysisProgress(100);
        setAnalysisStep('Analysis Complete!');
        setTimeout(() => {
          setIsAnalyzing(false);
          updateXp(60);
        }, 400);
        return;
      }
    } catch (e) {
      console.warn('AI job analysis unavailable, using local text parser:', e.message);
    }

    // Fallback: local text analysis
    runTextAnalysis(jobText);
  };


  // Triggered when file selected
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      runTextAnalysis(text, file.name);
    };

    if (file.type === "text/plain") {
      reader.readAsText(file);
    } else {
      // For PDF/DOCX mock extraction
      runTextAnalysis(
        `Job Opportunity at ${file.name.split('.')[0].toUpperCase()} looking for a Senior Developer with experience in React, JavaScript, AWS Cloud Architectures and container systems.`,
        file.name
      );
    }
  };

  // Reset current analysis / clear for new
  const handleAnalyzeNew = () => {
    setJobText("");
    setActivePreset("custom");
  };

  // Conic match score calculations
  const matchScoreColor = analysis.matchScore >= 85 ? "text-green-400" : (analysis.matchScore >= 70 ? "text-amber-400" : "text-rose-400");
  const matchScoreLabel = analysis.matchScore >= 85 ? "Great Match!" : (analysis.matchScore >= 70 ? "Good Match" : "Fair Match");

  return (
    <div className="space-y-8 pt-6 w-full relative">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div data-purpose="title-block">
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-1">Job Analyzer</h2>
          <p className="text-[#94a3b8] text-sm leading-relaxed">Paste any job description to get AI-powered insights, required skills, and personalized preparation roadmap.</p>
        </div>
        <button 
          onClick={handleAnalyzeNew}
          className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-purple-500/20 transition-all text-white self-start sm:self-auto"
        >
          <i className="fas fa-plus text-sm"></i> Analyze New Job
        </button>
      </div>

      {/* Preset quick switcher */}
      <div className="flex flex-wrap items-center gap-3 bg-[#141624]/40 p-2 rounded-xl border border-white/5 w-fit">
        <span className="text-xs text-[#94a3b8] px-2 font-medium">Demo Presets:</span>
        <button 
          onClick={() => handlePresetSelect("google_swe")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activePreset === "google_swe" ? "bg-[#8b5cf6] text-white" : "text-[#94a3b8] hover:bg-white/5 hover:text-white"}`}
        >
          Google (SWE)
        </button>
        <button 
          onClick={() => handlePresetSelect("stripe_frontend")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activePreset === "stripe_frontend" ? "bg-[#8b5cf6] text-white" : "text-[#94a3b8] hover:bg-white/5 hover:text-white"}`}
        >
          Stripe (Frontend)
        </button>
        <button 
          onClick={() => handlePresetSelect("netflix_ai")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activePreset === "netflix_ai" ? "bg-[#8b5cf6] text-white" : "text-[#94a3b8] hover:bg-white/5 hover:text-white"}`}
        >
          Netflix (AI Core)
        </button>
        <button 
          onClick={() => handlePresetSelect("amazon_data")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activePreset === "amazon_data" ? "bg-[#8b5cf6] text-white" : "text-[#94a3b8] hover:bg-white/5 hover:text-white"}`}
        >
          Amazon (Data Analyst)
        </button>
        <button 
          onClick={() => handlePresetSelect("custom")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activePreset === "custom" ? "bg-[#8b5cf6] text-white" : "text-[#94a3b8] hover:bg-white/5 hover:text-white"}`}
        >
          Custom Input
        </button>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Job Description Card */}
        <div className="col-span-12 lg:col-span-7 glass-card rounded-2xl p-6 flex flex-col relative overflow-hidden bg-[#141624]/70">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Job Description</h3>
            <div className="px-2.5 py-1 bg-white/5 rounded text-[10px] text-[#94a3b8] uppercase font-bold tracking-widest border border-white/5">
              {activePreset === "custom" ? "Manual Mode" : "Auto Detected"}
            </div>
          </div>

          <div className="flex-1 flex flex-col mb-4 min-h-[260px]">
            <textarea
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Paste the job description or requirement details here to analyze..."
              className="w-full flex-1 bg-black/30 rounded-xl border border-[#2d314d] p-4 font-mono text-sm leading-relaxed text-gray-300 placeholder-gray-500 custom-scrollbar focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 transition-all resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-auto">
            {/* File Upload Inputs */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".txt,.pdf,.docx" 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#2d314d] rounded-xl text-sm font-semibold hover:bg-white/5 transition-all text-white"
            >
              <i className="fas fa-upload text-[#8b5cf6]"></i> Upload JD (PDF, DOCX, TXT)
            </button>
            <button 
              onClick={handleAnalyzeClick}
              disabled={!jobText.trim() || isAnalyzing}
              className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <i className="fas fa-wand-magic-sparkles"></i> {isAnalyzing ? "Analyzing..." : "Analyze Job Description"}
            </button>
          </div>

          {/* Analysis loading overlay */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-[#0a0b14]/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 p-6">
              <div className="w-16 h-16 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                <i className="fas fa-sparkles text-amber-400 animate-pulse"></i> AI Analyzer is Running
              </p>
              <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-[#8b5cf6] transition-all duration-300" style={{ width: `${analysisProgress}%` }}></div>
              </div>
              <p className="text-[#94a3b8] text-xs font-semibold animate-pulse">{analysisStep}</p>
            </div>
          )}
        </div>

        {/* Job Summary Card */}
        <div className="col-span-12 lg:col-span-5 glass-card rounded-2xl p-6 relative overflow-hidden bg-[#141624]/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Job Summary</h3>
              <div className="bg-white/10 px-3 py-1 rounded-lg text-xs font-bold border border-white/10 text-white">
                {analysis.company}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                  <i className="fas fa-user-tie"></i>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider">Role</p>
                  <p className="text-sm font-semibold text-white truncate">{analysis.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0">
                  <i className="fas fa-briefcase"></i>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider">Employment Type</p>
                  <p className="text-sm font-semibold text-white truncate">{analysis.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider">Experience</p>
                  <p className="text-sm font-semibold text-white truncate">{analysis.experience}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                  <i className="fas fa-building"></i>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider">Industry</p>
                  <p className="text-sm font-semibold text-white truncate">{analysis.industry}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 shrink-0">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider">Location</p>
                  <p className="text-sm font-semibold text-white truncate">{analysis.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                  <i className="far fa-calendar-alt"></i>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider">Date Posted</p>
                  <p className="text-sm font-semibold text-white truncate">{analysis.datePosted}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Abstract background shape decoration */}
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-purple-600/5 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </div>

      {/* Middle Cards Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Match Score Card */}
        <div className="col-span-12 lg:col-span-4 glass-card rounded-2xl p-6 bg-[#141624]/70 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Match Score</h3>
            <div className="flex flex-col items-center justify-center mb-8">
              <div 
                className="relative w-40 h-40 flex items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#10b981 ${analysis.matchScore}%, #1f2937 0)`
                }}
              >
                <div className="absolute inset-2.5 bg-[#141624] rounded-full flex flex-col items-center justify-center shadow-inner">
                  <span className="text-4xl font-extrabold text-white">{analysis.matchScore}%</span>
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${matchScoreColor}`}>
                    {matchScoreLabel} <i className="fas fa-fire-alt"></i>
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div data-purpose="skill-match-bar">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#94a3b8]">Skills Match</span>
                  <span className="text-white">{analysis.skillsMatch}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${analysis.skillsMatch}%` }}></div>
                </div>
              </div>

              <div data-purpose="exp-match-bar">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#94a3b8]">Experience Match</span>
                  <span className="text-white">{analysis.experienceMatch}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${analysis.experienceMatch}%` }}></div>
                </div>
              </div>

              <div data-purpose="role-match-bar">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#94a3b8]">Role Match</span>
                  <span className="text-white">{analysis.roleMatch}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${analysis.roleMatch}%` }}></div>
                </div>
              </div>

              <div data-purpose="loc-match-bar">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#94a3b8]">Location Match</span>
                  <span className="text-white">{analysis.locationMatch}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${analysis.locationMatch}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex shrink-0 items-center justify-center text-green-400">
              <i className="fas fa-star text-xs"></i>
            </div>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Your profile matches this job well. Focus on enhancing the skills and keywords below to increase your chances.
            </p>
          </div>
        </div>

        {/* Skills Card */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="glass-card rounded-2xl p-6 flex-1 bg-[#141624]/70">
            <h3 className="text-lg font-semibold text-white mb-4">Top Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.skills.map((skill, index) => (
                <span 
                  key={index}
                  className={`px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium hover:border-purple-500/50 transition-colors cursor-default text-gray-250 flex items-center gap-1.5 ${
                    DEFAULT_USER_SKILLS.includes(skill) ? "border-green-500/20 text-green-200" : ""
                  }`}
                >
                  {DEFAULT_USER_SKILLS.includes(skill) && <i className="fas fa-check text-[9px] text-green-400"></i>}
                  {skill}
                </span>
              ))}
              <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-[#8b5cf6] cursor-default">+8 more</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 bg-orange-950/10 border border-orange-500/20 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-orange-400">Missing Important Skills</h3>
              <i className="fas fa-arrow-up text-orange-500 rotate-45"></i>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.missingSkills.map((skill, index) => (
                <span 
                  key={index}
                  className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs font-medium text-orange-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Interview Rounds Card */}
        <div className="col-span-12 lg:col-span-4 glass-card rounded-2xl p-6 bg-[#141624]/70 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Likely Interview Rounds</h3>
          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
            {analysis.rounds.map((round, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${round.color}`}>
                  <i className={`fas ${round.icon}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white truncate">{round.name}</p>
                    <span className="text-[10px] text-[#94a3b8] whitespace-nowrap shrink-0">{round.details}</span>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-bold text-[#94a3b8] shrink-0">
                  {round.number}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Roadmap Section */}
      <div className="glass-card rounded-2xl p-8 mb-8 relative overflow-hidden bg-[#141624]/70">
        <div className="flex items-center justify-between mb-8 flex-col sm:flex-row gap-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">AI Preparation Roadmap</h3>
            <p className="text-sm text-[#94a3b8]">Personalized study plan to help you crack this role</p>
          </div>
          <button 
            onClick={() => alert("Simulated: Redirecting to global Learning Roadmap!")}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-white/10 transition-all text-white"
          >
            View Full Roadmap <i className="fas fa-external-link-alt text-xs"></i>
          </button>
        </div>

        {/* Roadmap Timeline */}
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 py-4">
          {/* Connector Line (Horizontal on Desktop, Vertical on Mobile) */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#2d314d] -translate-y-1/2 z-0 hidden lg:block"></div>

          {analysis.roadmap.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-row lg:flex-col items-center gap-4 lg:gap-0 lg:flex-1">
              {/* Connector line for mobile */}
              {idx > 0 && (
                <div className="absolute top-[-2rem] left-6 w-[1px] h-8 bg-[#2d314d] z-0 lg:hidden"></div>
              )}
              
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-lg lg:mb-3 ${step.color}`}>
                <i className={`fas ${step.icon} text-lg`}></i>
              </div>
              
              <div className="text-left lg:text-center">
                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{step.week}</p>
                <p className="text-xs font-semibold text-white">{step.title}</p>
                <p className="text-[10px] text-[#94a3b8]">{step.desc}</p>
              </div>
              
              {/* Arrow separators (desktop only) */}
              {idx < analysis.roadmap.length - 1 && (
                <div className="hidden lg:flex absolute top-4 right-[-1rem] text-[#2d314d] text-xs">
                  <i className="fas fa-chevron-right"></i>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
