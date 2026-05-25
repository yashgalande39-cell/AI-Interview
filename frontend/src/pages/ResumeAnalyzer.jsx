import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Trash2, UploadCloud, CheckCircle, 
  AlertTriangle, ArrowRight, ShieldCheck, Download, Award,
  Briefcase, Compass, FileText, Loader2, Star
} from 'lucide-react';

export default function ResumeAnalyzer() {
  const { token, updateXp } = useAuth();

  // Tab State: 'builder' (Resume ATS Builder) or 'jobs' (Live Career Job Matcher)
  const [activeTab, setActiveTab] = useState('builder');

  // Selected Targeted job
  const [targetRole, setTargetRole] = useState('Software Engineer');

  // Input states
  const [name, setName] = useState('Rahul Kumar');
  const [email, setEmail] = useState('rahul@college.edu');
  const [phone, setPhone] = useState('+91 9876543210');
  const [skills, setSkills] = useState(['React', 'JavaScript', 'Python', 'HTML5', 'CSS3']);
  const [newSkill, setNewSkill] = useState('');

  const [education, setEducation] = useState([
    { school: "IIT Bombay", degree: "B.Tech Computer Science", year: "2027" }
  ]);
  const [experience, setExperience] = useState([
    { company: "ViteTech Corp", role: "Software Intern", duration: "Summer 2025" }
  ]);
  const [projects, setProjects] = useState([
    { title: "AI Voice Interview Platform", desc: "Built full-stack React and Node voice mock rooms." }
  ]);

  // Scan stats
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Job Matchboard States
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [applicationStep, setApplicationStep] = useState(0); // 0: idle, 1: upload, 2: validate, 3: success
  const [appliedJobs, setAppliedJobs] = useState([]);

  // Curated job pool to scan against
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

  // Input adding controls
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
    setExperience(prev => [...prev, { company: '', role: '', duration: '' }]);
  };

  const handleAddProj = () => {
    setProjects(prev => [...prev, { title: '', desc: '' }]);
  };

  const handleScanATS = async () => {
    setScanning(true);
    try {
      const res = await fetch('http://localhost:5000/api/resumes/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: targetRole, skills })
      });
      const data = await res.json();
      if (res.ok) {
        setScanResult(data.analysis);
        updateXp(50);
      }
    } catch (e) {
      console.warn("Server ATS parsing offline, rendering local sandbox analytical calculator", e.message);
      setTimeout(() => {
        const matching = skills.filter(s => 
          ["React", "JavaScript", "Python", "SQL", "Git"].includes(s)
        );
        const missing = ["Data Structures", "Algorithms", "System Design", "Node.js"].filter(s => 
          !skills.includes(s)
        );
        const score = Math.round(55 + (matching.length * 8));

        setScanResult({
          atsScore: Math.min(95, score),
          targetRole,
          matchedSkills: matching,
          missingSkills: missing,
          suggestions: [
            "Integrate specific technical metrics (e.g., 'Enhanced query load by 40%') in your work experience bullet logs.",
            "Consider listing professional cloud scaling keywords (such as Docker, AWS) under technology scopes."
          ],
          recommendedQuestions: [
            "Explain your technical choice in using React over other frameworks in your AI mock project.",
            "How do you configure database structures to minimize query loads in system design?"
          ]
        });
        updateXp(50);
      }, 1000);
    } finally {
      setScanning(false);
    }
  };

  // Job matching percentage calculator
  const calculateMatch = (jobSkills) => {
    const matched = jobSkills.filter(js => 
      skills.some(us => us.toLowerCase() === js.toLowerCase())
    );
    return Math.round((matched.length / jobSkills.length) * 100);
  };

  // Easy Apply workflow simulation
  const handleEasyApply = (jobId) => {
    setApplyingJobId(jobId);
    setApplicationStep(1);

    // Step 1: Uploading credentials
    setTimeout(() => {
      setApplicationStep(2);
      
      // Step 2: Validating background
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
                : 'border-transparent text-slate-500 hover:text-slate-350'
            }`}
          >
            <FileText className="w-4 h-4" /> Resume ATS Builder
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'jobs' 
                ? 'border-violet-500 text-slate-200' 
                : 'border-transparent text-slate-500 hover:text-slate-350'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Live Career Job Matcher
          </button>
        </div>
      </div>

      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          {/* Left Column: Form Builder Inputs */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 print:hidden">
            <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800/80 pb-4">
              Step-by-Step Resume Builder
            </h3>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-slate-950/40 border border-slate-850 rounded-xl text-xs text-slate-300 outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-950/40 border border-slate-850 rounded-xl text-xs text-slate-300 outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Phone Number</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-950/40 border border-slate-850 rounded-xl text-xs text-slate-300 outline-none" />
              </div>
            </div>

            {/* Target Role for ATS checks */}
            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Target Placement Role</label>
              <select 
                value={targetRole} 
                onChange={e => setTargetRole(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 outline-none"
              >
                <option value="Software Engineer">Software Engineer</option>
                <option value="Web Developer">Web Developer</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="AI/ML Engineer">AI/ML Engineer</option>
                <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
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
                  placeholder="e.g. Node.js"
                  onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                  className="w-full px-3 py-2 bg-slate-950/40 border border-slate-850 rounded-xl text-xs text-slate-300 outline-none" 
                />
                <button onClick={handleAddSkill} className="px-4 py-2 bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {skills.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-slate-900 border border-slate-855 text-slate-300 text-[10px] font-bold rounded-lg flex items-center gap-1.5 shadow-sm">
                    {s}
                    <Trash2 className="w-3 h-3 text-rose-500 cursor-pointer" onClick={() => setSkills(prev => prev.filter(t => t !== s))} />
                  </span>
                ))}
              </div>
            </div>

            {/* Dynamic Education list */}
            <div className="space-y-4 pt-4 border-t border-slate-900/60">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Education Credentials</label>
                <button onClick={handleAddEdu} className="p-1 text-accentCyan hover:underline text-[10px] font-bold flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add School</button>
              </div>
              {education.map((edu, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="text" placeholder="School" value={edu.school} onChange={e => {
                    const copy = [...education]; copy[idx].school = e.target.value; setEducation(copy);
                  }} className="px-3 py-2 bg-slate-950/40 border border-slate-855 rounded-xl text-xs text-slate-300 outline-none" />
                  <input type="text" placeholder="Degree" value={edu.degree} onChange={e => {
                    const copy = [...education]; copy[idx].degree = e.target.value; setEducation(copy);
                  }} className="px-3 py-2 bg-slate-950/40 border border-slate-855 rounded-xl text-xs text-slate-300 outline-none" />
                  <input type="text" placeholder="Grad Year" value={edu.year} onChange={e => {
                    const copy = [...education]; copy[idx].year = e.target.value; setEducation(copy);
                  }} className="px-3 py-2 bg-slate-950/40 border border-slate-855 rounded-xl text-xs text-slate-300 outline-none" />
                </div>
              ))}
            </div>

            {/* Dynamic Work Experience */}
            <div className="space-y-4 pt-4 border-t border-slate-900/60">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Work History</label>
                <button onClick={handleAddExp} className="p-1 text-accentCyan hover:underline text-[10px] font-bold flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Job</button>
              </div>
              {experience.map((exp, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="text" placeholder="Company" value={exp.company} onChange={e => {
                    const copy = [...experience]; copy[idx].company = e.target.value; setExperience(copy);
                  }} className="px-3 py-2 bg-slate-950/40 border border-slate-855 rounded-xl text-xs text-slate-300 outline-none" />
                  <input type="text" placeholder="Role" value={exp.role} onChange={e => {
                    const copy = [...experience]; copy[idx].role = e.target.value; setExperience(copy);
                  }} className="px-3 py-2 bg-slate-950/40 border border-slate-855 rounded-xl text-xs text-slate-300 outline-none" />
                  <input type="text" placeholder="Duration" value={exp.duration} onChange={e => {
                    const copy = [...experience]; copy[idx].duration = e.target.value; setExperience(copy);
                  }} className="px-3 py-2 bg-slate-950/40 border border-slate-855 rounded-xl text-xs text-slate-300 outline-none" />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-900/60">
              <button
                onClick={handleScanATS}
                disabled={scanning}
                className="bg-glow-gradient px-6 py-3.5 rounded-xl text-xs font-bold text-white shadow-lg hover:shadow-violet-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4" /> {scanning ? "Scanning..." : "Scan ATS Compatibility"}
              </button>
            </div>
          </div>

          {/* Right Column: Live Resume Preview & ATS Ratings */}
          <div className="space-y-6">
            {scanResult && (
              <div className="glass-panel rounded-3xl p-6 border-cyan-500/25 bg-gradient-to-br from-cyan-500/5 to-slate-950/40 space-y-6 print:hidden">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ATS Scan Results</span>
                    <h3 className="text-base font-extrabold text-slate-200 mt-0.5">{scanResult.targetRole} Match</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-accentCyan block">{scanResult.atsScore}%</span>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500">ATS Rating</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Missing Key Tech Keywords
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {scanResult.missingSkills.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actionable ATS Suggestions</div>
                  <ul className="list-disc list-inside text-slate-400 space-y-1 pl-1 leading-relaxed">
                    {scanResult.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Custom Resume-driven Questions</div>
                  <div className="space-y-1.5">
                    {scanResult.recommendedQuestions.map((q, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-900 text-slate-300 leading-normal">
                        "{q}"
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900/60 text-[10px] text-slate-500 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verification scan logs generated. +50 XP claimed.</span>
                </div>
              </div>
            )}

            {/* High Fidelity Print-Ready Resume Preview */}
            <div className="bg-white text-slate-950 p-8 rounded-3xl shadow-xl space-y-6 max-h-[600px] overflow-y-auto print:max-h-none print:shadow-none print:p-0 print:m-0" id="cv-preview">
              <div className="text-center space-y-1 border-b border-slate-300 pb-5">
                <h1 className="text-2xl font-extrabold tracking-tight uppercase">{name || 'Rahul Kumar'}</h1>
                <div className="text-xs text-slate-600 font-medium">
                  {email || 'rahul@college.edu'} • {phone || '+91 9876543210'}
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1">Education Credentials</h2>
                {education.map((edu, idx) => (
                  <div key={idx} className="flex justify-between text-xs font-medium">
                    <div>
                      <span className="font-extrabold text-slate-950">{edu.school || 'College/School'}</span> — <span>{edu.degree || 'Degree Major'}</span>
                    </div>
                    <span className="text-slate-600">{edu.year || 'Year'}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1">Work History</h2>
                {experience.map((exp, idx) => (
                  <div key={idx} className="flex justify-between text-xs font-medium">
                    <div>
                      <span className="font-extrabold text-slate-950">{exp.company || 'Company'}</span> — <span>{exp.role || 'Job Role'}</span>
                    </div>
                    <span className="text-slate-600">{exp.duration || 'Duration'}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1">Key Software Projects</h2>
                {projects.map((proj, idx) => (
                  <div key={idx} className="space-y-0.5 text-xs">
                    <div className="font-extrabold text-slate-950">{proj.title || 'Project Title'}</div>
                    <p className="text-slate-600 leading-normal">{proj.desc || 'Brief project details.'}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1">Skills Inventory</h2>
                <div className="text-xs text-slate-800 font-medium">
                  {skills.join(', ')}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end print:hidden">
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-slate-355 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
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
                    Google recruiter queues have received your resume packet. Check your email for dynamic followups. +80 XP claimed.
                  </p>
                </div>
                <button
                  onClick={closeApplyModal}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-850 px-6 py-2.5 rounded-xl text-xs font-bold text-slate-350 mx-auto block"
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
