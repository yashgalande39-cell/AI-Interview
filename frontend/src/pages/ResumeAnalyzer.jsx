import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';
import { 
  Plus, Trash2, UploadCloud, CheckCircle, 
  AlertTriangle, ArrowRight, ShieldCheck, Download, Award,
  Briefcase, Compass, FileText, Loader2, Star, CheckCircle2,
  Settings, Palette, RefreshCw, LayoutTemplate
} from 'lucide-react';

export default function ResumeAnalyzer() {
  const { token, updateXp } = useAuth();

  // Tab State: 'builder' or 'jobs'
  const [activeTab, setActiveTab] = useState('builder');

  // Selected Targeted job
  const [targetRole, setTargetRole] = useState('Software Engineer');

  // Input states
  const [name, setName] = useState('Rahul Kumar');
  const [email, setEmail] = useState('rahul@college.edu');
  const [phone, setPhone] = useState('+91 9876543210');
  const [skills, setSkills] = useState(['React', 'JavaScript', 'Python', 'HTML5', 'CSS3', 'Git', 'Data Structures', 'REST APIs']);
  const [newSkill, setNewSkill] = useState('');

  // CV Template Styles: 'tech' (Modern Tech), 'serif' (Executive Serif), 'creative' (Creative Dynamic)
  const [cvTemplate, setCvTemplate] = useState('tech');
  // Accent Colors: 'indigo', 'emerald', 'violet', 'rose', 'slate'
  const [cvColor, setCvColor] = useState('indigo');

  const [education, setEducation] = useState([
    { school: "IIT Bombay", degree: "B.Tech Computer Science", year: "2027" }
  ]);
  const [experience, setExperience] = useState([
    { company: "ViteTech Corp", role: "Software Intern", duration: "Summer 2025", desc: "Designed and scaled reactive payment desk interfaces, raising checkout velocity by 25%." }
  ]);
  const [projects, setProjects] = useState([
    { title: "AI Voice Interview Platform", desc: "Constructed full-stack WebSocket mock interview rooms. Optimized system API load metrics, reducing latencies by 35% under 500 parallel queries.", tech: "React, Node.js, WebSockets" }
  ]);

  // Scan stats
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Job Matchboard States
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [applicationStep, setApplicationStep] = useState(0); // 0: idle, 1: upload, 2: validate, 3: success
  const [appliedJobs, setAppliedJobs] = useState([]);

  // Curated job pool
  const jobListings = [
    {
      id: "job_1",
      company: "Google",
      logo: "🌐",
      role: "Software Engineer II",
      location: "Bangalore, India",
      salary: "₹24L - ₹32L",
      coreSkills: ["React", "JavaScript", "Python"],
      desc: "Develop next-gen UI ecosystems and model pipeline pipelines at Google Cloud."
    },
    {
      id: "job_2",
      company: "Stripe",
      logo: "💳",
      role: "Frontend Engineer",
      location: "Remote, India",
      salary: "₹18L - ₹26L",
      coreSkills: ["React", "JavaScript", "HTML5", "CSS3"],
      desc: "Architect extremely sleek, high-fidelity payment desks and dashboards."
    },
    {
      id: "job_3",
      company: "Netflix",
      logo: "🍿",
      role: "AI Core Developer",
      location: "Mumbai, India",
      salary: "₹30L - ₹42L",
      coreSkills: ["Python", "JavaScript"],
      desc: "Implement AI recommendation pipelines and predictive streaming mesh arrays."
    },
    {
      id: "job_4",
      company: "Amazon",
      logo: "📦",
      role: "Data Analyst",
      location: "Hyderabad, India",
      salary: "₹14L - ₹20L",
      coreSkills: ["Python", "SQL", "Excel"],
      desc: "Generate consumer analytics dashboards checking logistics flows."
    }
  ];

  // Accent Styles Map
  const colorStyles = {
    indigo: { text: 'text-indigo-600', border: 'border-indigo-600', bg: 'bg-indigo-600', fill: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' },
    emerald: { text: 'text-emerald-600', border: 'border-emerald-600', bg: 'bg-emerald-600', fill: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
    violet: { text: 'text-violet-600', border: 'border-violet-600', bg: 'bg-violet-600', fill: 'bg-violet-500/10 border-violet-500/20 text-violet-400' },
    rose: { text: 'text-rose-600', border: 'border-rose-600', bg: 'bg-rose-600', fill: 'bg-rose-500/10 border-rose-500/20 text-rose-400' },
    slate: { text: 'text-slate-700', border: 'border-slate-700', bg: 'bg-slate-700', fill: 'bg-slate-500/10 border-slate-500/20 text-slate-400' }
  };

  const activeColor = colorStyles[cvColor] || colorStyles.indigo;

  // Add card elements
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleAddEdu = () => {
    setEducation(prev => [...prev, { school: '', degree: '', year: '' }]);
  };

  const handleAddExp = () => {
    setExperience(prev => [...prev, { company: '', role: '', duration: '', desc: '' }]);
  };

  const handleAddProj = () => {
    setProjects(prev => [...prev, { title: '', desc: '', tech: '' }]);
  };

  // Remove card elements
  const handleRemoveEdu = (index) => {
    setEducation(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExp = (index) => {
    setExperience(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveProj = (index) => {
    setProjects(prev => prev.filter((_, i) => i !== index));
  };

  // Live ATS Scans
  const handleScanATS = async () => {
    setScanning(true);
    try {
      const res = await fetch(`${API_BASE}/resumes/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name, 
          email, 
          phone, 
          role: targetRole, 
          skills, 
          experience, 
          projects, 
          education 
        })
      });
      const data = await res.json();
      if (res.ok) {
        setScanResult(data.analysis);
        updateXp(50);
      }
    } catch (e) {
      console.warn("Server ATS parsing offline, rendering local sandbox analytical calculator", e.message);
      setTimeout(() => {
        // Fallback metric parser
        let text = "";
        experience.forEach(exp => text += ` ${exp.company} ${exp.role} ${exp.desc}`);
        projects.forEach(proj => text += ` ${proj.title} ${proj.desc}`);
        
        const hasMetrics = text.match(/\b\d+%\b/) || text.match(/\$\d+/) || text.match(/\b\d+x\b/i);
        const matching = skills.filter(s => 
          ["React", "JavaScript", "Python", "SQL", "Git", "Data Structures", "REST APIs"].includes(s)
        );
        const missing = ["System Design", "Node.js", "Express", "Docker"].filter(s => 
          !skills.includes(s)
        );
        
        const kwScore = Math.round((matching.length / 7) * 100);
        const impScore = hasMetrics ? 85 : 30;
        const compScore = 100;
        const score = Math.round((kwScore * 0.4) + (impScore * 0.3) + (compScore * 0.3));

        setScanResult({
          atsScore: Math.min(98, Math.max(35, score)),
          keywordScore: Math.min(100, kwScore),
          impactScore: impScore,
          completenessScore: compScore,
          targetRole,
          matchedSkills: matching,
          missingSkills: missing,
          suggestions: [
            !hasMetrics ? "📈 ATS Priority: Add quantifiable metrics (e.g. 'Boosted API speed by 35%') to show measurable outcomes." : "🏆 Great impact stats listed!",
            missing.length > 0 ? `💡 Consider listing target keywords: ${missing.slice(0, 2).join(', ')} to boost score.` : "🏆 Solid skill tags alignment."
          ],
          recommendedQuestions: [
            "In your resume you listed React. How do you handle virtual DOM re-renders under heavy data arrays?",
            "Explain how you design scale configurations inside your project algorithms."
          ]
        });
        updateXp(50);
      }, 1000);
    } finally {
      setScanning(false);
    }
  };

  // Job matching percentage
  const calculateMatch = (jobSkills) => {
    const matched = jobSkills.filter(js => 
      skills.some(us => us.toLowerCase() === js.toLowerCase())
    );
    return Math.round((matched.length / jobSkills.length) * 100);
  };

  // Easy Apply simulation
  const handleEasyApply = (jobId) => {
    setApplyingJobId(jobId);
    setApplicationStep(1);

    setTimeout(() => {
      setApplicationStep(2);
      
      setTimeout(() => {
        setApplicationStep(3);
        setAppliedJobs(prev => [...prev, jobId]);
        updateXp(80, "Easy Apply Applicant");
      }, 1500);
    }, 1500);
  };

  const closeApplyModal = () => {
    setApplyingJobId(null);
    setApplicationStep(0);
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-76px)]">
      
      {/* Dynamic Style Injection for standard high-fidelity prints */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #cv-preview, #cv-preview * {
            visibility: visible;
          }
          #cv-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
          }
        }
      `}} />

      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
            📄 Resume Hub & Career Planner
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Optimize ATS resume compliance and immediately scan matching active job placements based on your current skill sets.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-900 gap-2 print:hidden">
          <button
            onClick={() => setActiveTab('builder')}
            className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'builder' 
                ? 'border-violet-500 text-slate-200' 
                : 'border-transparent text-slate-500 hover:text-slate-355'
            }`}
          >
            <FileText className="w-4 h-4" /> Resume ATS Builder & Previewer
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'jobs' 
                ? 'border-violet-500 text-slate-200' 
                : 'border-transparent text-slate-500 hover:text-slate-355'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Live Career Job Matcher
          </button>
        </div>
      </div>

      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Form Builder Inputs */}
          <div className="space-y-6 print:hidden">
            
            {/* Template & Color Selector Preset Bar */}
            <div className="glass-panel rounded-3xl p-5 bg-gradient-to-r from-violet-500/5 to-slate-950/20 space-y-4">
              <div className="flex flex-wrap gap-6 items-center justify-between">
                
                {/* Template selector */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <LayoutTemplate className="w-3.5 h-3.5 text-violet-400" /> Choose Style Template
                  </span>
                  <div className="flex gap-1.5">
                    {['tech', 'serif', 'creative'].map(t => (
                      <button
                        key={t}
                        onClick={() => setCvTemplate(t)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          cvTemplate === t 
                            ? 'bg-violet-500/10 border-violet-500/30 text-violet-400' 
                            : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {t === 'tech' ? 'Modern Tech' : t === 'serif' ? 'Executive Serif' : 'Creative Column'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color picker */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5 text-violet-400" /> Accent Accent
                  </span>
                  <div className="flex gap-2">
                    {['indigo', 'emerald', 'violet', 'rose', 'slate'].map(color => (
                      <button
                        key={color}
                        onClick={() => setCvColor(color)}
                        className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                          cvColor === color ? 'border-white scale-105' : 'border-transparent'
                        } ${
                          color === 'indigo' ? 'bg-indigo-500' :
                          color === 'emerald' ? 'bg-emerald-500' :
                          color === 'violet' ? 'bg-violet-500' :
                          color === 'rose' ? 'bg-rose-500' : 'bg-slate-500'
                        }`}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Core Details Builder card */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="text-sm font-black text-slate-200 border-b border-slate-900 pb-4 uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-violet-400" /> Step-by-Step Resume Builder
              </h3>

              {/* Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-slate-950/40 border border-slate-850 focus:border-violet-500/50 rounded-xl text-xs text-slate-300 outline-none font-semibold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-950/40 border border-slate-850 focus:border-violet-500/50 rounded-xl text-xs text-slate-300 outline-none font-semibold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Phone Number</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-950/40 border border-slate-850 focus:border-violet-500/50 rounded-xl text-xs text-slate-300 outline-none font-semibold" />
                </div>
              </div>

              {/* Target Role for ATS checks */}
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Target Placement Role</label>
                <select 
                  value={targetRole} 
                  onChange={e => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 outline-none font-bold"
                >
                  <option value="Software Engineer">Software Engineer (SDE)</option>
                  <option value="Web Developer">Web Developer (Full Stack)</option>
                  <option value="Data Analyst">Data Analyst (Analytics)</option>
                  <option value="AI/ML Engineer">AI/ML Engineer (Model Pipelines)</option>
                  <option value="Cybersecurity Analyst">Cybersecurity Analyst (SecOps)</option>
                </select>
              </div>

              {/* Skills tags list */}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Skills Inventory</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newSkill} 
                    onChange={e => setNewSkill(e.target.value)} 
                    placeholder="Type skill and press Enter (e.g. Node.js)"
                    onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                    className="w-full px-3 py-2.5 bg-slate-950/40 border border-slate-850 rounded-xl text-xs text-slate-300 outline-none font-semibold" 
                  />
                  <button onClick={handleAddSkill} className="px-5 py-2 bg-slate-900 border border-slate-800 text-xs font-black uppercase text-slate-300 hover:text-white rounded-xl active:scale-95 transition-all">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {skills.map(s => (
                    <span key={s} className="px-2.5 py-1 bg-slate-900/60 border border-slate-855 text-slate-300 text-[10px] font-bold rounded-lg flex items-center gap-1.5 shadow-sm">
                      {s}
                      <Trash2 className="w-3.5 h-3.5 text-rose-500 cursor-pointer hover:text-rose-400" onClick={() => setSkills(prev => prev.filter(t => t !== s))} />
                    </span>
                  ))}
                </div>
              </div>

              {/* Dynamic Education list */}
              <div className="space-y-4 pt-4 border-t border-slate-900/60">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Education History</label>
                  <button onClick={handleAddEdu} className="p-1 text-violet-400 hover:underline text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Credentials</button>
                </div>
                {education.map((edu, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950/20 border border-slate-900 space-y-3 relative">
                    <button 
                      onClick={() => handleRemoveEdu(idx)}
                      className="absolute right-3 top-3 text-slate-600 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-wider pl-1">School / College</span>
                        <input type="text" placeholder="e.g. IIT Bombay" value={edu.school} onChange={e => {
                          const copy = [...education]; copy[idx].school = e.target.value; setEducation(copy);
                        }} className="w-full px-3 py-2 bg-slate-950 border border-slate-855 rounded-xl text-xs text-slate-300 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-wider pl-1">Degree / Major</span>
                        <input type="text" placeholder="e.g. B.Tech CS" value={edu.degree} onChange={e => {
                          const copy = [...education]; copy[idx].degree = e.target.value; setEducation(copy);
                        }} className="w-full px-3 py-2 bg-slate-950 border border-slate-855 rounded-xl text-xs text-slate-300 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-wider pl-1">Graduation Year</span>
                        <input type="text" placeholder="e.g. 2027" value={edu.year} onChange={e => {
                          const copy = [...education]; copy[idx].year = e.target.value; setEducation(copy);
                        }} className="w-full px-3 py-2 bg-slate-950 border border-slate-855 rounded-xl text-xs text-slate-300 outline-none" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Work Experience */}
              <div className="space-y-4 pt-4 border-t border-slate-900/60">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Work Experience</label>
                  <button onClick={handleAddExp} className="p-1 text-violet-400 hover:underline text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Job History</button>
                </div>
                {experience.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950/20 border border-slate-900 space-y-3 relative">
                    <button 
                      onClick={() => handleRemoveExp(idx)}
                      className="absolute right-3 top-3 text-slate-600 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-wider pl-1">Company / Organization</span>
                        <input type="text" placeholder="e.g. ViteTech Corp" value={exp.company} onChange={e => {
                          const copy = [...experience]; copy[idx].company = e.target.value; setExperience(copy);
                        }} className="w-full px-3 py-2 bg-slate-950 border border-slate-855 rounded-xl text-xs text-slate-300 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-wider pl-1">Job Role</span>
                        <input type="text" placeholder="e.g. Software Intern" value={exp.role} onChange={e => {
                          const copy = [...experience]; copy[idx].role = e.target.value; setExperience(copy);
                        }} className="w-full px-3 py-2 bg-slate-950 border border-slate-855 rounded-xl text-xs text-slate-300 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-wider pl-1">Duration</span>
                        <input type="text" placeholder="e.g. Summer 2025" value={exp.duration} onChange={e => {
                          const copy = [...experience]; copy[idx].duration = e.target.value; setExperience(copy);
                        }} className="w-full px-3 py-2 bg-slate-950 border border-slate-855 rounded-xl text-xs text-slate-300 outline-none" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-wider pl-1">Job Details & Metrics (Highly crucial for ATS)</span>
                      <textarea 
                        placeholder="Detail your metrics here. E.g. Developed and scaled reactive checkout interfaces, raising checkout velocity by 25%." 
                        value={exp.desc} 
                        onChange={e => {
                          const copy = [...experience]; copy[idx].desc = e.target.value; setExperience(copy);
                        }} 
                        className="w-full h-16 p-3 bg-slate-950 border border-slate-855 rounded-xl text-xs text-slate-300 outline-none resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Projects */}
              <div className="space-y-4 pt-4 border-t border-slate-900/60">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Software Projects</label>
                  <button onClick={handleAddProj} className="p-1 text-violet-400 hover:underline text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Project</button>
                </div>
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950/20 border border-slate-900 space-y-3 relative">
                    <button 
                      onClick={() => handleRemoveProj(idx)}
                      className="absolute right-3 top-3 text-slate-600 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-wider pl-1">Project Title</span>
                        <input type="text" placeholder="e.g. AI Voice Platform" value={proj.title} onChange={e => {
                          const copy = [...projects]; copy[idx].title = e.target.value; setProjects(copy);
                        }} className="w-full px-3 py-2 bg-slate-950 border border-slate-855 rounded-xl text-xs text-slate-300 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-wider pl-1">Technologies Utilized</span>
                        <input type="text" placeholder="e.g. React, Node.js, WebSockets" value={proj.tech} onChange={e => {
                          const copy = [...projects]; copy[idx].tech = e.target.value; setProjects(copy);
                        }} className="w-full px-3 py-2 bg-slate-950 border border-slate-855 rounded-xl text-xs text-slate-300 outline-none" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-wider pl-1">Project Description (Add numerical metrics!)</span>
                      <textarea 
                        placeholder="E.g. Constructed WebSocket mock interview rooms. Optimized system API load metrics, reducing latencies by 35% under parallel queries." 
                        value={proj.desc} 
                        onChange={e => {
                          const copy = [...projects]; copy[idx].desc = e.target.value; setProjects(copy);
                        }} 
                        className="w-full h-16 p-3 bg-slate-950 border border-slate-855 rounded-xl text-xs text-slate-300 outline-none resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-900/60">
                <button
                  onClick={handleScanATS}
                  disabled={scanning}
                  className="bg-glow-gradient px-6 py-3.5 rounded-xl text-xs font-black text-white shadow-lg hover:shadow-violet-500/20 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" /> {scanning ? "Scanning ATS Packages..." : "Compute ATS Compliance"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Resume Preview & ATS Ratings */}
          <div className="space-y-6">
            
            {/* Detailed ATS Scorecard Result Block */}
            {scanResult && (
              <div className="glass-panel rounded-3xl p-6 border-cyan-500/25 bg-gradient-to-br from-cyan-500/5 to-slate-950/40 space-y-6 print:hidden">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">ATS Compliance Report</span>
                    <h3 className="text-sm font-black text-slate-200 mt-0.5">{scanResult.targetRole} Category</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-accentCyan block leading-none">{scanResult.atsScore}%</span>
                    <span className="text-[8px] uppercase tracking-wider font-black text-slate-500 block mt-1">Overall Grade</span>
                  </div>
                </div>

                {/* Score Breakdown Sliders */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/40 border border-slate-900 p-4 rounded-2xl">
                  {/* Keyword Score */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-wide">
                      <span>Skills Match</span>
                      <span className="text-violet-400">{scanResult.keywordScore || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500" style={{ width: `${scanResult.keywordScore || 0}%` }}></div>
                    </div>
                  </div>

                  {/* Impact Score */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-wide">
                      <span>Quantifiable Metrics</span>
                      <span className="text-emerald-400">{scanResult.impactScore || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${scanResult.impactScore || 0}%` }}></div>
                    </div>
                  </div>

                  {/* Completeness Score */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-wide">
                      <span>Profile Completion</span>
                      <span className="text-cyan-400">{scanResult.completenessScore || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500" style={{ width: `${scanResult.completenessScore || 0}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Missing Keywords tags */}
                {scanResult.missingSkills && scanResult.missingSkills.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Missing Key Tech Keywords
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {scanResult.missingSkills.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-black uppercase rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actionable Suggestions */}
                <div className="space-y-2 text-xs">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Actionable ATS Suggestions</div>
                  <ul className="text-slate-400 space-y-1.5 pl-1 leading-relaxed text-[11px] font-semibold">
                    {scanResult.suggestions.map((s, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <CheckCircle className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* dynamic interview prep questions */}
                {scanResult.recommendedQuestions && (
                  <div className="space-y-2 text-xs">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Custom Resume-driven Prep Questions</div>
                    <div className="space-y-1.5">
                      {scanResult.recommendedQuestions.map((q, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-900 text-slate-400 leading-normal font-semibold text-[10px]">
                          "{q}"
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-900 text-[9px] text-slate-500 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ATS grading verified successfully. +50 XP claimed.</span>
                </div>
              </div>
            )}

            {/* HIGH FIDELITY PRINT-READY RESUME PREVIEW */}
            <div 
              className={`bg-white text-slate-950 p-10 rounded-3xl shadow-xl space-y-6 max-h-[650px] overflow-y-auto print:max-h-none print:shadow-none print:p-0 print:m-0 print:overflow-visible ${
                cvTemplate === 'serif' ? 'font-serif' : 'font-sans'
              }`} 
              id="cv-preview"
            >
              {/* Template Style 1: Modern Tech Layout */}
              {cvTemplate === 'tech' && (
                <div className="space-y-6">
                  {/* Left-accent color block details */}
                  <div className="border-l-4 pl-5 space-y-1.5" style={{ borderColor: cvColor === 'indigo' ? '#6366f1' : cvColor === 'emerald' ? '#10b981' : cvColor === 'violet' ? '#8b5cf6' : cvColor === 'rose' ? '#f43f5e' : '#475569' }}>
                    <h1 className="text-2xl font-black tracking-tight uppercase text-slate-900">{name || 'Rahul Kumar'}</h1>
                    <div className="text-xs text-slate-500 font-bold flex flex-wrap gap-2">
                      <span>{email || 'rahul@college.edu'}</span>
                      <span>•</span>
                      <span>{phone || '+91 9876543210'}</span>
                    </div>
                  </div>

                  {/* Education */}
                  {education.length > 0 && education[0].school && (
                    <div className="space-y-3">
                      <h2 className="text-xs font-black uppercase tracking-wider border-b border-slate-200 pb-1" style={{ color: cvColor === 'indigo' ? '#6366f1' : cvColor === 'emerald' ? '#10b981' : cvColor === 'violet' ? '#8b5cf6' : cvColor === 'rose' ? '#f43f5e' : '#475569' }}>Education Credentials</h2>
                      {education.map((edu, idx) => (
                        <div key={idx} className="flex justify-between text-xs font-bold">
                          <div>
                            <span className="text-slate-900">{edu.school}</span>
                            <span className="text-slate-400 font-medium"> — {edu.degree}</span>
                          </div>
                          <span className="text-slate-500 font-medium">{edu.year}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Work history */}
                  {experience.length > 0 && experience[0].company && (
                    <div className="space-y-3">
                      <h2 className="text-xs font-black uppercase tracking-wider border-b border-slate-200 pb-1" style={{ color: cvColor === 'indigo' ? '#6366f1' : cvColor === 'emerald' ? '#10b981' : cvColor === 'violet' ? '#8b5cf6' : cvColor === 'rose' ? '#f43f5e' : '#475569' }}>Professional Experience</h2>
                      {experience.map((exp, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                            <div>
                              <span className="text-slate-900">{exp.company}</span>
                              <span className="text-slate-400 font-medium"> — {exp.role}</span>
                            </div>
                            <span className="text-slate-500 font-medium">{exp.duration}</span>
                          </div>
                          {exp.desc && <p className="text-[11px] text-slate-600 leading-relaxed pl-1 font-medium">{exp.desc}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Software Projects */}
                  {projects.length > 0 && projects[0].title && (
                    <div className="space-y-3">
                      <h2 className="text-xs font-black uppercase tracking-wider border-b border-slate-200 pb-1" style={{ color: cvColor === 'indigo' ? '#6366f1' : cvColor === 'emerald' ? '#10b981' : cvColor === 'violet' ? '#8b5cf6' : cvColor === 'rose' ? '#f43f5e' : '#475569' }}>Software Engineering Projects</h2>
                      {projects.map((proj, idx) => (
                        <div key={idx} className="space-y-1 text-xs">
                          <div className="flex justify-between font-bold">
                            <span className="text-slate-900 font-black">{proj.title}</span>
                            {proj.tech && <span className="text-[10px] text-slate-500 font-semibold">{proj.tech}</span>}
                          </div>
                          {proj.desc && <p className="text-[11px] text-slate-600 leading-relaxed pl-1 font-medium">{proj.desc}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Skills Tagged List */}
                  {skills.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-xs font-black uppercase tracking-wider border-b border-slate-200 pb-1" style={{ color: cvColor === 'indigo' ? '#6366f1' : cvColor === 'emerald' ? '#10b981' : cvColor === 'violet' ? '#8b5cf6' : cvColor === 'rose' ? '#f43f5e' : '#475569' }}>Technical Skills</h2>
                      <div className="text-xs text-slate-700 leading-relaxed font-bold">
                        {skills.join(' • ')}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Template Style 2: Executive Serif Layout */}
              {cvTemplate === 'serif' && (
                <div className="space-y-6 text-slate-900">
                  {/* Centered Classic Headers */}
                  <div className="text-center space-y-1.5 border-b border-slate-200 pb-5">
                    <h1 className="text-2xl font-bold tracking-wide uppercase text-slate-950 font-serif">{name || 'Rahul Kumar'}</h1>
                    <div className="text-[11px] text-slate-600 font-semibold tracking-wide">
                      {email || 'rahul@college.edu'} • {phone || '+91 9876543210'}
                    </div>
                  </div>

                  {/* Education */}
                  {education.length > 0 && education[0].school && (
                    <div className="space-y-2">
                      <h2 className="text-xs font-black uppercase tracking-widest border-b border-slate-200 pb-1 text-center font-serif text-slate-800">Education</h2>
                      {education.map((edu, idx) => (
                        <div key={idx} className="flex justify-between text-xs font-medium">
                          <div>
                            <span className="font-bold text-slate-950">{edu.school}</span>
                            <span className="text-slate-600 italic"> — {edu.degree}</span>
                          </div>
                          <span className="text-slate-600 font-semibold">{edu.year}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Experience */}
                  {experience.length > 0 && experience[0].company && (
                    <div className="space-y-3">
                      <h2 className="text-xs font-black uppercase tracking-widest border-b border-slate-200 pb-1 text-center font-serif text-slate-800">Professional Experience</h2>
                      {experience.map((exp, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <div>
                              <span className="font-bold text-slate-950">{exp.company}</span>
                              <span className="text-slate-600 italic"> — {exp.role}</span>
                            </div>
                            <span className="text-slate-600 font-semibold">{exp.duration}</span>
                          </div>
                          {exp.desc && <p className="text-[11px] text-slate-600 leading-relaxed pl-1 font-medium">{exp.desc}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Software Projects */}
                  {projects.length > 0 && projects[0].title && (
                    <div className="space-y-3">
                      <h2 className="text-xs font-black uppercase tracking-widest border-b border-slate-200 pb-1 text-center font-serif text-slate-800">Key Projects</h2>
                      {projects.map((proj, idx) => (
                        <div key={idx} className="space-y-1 text-xs">
                          <div className="flex justify-between font-medium">
                            <span className="font-bold text-slate-950">{proj.title}</span>
                            {proj.tech && <span className="text-[10px] text-slate-500 font-semibold italic">({proj.tech})</span>}
                          </div>
                          {proj.desc && <p className="text-[11px] text-slate-600 leading-relaxed pl-1 font-medium">{proj.desc}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Skills */}
                  {skills.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-xs font-black uppercase tracking-widest border-b border-slate-200 pb-1 text-center font-serif text-slate-800">Skills</h2>
                      <div className="text-[11px] text-slate-800 text-center font-medium leading-relaxed font-serif">
                        {skills.join('  |  ')}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Template Style 3: Creative Dynamic Layout */}
              {cvTemplate === 'creative' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-900 items-start">
                  
                  {/* Left Column Accent block */}
                  <div className="md:col-span-1 p-5 rounded-2xl text-white space-y-5" style={{ backgroundColor: cvColor === 'indigo' ? '#1e1b4b' : cvColor === 'emerald' ? '#064e3b' : cvColor === 'violet' ? '#2e1065' : cvColor === 'rose' ? '#4c0519' : '#1e293b' }}>
                    <div className="space-y-1">
                      <h1 className="text-lg font-black uppercase tracking-wide leading-tight">{name || 'Rahul Kumar'}</h1>
                      <span className="text-[8px] font-bold tracking-widest uppercase text-slate-350">{targetRole}</span>
                    </div>

                    <div className="space-y-2 text-[10px] font-semibold border-t border-white/10 pt-4">
                      <span className="text-slate-400 block text-[8px] font-black uppercase tracking-widest">Contact Details</span>
                      <div className="truncate">{email}</div>
                      <div>{phone}</div>
                    </div>

                    {skills.length > 0 && (
                      <div className="space-y-2 border-t border-white/10 pt-4">
                        <span className="text-slate-400 block text-[8px] font-black uppercase tracking-widest">Skills Inventory</span>
                        <div className="flex flex-wrap gap-1">
                          {skills.map(s => (
                            <span key={s} className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-white/10 bg-white/5">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column details */}
                  <div className="md:col-span-2 space-y-5">
                    {/* Education */}
                    {education.length > 0 && education[0].school && (
                      <div className="space-y-2.5">
                        <h3 className="text-xs font-black uppercase tracking-wider border-b border-slate-200 pb-1" style={{ color: cvColor === 'indigo' ? '#6366f1' : cvColor === 'emerald' ? '#10b981' : cvColor === 'violet' ? '#8b5cf6' : cvColor === 'rose' ? '#f43f5e' : '#475569' }}>Education history</h3>
                        {education.map((edu, idx) => (
                          <div key={idx} className="text-xs font-semibold">
                            <div className="flex justify-between">
                              <span className="text-slate-900 font-extrabold">{edu.school}</span>
                              <span className="text-slate-500 text-[10px]">{edu.year}</span>
                            </div>
                            <div className="text-slate-500 text-[10px] font-medium">{edu.degree}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Experience */}
                    {experience.length > 0 && experience[0].company && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-wider border-b border-slate-200 pb-1" style={{ color: cvColor === 'indigo' ? '#6366f1' : cvColor === 'emerald' ? '#10b981' : cvColor === 'violet' ? '#8b5cf6' : cvColor === 'rose' ? '#f43f5e' : '#475569' }}>Work Experience</h3>
                        {experience.map((exp, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-900 font-extrabold">{exp.company} — <span className="text-slate-400 font-medium">{exp.role}</span></span>
                              <span className="text-slate-500 text-[10px] font-medium">{exp.duration}</span>
                            </div>
                            {exp.desc && <p className="text-[10px] text-slate-500 leading-relaxed font-medium pl-1">{exp.desc}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Projects */}
                    {projects.length > 0 && projects[0].title && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-wider border-b border-slate-200 pb-1" style={{ color: cvColor === 'indigo' ? '#6366f1' : cvColor === 'emerald' ? '#10b981' : cvColor === 'violet' ? '#8b5cf6' : cvColor === 'rose' ? '#f43f5e' : '#475569' }}>Key Projects</h3>
                        {projects.map((proj, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-900 font-extrabold">{proj.title}</span>
                              {proj.tech && <span className="text-[9px] text-slate-500 font-medium">({proj.tech})</span>}
                            </div>
                            {proj.desc && <p className="text-[10px] text-slate-500 leading-relaxed font-medium pl-1">{proj.desc}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* Print buttons footer */}
              <div className="pt-4 border-t border-slate-200 flex justify-end print:hidden">
                <button 
                  onClick={() => window.print()}
                  className="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-black rounded-xl flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4" /> Export as PDF (Print)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Career Job Matcher Tab */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-5 bg-gradient-to-r from-violet-500/5 to-slate-950/20 text-left border-violet-500/10">
            <h3 className="text-sm font-bold text-slate-200 mb-1 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-violet-400" />
              <span>Skill-Based Job Match Dashboard</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed pl-5.5">
              Below are active employment entries mapped directly to your skills: <span className="text-accentCyan font-bold">{skills.join(', ')}</span>. Keep adding credentials in the builder tab to increase match rates!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobListings.map(job => {
              const matchPercent = calculateMatch(job.coreSkills);
              const alreadyApplied = appliedJobs.includes(job.id);
              
              return (
                <div key={job.id} className="glass-panel rounded-3xl p-6 bg-slate-950/80 border-slate-900 flex flex-col justify-between min-h-[220px] relative overflow-hidden transition-all hover:border-slate-850">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-2.5 items-center">
                        <span className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg shadow-sm">
                          {job.logo}
                        </span>
                        <div className="text-left">
                          <h4 className="font-extrabold text-slate-200 text-sm">{job.role}</h4>
                          <span className="text-[10px] text-slate-500 font-bold block">{job.company} • {job.location}</span>
                        </div>
                      </div>
                      
                      {/* Match percentage pill */}
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border tracking-wide uppercase ${
                        matchPercent >= 80 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : matchPercent >= 50 
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      }`}>
                        {matchPercent}% Match
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed text-left pl-1">
                      {job.desc}
                    </p>

                    <div className="flex flex-wrap gap-1 pl-1 pt-1.5">
                      {job.coreSkills.map(s => {
                        const hasSkill = skills.some(us => us.toLowerCase() === s.toLowerCase());
                        return (
                          <span 
                            key={s} 
                            className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                              hasSkill 
                                ? 'bg-cyan-500/15 border-cyan-500/25 text-accentCyan' 
                                : 'bg-slate-900/60 border-slate-850 text-slate-600'
                            }`}
                          >
                            {hasSkill ? '✓' : '✖'} {s}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-900/60 pt-4 mt-5">
                    <span className="text-xs font-extrabold text-slate-350">{job.salary}</span>
                    <button
                      disabled={alreadyApplied}
                      onClick={() => handleEasyApply(job.id)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        alreadyApplied 
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default' 
                          : 'bg-glow-gradient text-white shadow shadow-violet-500/10 hover:scale-102'
                      }`}
                    >
                      {alreadyApplied ? '✓ Applied Successfully' : 'One-Click Easy Apply'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Simulated Easy Apply Progress Modal */}
      {applyingJobId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-6 border-slate-800 bg-[#090d16] text-center space-y-6 shadow-2xl relative animate-scale-up">
            
            {applicationStep === 1 && (
              <div className="space-y-4 py-4">
                <Loader2 className="w-10 h-10 text-violet-400 animate-spin mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Parsing Resume Credentials...</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Extracting contact data and skills inventory...</p>
                </div>
              </div>
            )}

            {applicationStep === 2 && (
              <div className="space-y-4 py-4">
                <Loader2 className="w-10 h-10 text-accentCyan animate-spin mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Validating Background Packets...</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Optimizing profiles against company ATS engines...</p>
                </div>
              </div>
            )}

            {applicationStep === 3 && (
              <div className="space-y-5 py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mx-auto text-2xl animate-bounce">
                  🎉
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-200">Application Submitted!</h4>
                  <p className="text-[10px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Recruiter queues have received your resume packet. Check your email for dynamic followups. +80 XP claimed.
                  </p>
                </div>
                <button
                  onClick={closeApplyModal}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-850 px-6 py-2.5 rounded-xl text-xs font-bold text-slate-355 mx-auto block"
                >
                  Dismiss Dashboard
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
