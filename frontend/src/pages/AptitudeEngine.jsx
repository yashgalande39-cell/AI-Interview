import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Clock, CheckCircle, 
  RefreshCw, ChevronRight, Award,
  Sliders, BookOpenCheck, Brain, ArrowLeft,
  Pause, Play
} from 'lucide-react';
import { API_BASE } from '../config';


export default function AptitudeEngine() {
  const { token, updateXp } = useAuth();
  
  // App views: 'lobby' (select sets / customize), 'quiz' (active test), 'result' (after submit)
  const [view, setView] = useState('lobby');

  // Pool lists & loaders
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Selector choices
  const [selectedSet, setSelectedSet] = useState(null);
  const [quizDifficulty, setQuizDifficulty] = useState('All');
  const [quizSection, setQuizSection] = useState('All');
  const [quizLength, setQuizLength] = useState(10);

  // Active quiz states
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(180); // 3 minutes standard
  const [isPaused, setIsPaused] = useState(false);


  // Structured Practice Sets Pool
  // Sets 1-20: Easy, Sets 21-40: Medium, Sets 41-50: Hard
  const practiceSets = Array.from({ length: 50 }, (_, i) => {
    const setNum = i + 1;
    let difficulty = "Easy";
    if (setNum > 20) difficulty = "Medium";
    if (setNum > 40) difficulty = "Hard";

    // Cycle topics
    const topics = ["Quantitative", "Logical", "Verbal"];
    const topic = topics[i % topics.length];

    return {
      id: setNum,
      title: `Practice Set #${setNum}`,
      difficulty,
      topic,
      qCount: 50,
      description: `Structured practicing sets analyzing foundational cognitive parameters for ${topic} aptitude.`
    };
  });

  // Start set-based test
  const handleStartSet = async (setId) => {
    setLoading(true);
    setSelectedSet(setId);
    try {
      const res = await fetch(`${API_BASE}/gamification/aptitude?set=${setId}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
        setAnswers({});
        setSubmitted(false);
        setTimer(300); // 5 minutes for sets
        setIsPaused(false);
        setView('quiz');
      }
    } catch (err) {
      console.error("Failed to load set questions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Start dynamic custom randomized test
  const handleStartCustomQuiz = async () => {
    setLoading(true);
    setSelectedSet(null);
    try {
      const res = await fetch(
        `${API_BASE}/gamification/aptitude?difficulty=${quizDifficulty}&section=${quizSection}&limit=${quizLength}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
        setAnswers({});
        setSubmitted(false);
        setScore(0);
        const allocatedTime = quizLength * 30; // 30 seconds per question
        setTimer(allocatedTime);
        setIsPaused(false);
        setView('quiz');
      }
    } catch (err) {
      console.error("Failed to generate custom quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  // Live countdown timer loop
  useEffect(() => {
    if (view === 'quiz' && timer > 0 && !submitted && !isPaused) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && view === 'quiz' && !submitted) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer, view, submitted, isPaused]);

  // Submit test answers
  function handleSubmit() {
    let finalScore = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) finalScore += 1;
    });
    setScore(finalScore);
    setSubmitted(true);
    updateXp(finalScore * 30, "Aptitude Scholar"); // 30 XP per correct question
    setView('result');
  }

  // Refresh and pull completely fresh questions
  const handleRefreshQuiz = async () => {
    setLoading(true);
    try {
      if (selectedSet) {
        // Fetch fresh subset of that same set
        const res = await fetch(`${API_BASE}/gamification/aptitude?set=${selectedSet}&limit=10`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setQuestions(data.questions);
          setAnswers({});
          setSubmitted(false);
          setScore(0);
          setTimer(300);
          setIsPaused(false);
          setView('quiz');
        }
      } else {
        // Fetch completely fresh randomized questions matching selected parameters
        const res = await fetch(
          `${API_BASE}/gamification/aptitude?difficulty=${quizDifficulty}&section=${quizSection}&limit=${quizLength}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        if (res.ok) {
          const data = await res.json();
          setQuestions(data.questions);
          setAnswers({});
          setSubmitted(false);
          setScore(0);
          const allocatedTime = quizLength * 30;
          setTimer(allocatedTime);
          setIsPaused(false);
          setView('quiz');
        }
      }
    } catch (err) {
      console.error("Failed to refresh quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'Medium': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'Hard': return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      default: return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
        <RefreshCw className="w-10 h-10 text-violet-400 animate-spin" />
        <span className="text-xs text-slate-500 font-black uppercase tracking-widest">Constructing practice grid...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-6 w-full bg-darkBg text-slate-100">
      
      {/* 1. LOBBY VIEW: Practice Sets Explorer & Custom Panel */}
      {view === 'lobby' && (
        <div className="space-y-8">
          
          {/* Header Card */}
          <div className="flex justify-between items-center bg-slate-950/40 p-5 border border-slate-900 rounded-3xl">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Cognitive test center</span>
              <h2 className="text-lg font-black text-slate-200">Interactive Aptitude Engine</h2>
            </div>
            <span className="text-[10px] px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 font-extrabold uppercase tracking-wide">
              2,500 Practice Tasks Loaded
            </span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
            
            {/* Left: Dynamic Custom Practice Generator Panel */}
            <div className="xl:col-span-1 glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-4 border-b border-slate-900">
                <Sliders className="w-4 h-4 text-violet-400" /> Custom Quiz Generator
              </h3>

              {/* Difficulty */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Level of Difficulty</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                    <button
                      key={d}
                      onClick={() => setQuizDifficulty(d)}
                      className={`px-2 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                        quizDifficulty === d 
                          ? 'bg-violet-500/10 border-violet-500/30 text-violet-400' 
                          : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic category */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Cognitive Topic</label>
                <select
                  value={quizSection}
                  onChange={e => setQuizSection(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-350 outline-none font-bold"
                >
                  <option value="All">All Categories</option>
                  <option value="Quantitative">Quantitative Reasoning</option>
                  <option value="Logical">Logical Reasoning</option>
                  <option value="Verbal">Verbal Ability</option>
                </select>
              </div>

              {/* Quiz length */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Test Length</label>
                <select
                  value={quizLength}
                  onChange={e => setQuizLength(parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-855 rounded-xl text-xs text-slate-350 outline-none font-bold"
                >
                  <option value="5">5 Questions (2.5 mins)</option>
                  <option value="10">10 Questions (5 mins)</option>
                  <option value="15">15 Questions (7.5 mins)</option>
                  <option value="20">20 Questions (10 mins)</option>
                </select>
              </div>

              <button
                onClick={handleStartCustomQuiz}
                className="w-full bg-glow-gradient py-3.5 rounded-xl text-xs font-black uppercase text-white shadow-lg hover:shadow-violet-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Brain className="w-4 h-4" /> Start Custom Practice
              </button>
            </div>

            {/* Right: Practice Sets grid listing */}
            <div className="xl:col-span-2 space-y-4">
              <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <BookOpenCheck className="w-4.5 h-4.5 text-violet-400" /> Topic-focused Practice Sets
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 divide-y-0">
                {practiceSets.map(set => (
                  <div 
                    key={set.id}
                    className="glass-panel rounded-3xl p-5 bg-slate-950/40 border-slate-900 flex flex-col justify-between hover:border-slate-850 transition-all min-h-[160px]"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 text-slate-400">
                          {set.topic}
                        </span>
                        <span className={`text-[8px] px-2 py-0.5 rounded-full uppercase font-black border tracking-wider ${getDifficultyColor(set.difficulty)}`}>
                          {set.difficulty}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-slate-200">{set.title}</h4>
                      <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">{set.description}</p>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-slate-900 mt-4">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">10 Selected Tasks</span>
                      <button
                        onClick={() => handleStartSet(set.id)}
                        className="text-[10px] font-black uppercase text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
                      >
                        Practice Set <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 2. ACTIVE QUIZ TEST PANEL */}
      {view === 'quiz' && (
        <div className="space-y-8">
          
          {/* Active Quiz Header Info */}
          <div className="flex justify-between items-center bg-slate-950/40 p-4 border border-slate-900 rounded-2xl">
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to go back to Lobby? Your current progress will be lost.")) {
                  setView('lobby');
                }
              }}
              className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-350 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Lobby
            </button>

            <div className="flex items-center gap-4">
              {/* Pause/Play Button */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase border transition-all flex items-center gap-1.5 ${
                  isPaused 
                    ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 animate-pulse' 
                    : 'bg-slate-950/50 border-slate-850 text-slate-400 hover:text-slate-200'
                }`}
                title={isPaused ? "Resume Session" : "Pause Session"}
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                {isPaused ? "Resume" : "Pause"}
              </button>

              <div className="text-right border-l border-slate-900 pl-4 sm:pl-6">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Allocated Timer</span>
                <span className={`text-sm font-extrabold flex items-center gap-1 ${timer < 30 ? 'text-rose-500 animate-pulse' : 'text-accentCyan'}`}>
                  <Clock className="w-3.5 h-3.5" /> {Math.floor(timer / 60)}:{('0' + (timer % 60)).slice(-2)}
                </span>
              </div>
              <div className="text-right border-l border-slate-900 pl-4 sm:pl-6">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Session Size</span>
                <span className="text-sm font-extrabold text-violet-400">{questions.length} Questions</span>
              </div>
            </div>
          </div>

          {/* Quiz Question progress bar */}
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
            <div 
              className="h-full bg-glow-gradient" 
              style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
            />
          </div>

          {/* Dynamic Question List Wrapper with Pause Overlay */}
          <div className="relative">
            {isPaused && (
              <div className="absolute inset-0 backdrop-blur-md bg-slate-950/75 z-40 rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/35 flex items-center justify-center text-violet-400 text-2xl">
                  ⏸️
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-black text-slate-200 uppercase tracking-wide">Cognitive Practice Session Paused</h4>
                  <p className="text-[10px] text-slate-500 max-w-sm leading-relaxed font-semibold">
                    Timer has stopped. Question contents are obscured during pause intervals to maintain testing alignment and integrity.
                  </p>
                </div>
                <button
                  onClick={() => setIsPaused(false)}
                  className="bg-glow-gradient px-6 py-3 rounded-xl text-xs font-black uppercase text-white shadow-lg hover:shadow-violet-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" /> Resume Test
                </button>
              </div>
            )}

            {/* Questions List */}
            <div className={`space-y-6 transition-all duration-300 ${isPaused ? 'filter blur-sm select-none pointer-events-none' : ''}`}>
              {questions.map((q, idx) => (
                <div key={q.id} className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 font-bold uppercase tracking-wider">
                        {q.section}
                      </span>
                      <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getDifficultyColor(q.difficulty)}`}>
                        {q.difficulty}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-bold">Question {idx + 1} of {questions.length}</span>
                  </div>

                  <div className="text-sm font-bold text-slate-200 leading-relaxed pl-1">
                    {q.question}
                  </div>

                  {/* Multiple choice Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = answers[q.id] === oIdx;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
                          className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all hover:scale-[1.005] ${
                            isSelected 
                              ? 'bg-violet-500/10 border-violet-500/40 text-violet-400' 
                              : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="font-extrabold mr-2 uppercase text-[10px] text-slate-500">Option {String.fromCharCode(65 + oIdx)}:</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Test submission hooks */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
                <button
                  onClick={handleSubmit}
                  className="bg-glow-gradient px-8 py-4 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-lg hover:shadow-violet-500/20 hover:scale-[1.01] transition-all"
                >
                  Submit Practice Exam
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 3. DETAILED SCORES AND ANSWER KEYS VIEW */}
      {view === 'result' && (
        <div className="space-y-8">
          
          {/* Summary results top panel */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-500/5 to-slate-950/30 border-emerald-500/10 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              
              <div className="text-center sm:text-left space-y-1">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Practice evaluations complete</span>
                <h3 className="text-lg font-black text-slate-200 flex items-center justify-center sm:justify-start gap-1.5">
                  <Award className="w-5 h-5 text-emerald-400" /> Practicing Score Card
                </h3>
              </div>

              <div className="flex gap-6 items-center bg-slate-950/60 p-4 border border-slate-900 rounded-2xl shrink-0">
                <div className="text-center pr-6 border-r border-slate-900">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Final Grade</span>
                  <span className="text-xl font-black text-emerald-400">{score} / {questions.length}</span>
                </div>
                <div className="text-center">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">XP Awarded</span>
                  <span className="text-xl font-black text-violet-400">+{score * 30} XP</span>
                </div>
              </div>

            </div>

            {/* Explanations & dynamic shuffler toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-900 mt-2">
              <span className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                Review the detailed answer sheets below to optimize your calculations. You can pull fresh randomized questions to re-test!
              </span>
              
              <div className="flex gap-2.5 w-full sm:w-auto shrink-0 justify-end">
                <button
                  onClick={handleRefreshQuiz}
                  className="w-full sm:w-auto px-5 py-3 border border-slate-800 hover:bg-slate-850 rounded-xl text-xs font-black uppercase text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-violet-400" /> Refresh & Pull New Questions
                </button>
                <button
                  onClick={() => setView('lobby')}
                  className="w-full sm:w-auto bg-slate-900 border border-slate-800 hover:bg-slate-850 px-5 py-3 rounded-xl text-xs font-black uppercase text-slate-350 transition-all"
                >
                  Go to Lobby
                </button>
              </div>
            </div>
          </div>

          {/* Exam reviews list */}
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                  <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 font-bold uppercase tracking-wider">
                    {q.section} Section
                  </span>
                  <span className="text-xs text-slate-500 font-bold">Review Question {idx + 1}</span>
                </div>

                <div className="text-sm font-bold text-slate-200 leading-relaxed pl-1">
                  {q.question}
                </div>

                {/* Shuffled Options Review */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = answers[q.id] === oIdx;
                    const isCorrect = q.correctIndex === oIdx;

                    let classes = 'bg-slate-950/40 border-slate-900 text-slate-500';
                    if (isCorrect) {
                      classes = 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400';
                    } else if (isSelected && !isCorrect) {
                      classes = 'bg-rose-500/5 border-rose-500/20 text-rose-400';
                    }

                    return (
                      <div
                        key={oIdx}
                        className={`p-3.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between ${classes}`}
                      >
                        <div>
                          <span className="font-extrabold mr-2 uppercase text-[10px] text-slate-500">Option {String.fromCharCode(65 + oIdx)}:</span>
                          {opt}
                        </div>
                        {isCorrect && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {/* Mathematical Solution and explanations deck */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 text-xs space-y-2 leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold">
                    {answers[q.id] === q.correctIndex ? (
                      <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Correct Answer</span>
                    ) : (
                      <span className="text-rose-400">❌ Incorrect (Selected: {answers[q.id] !== undefined ? q.options[answers[q.id]] : 'None'} | Correct: {q.options[q.correctIndex]})</span>
                    )}
                  </div>
                  <p className="text-slate-400 font-semibold">{q.explanation}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
