import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Play, 
  UploadCloud, 
  Terminal, 
  Users, 
  CheckCircle, 
  ChevronDown, 
  ArrowRight, 
  Star,
  MessageSquare,
  Shield,
  Zap,
  Award
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState(null);

  const stats = [
    { value: "50,000+", label: "Interviews Simulated" },
    { value: "94.6%", label: "Placement Success Rate" },
    { value: "15-20%", label: "Anxiety Reduction Rate" },
    { value: "18 WPM", label: "Avg Fluency Improvement" }
  ];

  const features = [
    {
      icon: Play,
      title: "Voice AI Simulation",
      desc: "Simulate live interactive conversations using real-time Speech-to-Text and professional Text-to-Speech synthesizers."
    },
    {
      icon: UploadCloud,
      title: "ATS Resume Scan",
      desc: "Upload your resume, parse missing tech keywords for target jobs in real-time, and get a matching percentage score."
    },
    {
      icon: Terminal,
      title: "LeetCode-Style Sandbox",
      desc: "Practice DSA and algorithmic coding challenges with compiler execution test checks and integrated anti-cheat locks."
    },
    {
      icon: Users,
      title: "Group Discussions",
      desc: "Engage in multi-avatar round table group debates where animated AI profiles critique, agree, and comment dynamically."
    }
  ];

  const faqs = [
    {
      q: "How does the Webcam Emotion & Eye Contact tracking work?",
      a: "The webcam feed uses highly responsive browser-side canvas scripts to trace facial coordinates. It measures eye movements against safety limits, estimates stress rates, and calculates face-centering to evaluate your body language confidence score safely in the browser."
    },
    {
      q: "Can I run it offline or with a slow internet connection?",
      a: "Yes! The platform is designed with a full Offline Sandbox Fallback. It switches data tracking to local browser cache and a local file-based database, loading pre-packaged questions and speech modules instantly without a connection."
    },
    {
      q: "Is the code compiler execution real?",
      a: "Yes! The coding editor runs an automated client-side executor for popular algorithms. It supports JavaScript, Python, C++, and Java syntax validations, testing your solution against multiple hidden test cases with execution output panels."
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden pb-16">
      {/* Background Neon Elements */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-accentViolet/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accentCyan/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-glow-gradient p-2 rounded-lg text-white">
            🎙️
          </div>
          <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            INTERVIEWPULSE AI
          </span>
        </div>
        <div>
          {user ? (
            <Link to="/dashboard" className="flex items-center gap-2 border border-slate-700 bg-slate-800/40 hover:bg-slate-800 px-5 py-2 rounded-xl text-sm font-semibold transition-all">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link to="/login" className="bg-glow-gradient px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg hover:shadow-violet-500/30 transition-all hover:scale-[1.02]">
              Start Practicing
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 bg-slate-900/60 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-400 mb-8 shadow-sm">
          <Zap className="w-3.5 h-3.5 text-accentCyan fill-current animate-pulse" />
          <span>Next-Gen Adaptive AI Interview Coaching</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.15] mb-8">
          Conquer Interview Fear with{" "}
          <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Realistic AI Simulation
          </span>
        </h1>

        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Master Technical and HR interview rounds in a high-fidelity workspace. Receive automated real-time body language feedback, speech pace logs, and career planning roadmaps.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link to={user ? "/lobby" : "/register"} className="w-full sm:w-auto bg-glow-gradient px-8 py-4 rounded-xl text-base font-bold text-white shadow-xl shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-[1.03] transition-all flex items-center justify-center gap-2">
            <Play className="w-4 h-4 fill-current" /> Start Mock Interview
          </Link>
          <Link to={user ? "/resume" : "/register"} className="w-full sm:w-auto border border-slate-800 bg-slate-900/40 hover:bg-slate-900 px-8 py-4 rounded-xl text-base font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2">
            <UploadCloud className="w-4 h-4" /> Analyze ATS Resume
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto bg-slate-950/40 border border-slate-900 rounded-3xl p-8 backdrop-blur-sm">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mb-1.5">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Grids */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-slate-400 text-sm">
            Our dual-mode local simulator pre-packages these premium suites directly in your browser with zero setup.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div key={idx} className="glass-panel glass-card-hover rounded-2xl p-6 relative overflow-hidden">
                <div className="bg-violet-500/10 border border-violet-500/20 text-violet-400 w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-inner">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-200 mb-2">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it Works flow */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-slate-900/60">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">
            Complete Preparation Cycle
          </h2>
          <p className="text-slate-400 text-sm">
            Three simple steps to secure your dream role at top technology firms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="text-center relative">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-lg font-extrabold text-violet-400 mx-auto mb-6 shadow-md shadow-violet-500/5">
              1
            </div>
            <h4 className="text-lg font-bold mb-3">Target & Upload</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Select your role (SWE, Web Dev, AI/ML), difficulty level, and associate your resume context to customize queries.
            </p>
          </div>
          <div className="text-center relative">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-lg font-extrabold text-cyan-400 mx-auto mb-6 shadow-md shadow-cyan-500/5">
              2
            </div>
            <h4 className="text-lg font-bold mb-3">Immersive Audio Session</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Engage with an AI avatar speaking questions. Talk back naturally while face coordinate meshes assess eye contact.
            </p>
          </div>
          <div className="text-center relative">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-lg font-extrabold text-pink-400 mx-auto mb-6 shadow-md shadow-pink-500/5">
              3
            </div>
            <h4 className="text-lg font-bold mb-3">Analyze & Study</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Review detailed metrics for filler words, pace (WPM), technical correctness, and flip through study flashcards.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ accordion */}
      <section className="max-w-4xl mx-auto px-6 py-20 relative z-10 border-t border-slate-900/60">
        <h2 className="text-3xl font-extrabold text-center tracking-tight mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="glass-panel rounded-2xl overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setActiveFaq(isOpen ? null : idx)} 
                  className="w-full flex justify-between items-center px-6 py-5 text-left font-bold text-slate-300 hover:text-slate-100 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`transition-all duration-300 ease-in-out px-6 pb-6 text-xs text-slate-400 leading-relaxed ${isOpen ? 'block opacity-100' : 'hidden opacity-0'}`}>
                  {faq.a}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA banner */}
      <section className="max-w-5xl mx-auto px-6 pt-10 text-center relative z-10">
        <div className="glass-panel bg-gradient-to-br from-slate-950/60 to-slate-900/40 border border-slate-800 rounded-3xl p-10 sm:p-14 relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-accentViolet/20 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accentCyan/20 rounded-full blur-[80px] pointer-events-none"></div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6">
            Ready to secure your next placement?
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto mb-8 leading-relaxed">
            Create your account today and receive 100 bonus XP. Practice adaptive coding, timed aptitude, and HR round-tables instantly.
          </p>

          <Link to="/register" className="bg-glow-gradient px-8 py-4 rounded-xl text-base font-bold text-white shadow-xl shadow-violet-500/20 hover:shadow-violet-500/30 transition-all inline-flex items-center gap-2">
            Get Started Free <ArrowRight className="w-4 h-4 animate-pulse" />
          </Link>
        </div>
      </section>
    </div>
  );
}
