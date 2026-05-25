import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Clock, AlertCircle, CheckCircle, 
  HelpCircle, RefreshCw, ChevronRight, Award 
} from 'lucide-react';

export default function AptitudeEngine() {
  const { token, updateXp } = useAuth();
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quiz states
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(180); // 3 minutes

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/gamification/aptitude', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setQuestions(data.questions);
        } else {
          throw new Error("Aptitude failed");
        }
      } catch (err) {
        console.warn("Using offline aptitude presets", err.message);
        setQuestions([
          {
            id: "apt_1",
            section: "Quantitative",
            question: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train in meters?",
            options: ["120 m", "150 m", "180 m", "200 m"],
            correctIndex: 1,
            explanation: "Speed = 60 * (5/18) = 50/3 m/sec. Length of train = Speed * Time = (50/3) * 9 = 150 meters."
          },
          {
            id: "apt_2",
            section: "Logical",
            question: "Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?",
            options: ["1/3", "1/8", "2/8", "1/16"],
            correctIndex: 1,
            explanation: "This is a simple division series; each number is one-half of the previous number (2 / 2 = 1, 1 / 2 = 1/2, etc.)."
          },
          {
            id: "apt_3",
            section: "Verbal",
            question: "Choose the word that is most nearly opposite in meaning to the word: 'AMELIORATE'",
            options: ["Worsen", "Improve", "Validate", "Initiate"],
            correctIndex: 0,
            explanation: "'Ameliorate' means to make something better. Its opposite is 'Worsen' or 'Deteriorate'."
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [token]);

  // Timed Countdown loop
  useEffect(() => {
    if (timer > 0 && !submitted && !loading) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && !submitted) {
      handleSubmit();
    }
  }, [timer, submitted, loading]);

  const handleSubmit = () => {
    let finalScore = 0;
    questions.forEach((q, i) => {
      if (answers[q.id] === q.correctIndex) finalScore += 1;
    });
    setScore(finalScore);
    setSubmitted(true);
    updateXp(finalScore * 30); // 30 XP per correct question
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setTimer(180);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-accentViolet border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-76px)]">
      
      {/* Top dashboard details */}
      <div className="flex justify-between items-center bg-slate-950/40 p-4 border border-slate-900 rounded-2xl">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cognitive practice</span>
          <div className="text-xs font-bold text-slate-200">Aptitude Test Center</div>
        </div>
        
        <div className="flex items-center gap-6">
          {!submitted && (
            <div className="text-right">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Remaining Timer</span>
              <span className={`text-sm font-extrabold flex items-center gap-1 ${timer < 30 ? 'text-rose-500 animate-pulse' : 'text-accentCyan'}`}>
                <Clock className="w-3.5 h-3.5" /> {Math.floor(timer / 60)}:{('0' + (timer % 60)).slice(-2)}
              </span>
            </div>
          )}

          <div className="text-right">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Test Length</span>
            <span className="text-sm font-extrabold text-accentViolet">{questions.length} Questions</span>
          </div>
        </div>
      </div>

      {/* Main questions panels */}
      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id} className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
              <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 font-bold uppercase tracking-wider">
                {q.section} Section
              </span>
              <span className="text-xs text-slate-500 font-bold">Question {idx + 1}</span>
            </div>

            <div className="text-sm font-bold text-slate-200 leading-relaxed">
              {q.question}
            </div>

            {/* Options grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {q.options.map((opt, oIdx) => {
                const isSelected = answers[q.id] === oIdx;
                return (
                  <button
                    key={oIdx}
                    disabled={submitted}
                    onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
                    className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                      isSelected 
                        ? 'bg-accentViolet/10 border-accentViolet/40 text-accentViolet' 
                        : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-250'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Solution and explanations */}
            {submitted && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 text-xs space-y-2 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold">
                  {answers[q.id] === q.correctIndex ? (
                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Correct</span>
                  ) : (
                    <span className="text-rose-400">❌ Incorrect (Correct option: {q.options[q.correctIndex]})</span>
                  )}
                </div>
                <p className="text-slate-400">{q.explanation}</p>
              </div>
            )}
          </div>
        ))}

        {/* Command controls */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-900/60 print:hidden">
          {!submitted ? (
            <button
              onClick={handleSubmit}
              className="bg-glow-gradient px-8 py-4 rounded-xl text-xs font-bold text-white shadow-lg hover:shadow-violet-500/20 hover:scale-[1.01] transition-all"
            >
              Submit Test Answers
            </button>
          ) : (
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 text-xs font-bold">
              <span className="text-emerald-400 flex items-center gap-2">
                <Award className="w-4 h-4" /> Timed Quiz Evaluated! Final Score: {score} / {questions.length} (+{score * 30} XP)
              </span>
              
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="px-5 py-3 border border-slate-800 hover:bg-slate-850 rounded-xl font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Re-practice Quiz
                </button>
                <Link to="/dashboard" className="bg-slate-900 hover:bg-slate-850 border border-slate-800 px-5 py-3 rounded-xl font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1">
                  Go back <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
