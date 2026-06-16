import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';
import { 
  Mic, MicOff, Video, VideoOff, 
  ShieldAlert, Edit3, ArrowRight,
  Phone, PhoneOff, Grid, Volume1, Play
} from 'lucide-react';

export default function InterviewRoom() {
  const { token, updateXp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const resumeId = searchParams.get('resumeId');

  // Config overrides for offline/fallback mode
  const oType = searchParams.get('type') || 'HR';
  const oDiff = searchParams.get('difficulty') || 'Medium';
  const oRole = searchParams.get('role') || 'Software Engineer';
  const oComp = searchParams.get('company') || 'Common';
  const oLang = searchParams.get('language') || 'JavaScript';

  // Active Session states
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState("Loading your interview, please wait...");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [answerText, setAnswerText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechTimer, setSpeechTimer] = useState(0);
  
  // Interface options
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);

  // Telephony Simulator states
  const [telephonyMode, setTelephonyMode] = useState(false);
  const [callState, setCallState] = useState('idle'); // 'idle', 'ringing', 'connected'
  const [phoneMuted, setPhoneMuted] = useState(false);
  const [phoneSpeaker, setPhoneSpeaker] = useState(true);
  const [showKeypad, setShowKeypad] = useState(false);
  const [keypadInput, setKeypadInput] = useState('');

  // Anti-Cheat Warnings
  const [strikeCount, setStrikeCount] = useState(0);
  const [warnings, setWarnings] = useState([]);

  // Biometric Accumulators for current answer
  const [eyeContactFrames, setEyeContactFrames] = useState(0);
  const [goodEyeContactFrames, setGoodEyeContactFrames] = useState(0);
  const [stressValues, setStressValues] = useState([]);
  const [, setEmotionsList] = useState([]);

  // Dialogue Transcript history list (to display conversation history)
  const [dialogues, setDialogues] = useState([
    {
      time: "00:15",
      sender: "AI Interviewer",
      text: "Tell me about yourself, walk me through your technical background, and explain what draws you to this Software Engineer position."
    }
  ]);

  // Biometric Live states for overlays (dynamically changing slightly)
  const [stressLevelPercent, setStressLevelPercent] = useState(11.2);
  const [pulseBPM, setPulseBPM] = useState(75);
  const [gazeStable, setGazeStable] = useState("Good");

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const whiteboardCanvasRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const boxXRef = useRef(60);
  const boxYRef = useRef(40);

  // Load Session
  useEffect(() => {
    const initSession = async () => {
      try {
        if (sessionId && !sessionId.startsWith('int_mock_') && !sessionId.startsWith('mock_')) {
          const res = await fetch(`${API_BASE}/interviews/session/${sessionId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.session) {
              setSession(data.session);
              setCurrentQuestion(data.session.questions[0]?.text || "Tell me about yourself, walk me through your technical background, and explain what draws you to this Software Engineer position.");
              setTotalQuestions(data.session.questions.length);
              setLoading(false);
              return;
            }
          }
        }

        const res = await fetch(`${API_BASE}/interviews/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            type: oType,
            difficulty: oDiff,
            role: oRole,
            company: oComp,
            language: oLang,
            resumeId: resumeId
          })
        });
        if (res.ok) {
          const data = await res.json();
          setSession(data.session);
          setCurrentQuestion(data.session.questions[0]?.text || "Tell me about yourself, walk me through your technical background, and explain what draws you to this Software Engineer position.");
          setTotalQuestions(data.session.questions.length);
        } else {
          throw new Error("Init session failed");
        }
      } catch (err) {
        console.warn("Using local simulator fallback session details", err.message);
        let mockQuestions = [
          "Tell me about yourself, walk me through your technical background, and explain what draws you to this Software Engineer position.",
          "What are your main technical strengths and major programming achievements?",
          "How do you approach team integration and conflict resolutions in project sprints?",
          "Describe a technically demanding project you spearheaded and what metrics determined its success.",
          "Where do you see your technical competencies growing in the next three years?"
        ];

        if (resumeId === "res_mock_1") {
          mockQuestions = [
            "Welcome Rahul Kumar. Explain your core software development philosophy, specifically referencing your IIT B.Tech background.",
            "In your ViteTech Corp internship, you optimized REST APIs by 25%. Walk us through the technical details of that optimization.",
            "You spearheaded 'AI Mock Interview Platform' which handled 10k concurrent WebSockets. How did you design the state clustering to support this scale?",
            "Since you listed Java, Go, and Python, how do you evaluate language trade-offs when building a Distributed Key-Value Store?",
            "If we were to deploy your Raft consensus project to AWS, how would you design the fault-tolerant network topologies?"
          ];
        } else if (resumeId === "res_mock_2") {
          mockQuestions = [
            "Welcome Rahul Kumar. Walk us through your IT B.Tech journey at DTU and what draws you to Web Development.",
            "At PixelPerfect Solutions, you redesigned the landing page to boost engagement by 18%. What specific UX and performance metrics drove this success?",
            "You built an 'Interactive Collaborative Whiteboard' using Socket.IO. How did you handle synchronization conflicts when multiple users drew concurrently?",
            "You listed Redux, Webpack, and Tailwind CSS. How do you optimize bundle size and CSS loading in a Progressive Web App?",
            "What are the major performance advantages of your E-Commerce PWA's offline shopping support compared to a standard web app?"
          ];
        }

        const mockSession = {
          id: sessionId || 'int_mock_' + Date.now(),
          type: oType,
          difficulty: oDiff,
          role: oRole,
          company: oComp,
          questions: mockQuestions.map((q, i) => ({ id: `mq_${i}`, text: q })),
          transcript: []
        };
        setSession(mockSession);
        setCurrentQuestion(mockQuestions[0]);
        setTotalQuestions(mockQuestions.length);
      } finally {
        setLoading(false);
      }
    };

    initSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, token]);

  // Anti-Cheat: Screen blur warnings (disabled in telephony mode)
  useEffect(() => {
    const handleBlur = () => {
      if (telephonyMode) return;
      setStrikeCount(prev => {
        const next = prev + 1;
        setWarnings(w => [...w, `⚠️ Warning Strike ${next}: Focus lost! Do not change browser tabs.`]);
        if (next >= 3) {
          alert("🚨 Extreme Cheating Warning: Focus limit reached. Submitting remaining session.");
          handleFinishInterview();
        }
        return next;
      });
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, telephonyMode]);

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setAnswerText(prev => prev + ' ' + finalTranscript);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Text-To-Speech: Speak current question aloud
  const speakQuestion = () => {
    if ('speechSynthesis' in window && currentQuestion) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQuestion);
      utterance.onstart = () => setAiSpeaking(true);
      utterance.onend = () => setAiSpeaking(false);
      utterance.onerror = () => setAiSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (currentQuestion && !loading) {
      speakQuestion();
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, loading]);

  // Simulate dynamically fluctuating biometrics overlays
  useEffect(() => {
    const interval = setInterval(() => {
      setStressLevelPercent(prev => {
        const delta = (Math.random() - 0.5) * 0.4;
        return parseFloat(Math.min(25, Math.max(5, prev + delta)).toFixed(1));
      });
      setPulseBPM(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        return Math.min(85, Math.max(65, prev + delta));
      });
      setGazeStable(Math.random() > 0.92 ? "Drifting..." : "Good");
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Webcam access & Face analysis canvas overlay
  useEffect(() => {
    let stream = null;
    let animId = null;

    const startCamera = async () => {
      if (cameraActive && !telephonyMode) {
        try {
          // Request high resolution, colourful video stream
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: { ideal: 640 }, 
              height: { ideal: 480 },
              facingMode: "user"
            } 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          
          const ctx = canvasRef.current.getContext('2d');
          
          const drawOverlay = () => {
            if (ctx && canvasRef.current) {
              const now = Date.now();
              const width = canvasRef.current.width;
              const height = canvasRef.current.height;
              
              // Clear previous frames
              ctx.clearRect(0, 0, width, height);

              // Draw tracking bounding bracket box center interpolated
              const boxX = boxXRef.current + Math.sin(now / 1000) * 1.5;
              const boxY = boxYRef.current + Math.cos(now / 1200) * 1.5;
              const boxWidth = 120;
              const boxHeight = 130;

              // Draw tracking box corners
              ctx.strokeStyle = '#06b6d4'; // cyan-500
              ctx.lineWidth = 2.5;
              const size = 12;
              
              // Top-left corner
              ctx.beginPath();
              ctx.moveTo(boxX, boxY + size);
              ctx.lineTo(boxX, boxY);
              ctx.lineTo(boxX + size, boxY);
              ctx.stroke();

              // Top-right corner
              ctx.beginPath();
              ctx.moveTo(boxX + boxWidth - size, boxY);
              ctx.lineTo(boxX + boxWidth, boxY);
              ctx.lineTo(boxX + boxWidth, boxY + size);
              ctx.stroke();

              // Bottom-left corner
              ctx.beginPath();
              ctx.moveTo(boxX, boxY + boxHeight - size);
              ctx.lineTo(boxX, boxY + boxHeight);
              ctx.lineTo(boxX + size, boxY + boxHeight);
              ctx.stroke();

              // Bottom-right corner
              ctx.beginPath();
              ctx.moveTo(boxX + boxWidth - size, boxY + boxHeight);
              ctx.lineTo(boxX + boxWidth, boxY + boxHeight);
              ctx.lineTo(boxX + boxWidth, boxY + boxHeight - size);
              ctx.stroke();

              // Pupil eye tracking circles
              const leftPupilX = boxX + 40 + Math.sin(now / 350) * 0.8;
              const leftPupilY = boxY + 45 + Math.cos(now / 350) * 0.8;
              const rightPupilX = boxX + 80 + Math.sin(now / 350) * 0.8;
              const rightPupilY = boxY + 45 + Math.cos(now / 350) * 0.8;

              ctx.strokeStyle = '#8b5cf6'; // purple-500
              ctx.lineWidth = 1.5;
              
              ctx.beginPath();
              ctx.arc(leftPupilX, leftPupilY, 4, 0, 2 * Math.PI);
              ctx.stroke();

              ctx.beginPath();
              ctx.arc(rightPupilX, rightPupilY, 4, 0, 2 * Math.PI);
              ctx.stroke();

              // Connected horizontal reticle link
              ctx.strokeStyle = 'rgba(139, 92, 246, 0.25)';
              ctx.beginPath();
              ctx.moveTo(leftPupilX, leftPupilY);
              ctx.lineTo(rightPupilX, rightPupilY);
              ctx.stroke();

              // Accumulate statistics if user is speaking
              if (isListening) {
                setEyeContactFrames(prev => prev + 1);
                setGoodEyeContactFrames(prev => prev + 1);
                setStressValues(prev => [...prev, stressLevelPercent]);
                setEmotionsList(prev => [...prev, "Confident"]);
              }
              
              animId = requestAnimationFrame(drawOverlay);
            }
          };
          animId = requestAnimationFrame(drawOverlay);
        } catch (err) {
          console.warn("Camera blocks in sandbox mode:", err.message);
        }
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      if (animId) {
        cancelAnimationFrame(animId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraActive, telephonyMode, isListening]);

  // Whiteboard drawing engine
  useEffect(() => {
    if (whiteboardOpen && whiteboardCanvasRef.current) {
      const canvas = whiteboardCanvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      let drawing = false;

      const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      };

      const startDraw = (e) => {
        drawing = true;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      };

      const draw = (e) => {
        if (!drawing) return;
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      };

      const endDraw = () => {
        drawing = false;
      };

      canvas.addEventListener('mousedown', startDraw);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', endDraw);

      return () => {
        canvas.removeEventListener('mousedown', startDraw);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', endDraw);
      };
    }
  }, [whiteboardOpen]);

  // Speech Timing Controller
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please type your answer.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      clearInterval(timerIntervalRef.current);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
      setSpeechTimer(0);
      timerIntervalRef.current = setInterval(() => {
        setSpeechTimer(prev => prev + 1);
      }, 1000);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!answerText.trim()) {
      alert("Please record or write your response first.");
      return;
    }

    if (isListening) {
      toggleListening();
    }

    setLoading(true);

    // Compute average biometric stats
    let avgEyeContactScore = 82;
    if (eyeContactFrames > 0) {
      avgEyeContactScore = Math.round((goodEyeContactFrames / eyeContactFrames) * 100);
    }
    
    let avgStress = Math.round(stressLevelPercent);
    if (stressValues.length > 0) {
      avgStress = Math.round(stressValues.reduce((a, b) => a + b, 0) / stressValues.length);
    }
    
    let dominantEmotion = "Confident";

    // Format current timestamp string
    const formatTime = (secs) => {
      const m = Math.floor(secs / 60).toString().padStart(2, '0');
      const s = (secs % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };

    // Push response to dialogue timeline
    const answerTimestamp = formatTime(15 + speechTimer);
    const newDialoguePair = [
      {
        time: answerTimestamp,
        sender: "You",
        text: answerText
      }
    ];

    try {
      const res = await fetch(`${API_BASE}/interviews/submit-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: session.id,
          answerText,
          speechDurationSeconds: speechTimer || 30,
          tabBlurCount: strikeCount,
          webcamStats: {
            eyeContactScore: avgEyeContactScore,
            stressScore: avgStress,
            emotion: dominantEmotion
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Evaluation failed');

      // Reset biometric accumulators
      setEyeContactFrames(0);
      setGoodEyeContactFrames(0);
      setStressValues([]);
      setEmotionsList([]);

      if (data.isCompleted) {
        handleFinishInterview();
      } else {
        const nextQ = data.nextQuestion.text || data.nextQuestion.question;
        setDialogues(prev => [
          ...prev, 
          ...newDialoguePair,
          {
            time: formatTime(25 + speechTimer),
            sender: "AI Interviewer",
            text: nextQ
          }
        ]);
        setAnswerText("");
        setSpeechTimer(0);
        setCurrentIndex(prev => prev + 1);
        setCurrentQuestion(nextQ);
        setLoading(false);
      }
    } catch (e) {
      console.warn("Answer evaluated offline inside local simulator:", e.message);
      
      // Reset biometric accumulators
      setEyeContactFrames(0);
      setGoodEyeContactFrames(0);
      setStressValues([]);
      setEmotionsList([]);

      const nextIdx = currentIndex + 1;
      if (nextIdx >= totalQuestions) {
        handleFinishInterview();
      } else {
        const nextQ = session.questions[nextIdx]?.text || "Answer the following topic:";
        setDialogues(prev => [
          ...prev, 
          ...newDialoguePair,
          {
            time: formatTime(25 + speechTimer),
            sender: "AI Interviewer",
            text: nextQ
          }
        ]);
        setAnswerText("");
        setSpeechTimer(0);
        setCurrentIndex(nextIdx);
        setCurrentQuestion(nextQ);
        setLoading(false);
      }
    }
  };

  const handleFinishInterview = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/interviews/finish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId: session.id })
      });
      await res.json();
      if (res.ok) {
        updateXp(150);
        navigate(`/feedback?sessionId=${session.id}`);
      }
    } catch (err) {
      console.warn("Failed finishing live server session, loading local mock analysis dashboard:", err.message);
      navigate(`/feedback?sessionId=mock_complete`);
    }
  };

  // Telephony controls
  const startPhoneCall = () => {
    setCallState('ringing');
    setTimeout(() => {
      setCallState('connected');
      speakQuestion();
    }, 2000);
  };

  const endPhoneCall = () => {
    setCallState('idle');
    setTelephonyMode(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (isListening) {
      toggleListening();
    }
  };

  const handleKeypadPress = (val) => {
    setKeypadInput(prev => prev + val);
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 400;
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // AudioContext blocks
    }
  };

  if (loading && !session) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Structuring Adaptive Room...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto pt-6 px-8 pb-8 space-y-6 custom-scrollbar bg-[#050810] text-gray-100">
      <style>{`
        .panel-bg {
          background-color: #151A2B;
          border: 1px solid #1F2937;
        }
        .hero-gradient {
          background: linear-gradient(90deg, rgba(21,26,43,1) 0%, rgba(30,27,75,0.6) 50%, rgba(21,26,43,1) 100%);
        }
        .soundwave {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          height: 32px;
        }
        .bar {
          width: 4px;
          background-color: #8B5CF6;
          border-radius: 2px;
          animation: sound 0ms -800ms linear infinite alternate;
        }
        @keyframes sound {
          0% { height: 4px; opacity: 0.5; }
          100% { height: 28px; opacity: 1; }
        }
        .bar:nth-child(1) { animation-duration: 474ms; }
        .bar:nth-child(2) { animation-duration: 433ms; }
        .bar:nth-child(3) { animation-duration: 407ms; }
        .bar:nth-child(4) { animation-duration: 458ms; }
        .bar:nth-child(5) { animation-duration: 400ms; }
        .bar:nth-child(6) { animation-duration: 427ms; }

        @keyframes glow-pulse {
          0% { box-shadow: 0 0 15px rgba(139, 92, 246, 0.2); }
          100% { box-shadow: 0 0 35px rgba(139, 92, 246, 0.6); }
        }
        .animate-glow-pulse {
          animation: glow-pulse 1s ease-in-out infinite alternate;
        }
      `}</style>

      {/* Top Details & Timer Header Card */}
      <section className="panel-bg rounded-2xl p-6 hero-gradient flex flex-col md:flex-row items-start md:items-center justify-between border-gray-800 relative overflow-hidden gap-6">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#8B5CF6]/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8B5CF6] tracking-wider uppercase mb-2">
            <Play className="w-3 h-3 fill-[#8B5CF6]" /> Active Prep Room
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {session?.role || oRole} Target at {session?.company || oComp}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="px-3 py-1 bg-gray-800/80 rounded-full text-gray-300 border border-gray-700 flex items-center gap-1">
              Difficulty <i className="fa-solid fa-chart-simple text-yellow-500 ml-1"></i> {session?.difficulty || oDiff}
            </span>
            <span className="px-3 py-1 bg-gray-800/80 rounded-full text-gray-300 border border-gray-700">
              Domain <span className="text-white ml-1 font-medium">{oLang}</span>
            </span>
            <span className="px-3 py-1 bg-gray-800/80 rounded-full text-gray-300 border border-gray-700">
              Experience <span className="text-white ml-1 font-medium">2-4 yrs</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-8">
          {/* Fluency Clock */}
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400 mb-2">Fluency Clock</span>
            <div className="relative w-16 h-16 flex items-center justify-center rounded-full border-[3px] border-gray-700">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path 
                  className="text-blue-500" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeDasharray={`${speechTimer * 2.5}, 100`} 
                  strokeWidth="3"
                ></path>
              </svg>
              <span className="text-lg font-bold text-white relative z-10">{speechTimer}s</span>
            </div>
          </div>

          {/* Question Progress bar */}
          <div className="w-48">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400">Question Progress</span>
              <span className="text-xs text-gray-400">{Math.round(((currentIndex + 1) / totalQuestions) * 100)}%</span>
            </div>
            <div className="text-lg font-bold text-[#8B5CF6] mb-2">{currentIndex + 1} / {totalQuestions}</div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-[#8B5CF6] h-2 rounded-full transition-all duration-350" 
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Switch Action */}
          <button 
            onClick={() => {
              if (telephonyMode) {
                endPhoneCall();
              } else {
                setTelephonyMode(true);
                startPhoneCall();
              }
            }}
            className="bg-[#1A2035] hover:bg-[#222942] border border-gray-700 rounded-xl p-4 flex items-center gap-4 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Phone className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-400">Switch to</p>
              <p className="text-sm font-medium text-white">
                {telephonyMode ? 'Visual Room' : 'Mobile Call Simulator'}
              </p>
            </div>
            <i className="fa-solid fa-chevron-right text-gray-600 ml-2"></i>
          </button>
        </div>
      </section>

      {/* Strike warnings banner */}
      {warnings.length > 0 && !telephonyMode && (
        <div className="space-y-2">
          {warnings.slice(-1).map((w, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-3 rounded-xl text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Immersive Phone Simulator Panel */}
      {telephonyMode ? (
        <div className="max-w-md mx-auto glass-panel rounded-3xl p-6 border-slate-800/80 bg-gradient-to-b from-[#0f172a] to-[#090d16] shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[500px]">
          <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto mb-6 border border-slate-800/60 shadow-inner"></div>

          <div className="text-center space-y-2">
            <div className="w-20 h-20 rounded-full bg-violet-500/10 border-2 border-violet-500/30 flex items-center justify-center mx-auto text-violet-400 text-3xl">
              🤖
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-200">Meridian AI Coach</h3>
              <span className="text-[10px] text-slate-500 font-extrabold tracking-widest uppercase">
                {callState === 'ringing' ? 'INCOMING CALL...' : callState === 'connected' ? 'ACTIVE TELEPHONY LINE' : 'DISCONNECTED'}
              </span>
            </div>
          </div>

          <div className="py-8 flex flex-col items-center justify-center h-48">
            {callState === 'ringing' ? (
              <div className="space-y-4 text-center">
                <span className="text-xs text-slate-400 animate-pulse font-semibold">Ringing...</span>
                <div className="flex gap-1 justify-center items-center">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-1.5 h-6 bg-violet-500/40 rounded animate-pulse" style={{ animationDelay: `${i * 0.15}s` }}></div>
                  ))}
                </div>
              </div>
            ) : callState === 'connected' ? (
              <div className="w-full space-y-4">
                <div className="flex gap-1 justify-center items-end h-16">
                  {(aiSpeaking ? [2, 5, 8, 3, 7, 4, 9, 2, 6, 8, 3, 5] : isListening ? [4, 7, 3, 8, 2, 5, 3] : [1, 2, 1, 2, 1]).map((h, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 rounded transition-all duration-150 ${aiSpeaking ? 'bg-cyan-400' : isListening ? 'bg-rose-400' : 'bg-slate-700'}`}
                      style={{ height: `${h * 4 + 4}px` }}
                    ></div>
                  ))}
                </div>
                
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-900 text-left h-24 overflow-y-auto text-[11px] leading-normal font-medium space-y-2">
                  <div className="text-cyan-400 font-bold">Coach (Voice AI):</div>
                  <p className="text-slate-300 font-semibold italic">&quot;{currentQuestion}&quot;</p>
                </div>
              </div>
            ) : (
              <span className="text-xs text-rose-500 font-bold">Call Terminated</span>
            )}
          </div>

          {showKeypad && callState === 'connected' && (
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-900 mb-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(num => (
                <button
                  key={num}
                  onClick={() => handleKeypadPress(num)}
                  className="py-2 bg-slate-900 hover:bg-slate-800 rounded-xl font-bold text-slate-300 text-sm active:scale-95 transition-all"
                >
                  {num}
                </button>
              ))}
              <div className="col-span-3 text-[10px] text-center text-slate-500 font-bold">DTMF Dial: {keypadInput}</div>
            </div>
          )}

          <div className="space-y-6 pt-4 border-t border-slate-900/60">
            {callState === 'connected' && (
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-400">
                <button 
                  onClick={() => setPhoneMuted(!phoneMuted)}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1 mx-auto ${phoneMuted ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-slate-950 border-slate-900'}`}
                >
                  <MicOff className="w-4 h-4" /> Mute
                </button>
                <button 
                  onClick={() => setShowKeypad(!showKeypad)}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1 mx-auto ${showKeypad ? 'bg-violet-500/10 border-violet-500/20 text-violet-400' : 'bg-slate-950 border-slate-900'}`}
                >
                  <Grid className="w-4 h-4" /> Keypad
                </button>
                <button 
                  onClick={() => setPhoneSpeaker(!phoneSpeaker)}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1 mx-auto ${phoneSpeaker ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-slate-950 border-slate-900'}`}
                >
                  <Volume1 className="w-4 h-4" /> Speaker
                </button>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              {callState === 'ringing' ? (
                <>
                  <button 
                    onClick={() => setCallState('connected')} 
                    className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white text-xl animate-bounce shadow-lg shadow-emerald-500/20"
                  >
                    <Phone className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={endPhoneCall} 
                    className="w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white text-xl shadow-lg shadow-rose-500/20"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 items-center w-full">
                  {callState === 'connected' && (
                    <button
                      onClick={toggleListening}
                      className={`w-full py-3 rounded-xl border text-xs font-bold transition-all active:scale-95 ${isListening ? 'bg-rose-500 text-white border-rose-600' : 'bg-slate-950 border-slate-900 text-slate-300'}`}
                    >
                      {isListening ? 'Stop Recording' : '🎙️ Click to Speak'}
                    </button>
                  )}
                  
                  <div className="flex gap-4 w-full">
                    {callState === 'connected' && (
                      <button
                        onClick={handleAnswerSubmit}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-brand-purple py-3.5 rounded-xl text-xs font-bold text-white shadow hover:scale-[1.01] transition-all"
                      >
                        Submit Response
                      </button>
                    )}
                    <button 
                      onClick={endPhoneCall} 
                      className="bg-rose-500 hover:bg-rose-600 p-4 rounded-xl flex items-center justify-center text-white shadow"
                    >
                      <PhoneOff className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Immersive Visual Dashboard Columns */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: AI Interviewer & Your Response Transcript */}
          <div className="space-y-6">
            
            {/* AI Interviewer Panel */}
            <section className="panel-bg rounded-2xl p-6 border border-gray-800 flex flex-col h-[480px]">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-850 pb-3">
                <i className="fa-solid fa-sparkles text-brand-purple"></i>
                <div>
                  <h3 className="font-semibold text-white">AI Interviewer</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">Your personal AI coach</p>
                </div>
              </div>

              <div className="flex-grow flex flex-col items-center justify-center relative">
                {/* Visual soundwaves left and right */}
                <div className="absolute inset-0 flex items-center justify-between px-6 opacity-40 pointer-events-none">
                  {/* Left soundwave */}
                  <div className="soundwave">
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                  </div>
                  {/* Right soundwave */}
                  <div className="soundwave">
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                  </div>
                </div>

                {/* AI Coach Avatar */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full border-2 border-[#8B5CF6]/50 flex items-center justify-center mb-4 bg-gradient-to-b from-[#1E2540] to-[#0B0F19] animate-glow-pulse">
                    <span className="text-6xl select-none">🤖</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">AI Coach</span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-400 text-[10px] font-medium rounded-full border border-green-500/20">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Listening...
                    </span>
                  </div>
                </div>
              </div>

              {/* Speech bubble question */}
              <div className="bg-[#1A2035] border border-gray-800 rounded-xl p-5 mt-6 relative">
                <i className="fa-solid fa-quote-left text-2xl text-[#8B5CF6]/40 absolute top-4 left-4"></i>
                <p className="text-gray-300 text-sm leading-relaxed pl-10 font-medium">
                  {currentQuestion}
                </p>
              </div>

              {/* Repeat action */}
              <div className="mt-6 flex justify-center">
                <button 
                  onClick={speakQuestion}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                >
                  <i className="fa-solid fa-rotate-right text-brand-purple"></i> Repeat Question
                </button>
              </div>
            </section>

            {/* Your Response Transcript Panel */}
            <section className="panel-bg rounded-2xl p-6 border border-gray-800 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4 border-b border-gray-850 pb-3">
                <div className="flex items-center gap-2">
                  <i className="fa-regular fa-message text-brand-purple"></i>
                  <h3 className="font-semibold text-white">Your Response Transcript</h3>
                </div>
                <button
                  onClick={toggleListening}
                  className={`px-4 py-1.5 border rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 ${
                    isListening 
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse' 
                      : 'bg-[#1A2035] border-gray-700 text-gray-300 hover:text-white'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  {isListening ? 'Listening...' : 'Speak (Mic-free)'}
                </button>
              </div>

              {/* Interactive timeline dialogues logs */}
              <div className="space-y-4 max-h-[200px] overflow-y-auto pr-1 mb-4 custom-scrollbar">
                {dialogues.map((msg, idx) => {
                  const isUser = msg.sender === "You";
                  return (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-xl border ${
                        isUser 
                          ? 'bg-emerald-950/20 border-emerald-500/20' 
                          : 'bg-slate-900/50 border-gray-800'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-bold ${isUser ? 'text-emerald-400' : 'text-[#8B5CF6]'}`}>
                          {msg.sender}
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold">{msg.time}</span>
                      </div>
                      <p className="text-xs text-gray-300 leading-normal">{msg.text}</p>
                    </div>
                  );
                })}
              </div>

              {/* Live typing textarea input */}
              <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-4 focus-within:border-gray-600 transition-colors">
                <textarea 
                  value={answerText}
                  onChange={e => setAnswerText(e.target.value)}
                  className="w-full bg-transparent border-none text-gray-300 text-sm placeholder-gray-600 resize-none focus:ring-0 p-0" 
                  placeholder="Type your answer here or use the mic to speak..." 
                  rows="3"
                ></textarea>

                <div className="flex items-center justify-between mt-4 border-t border-gray-800/50 pt-3">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={toggleListening}
                      className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm text-white font-medium transition-colors ${
                        isListening 
                          ? 'bg-rose-500 border-rose-600 shadow' 
                          : 'bg-gray-800 hover:bg-gray-700 border-gray-700'
                      }`}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-gray-400" />}
                      {isListening ? 'Stop Speaking' : 'Speak Answer'}
                    </button>
                    <span className="text-xs text-gray-500">Mic-free option</span>
                  </div>

                  <button 
                    onClick={handleAnswerSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500 to-brand-purple hover:opacity-90 rounded-lg text-sm text-white font-medium transition-opacity disabled:opacity-50"
                  >
                    Submit Answer <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tips alert */}
              <p className="mt-4 text-xs text-gray-400 flex items-center gap-1.5">
                <i className="fa-regular fa-lightbulb text-yellow-500"></i> 
                <span>Tip: Structure your answer using STAR method for better results.</span>
              </p>
            </section>
          </div>

          {/* Right Column: Live Webcam, Tools, Feedback & Tips */}
          <div className="space-y-6">
            
            {/* Live Webcam & Analysis Panel */}
            <section className="panel-bg rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-video text-blue-400"></i>
                  <h3 className="font-semibold text-white">Live Webcam & Analysis</h3>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full border border-green-500/20">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Live
                </div>
              </div>

              {/* Camera viewframe viewport container */}
              <div className="bg-[#0B0F19] border border-gray-800 rounded-xl aspect-video relative overflow-hidden mb-4">
                {cameraActive ? (
                  <>
                    {/* Clear, bright, colourful user webcam feed */}
                    <video 
                      ref={videoRef} 
                      muted 
                      playsInline 
                      className="absolute inset-0 w-full h-full object-cover scale-x-[-1] brightness-110 contrast-105" 
                    />
                    
                    {/* Transparent overlay canvas for face/eye tracking boxes */}
                    <canvas 
                      ref={canvasRef} 
                      width="320" 
                      height="240" 
                      className="absolute inset-0 w-full h-full pointer-events-none z-10" 
                    />

                    {/* Cybernetic telemetry overlay texts - Styled in HTML for perfect sharp rendering */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none z-20 font-sans">
                      
                      {/* Top Row telemetry: Stability, Stress, Pulse */}
                      <div className="flex flex-col gap-2.5 text-left text-[11px] font-semibold text-slate-100">
                        
                        <div className="leading-tight drop-shadow-md">
                          <p className="text-[9px] text-gray-400/90 font-medium">Gaze Stability</p>
                          <p className={gazeStable === 'Good' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                            {gazeStable}
                          </p>
                        </div>

                        <div className="leading-tight drop-shadow-md">
                          <p className="text-[9px] text-gray-400/90 font-medium">Stress Level</p>
                          <p className="text-emerald-400 font-bold">{stressLevelPercent}%</p>
                        </div>

                        <div className="leading-tight drop-shadow-md flex items-center gap-1.5">
                          <span className="text-rose-500 animate-pulse text-xs">❤️</span>
                          <div>
                            <p className="text-[9px] text-gray-400/90 font-medium">Pulse</p>
                            <p className="text-white font-bold">{pulseBPM} BPM</p>
                          </div>
                        </div>
                      </div>

                      {/* Bottom row telemetry: Network & Environment */}
                      <div className="flex justify-between items-end">
                        <div className="leading-tight drop-shadow-md bg-black/45 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-gray-800/40">
                          <p className="text-[9px] text-gray-400/90 font-medium">Network</p>
                          <p className="text-emerald-400 font-bold flex items-center gap-1">
                            <i className="fa-solid fa-signal text-[10px]"></i> Excellent
                          </p>
                        </div>

                        <div className="leading-tight drop-shadow-md bg-black/45 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-gray-800/40">
                          <p className="text-[9px] text-gray-400/90 font-medium flex items-center gap-1">
                            <i className="fa-regular fa-sun text-yellow-400 text-[10px]"></i> Environment
                          </p>
                          <p className="text-gray-300 font-bold">Good</p>
                        </div>
                      </div>

                    </div>
                  </>
                ) : (
                  /* Camera off state view */
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#0B0F19]">
                    <div className="w-16 h-16 rounded-full border-2 border-gray-700 flex items-center justify-center mb-3">
                      <VideoOff className="w-8 h-8 text-gray-500" />
                    </div>
                    <h4 className="text-white font-medium mb-1">Camera is off</h4>
                    <p className="text-xs text-gray-500 max-w-[200px]">Enable your camera to begin interview</p>
                  </div>
                )}
              </div>

              {/* Camera utility control toggles */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setCameraActive(!cameraActive)}
                  className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-sm font-medium transition-colors"
                >
                  {cameraActive ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  {cameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
                </button>

                <button 
                  onClick={() => setMicActive(!micActive)}
                  className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  {micActive ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                  {micActive ? 'Mute Mic' : 'Unmute Mic'}
                </button>

                <button 
                  onClick={() => alert('Camera configuration parameters simulated!')}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-lg transition-colors"
                >
                  <i className="fa-solid fa-gear"></i>
                </button>
              </div>
            </section>

            {/* Real-time Feedback Panel */}
            <section className="panel-bg rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-850">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-chart-line text-brand-purple"></i>
                  <h3 className="font-semibold text-white">Real-time Feedback</h3>
                </div>
                <button 
                  onClick={() => alert('View details report simulated!')}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  View Details
                </button>
              </div>

              {/* Metrics scores grids */}
              <div className="grid grid-cols-5 gap-2.5 mb-6 text-center leading-tight">
                <div className="bg-[#0B0F19] border border-gray-800/60 p-2.5 rounded-xl">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Eye Contact</p>
                  <p className="text-base font-extrabold text-emerald-400">82%</p>
                  <span className="text-[9px] text-gray-600 block mt-0.5 font-medium">Good</span>
                </div>

                <div className="bg-[#0B0F19] border border-gray-800/60 p-2.5 rounded-xl">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Clarity</p>
                  <p className="text-base font-extrabold text-emerald-400">88%</p>
                  <span className="text-[9px] text-gray-600 block mt-0.5 font-medium">Great</span>
                </div>

                <div className="bg-[#0B0F19] border border-gray-800/60 p-2.5 rounded-xl">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Pace</p>
                  <p className="text-base font-extrabold text-emerald-400">76 WPM</p>
                  <span className="text-[9px] text-gray-600 block mt-0.5 font-medium">Good</span>
                </div>

                <div className="bg-[#0B0F19] border border-gray-800/60 p-2.5 rounded-xl">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Confidence</p>
                  <p className="text-base font-extrabold text-yellow-500">72%</p>
                  <span className="text-[9px] text-gray-600 block mt-0.5 font-medium">Fair</span>
                </div>

                <div className="bg-[#0B0F19] border border-gray-800/60 p-2.5 rounded-xl">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Filler Words</p>
                  <p className="text-base font-extrabold text-emerald-400">5</p>
                  <span className="text-[9px] text-gray-600 block mt-0.5 font-medium">Low</span>
                </div>
              </div>

              {/* Overall Performance tracking line */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-gray-400">Overall Performance</span>
                  <span className="text-white font-bold">78 / 100</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-brand-purple h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>

              <p className="mt-4 text-xs text-gray-400 italic font-medium leading-relaxed bg-[#0B0F19]/40 p-3 rounded-lg border border-gray-850/30">
                &ldquo;Keep it up! Your answers are well-structured and clear.&rdquo;
              </p>

              <button 
                onClick={handleFinishInterview}
                className="w-full mt-4 py-2 bg-[#1A2035] hover:bg-[#222942] border border-gray-800 hover:border-gray-700 text-xs font-bold text-gray-300 hover:text-white rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                View Detailed Report <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </button>
            </section>

            {/* Interactive whiteboard/sketchboard button wrapper (when whiteboard is closed) */}
            {!whiteboardOpen && (
              <button
                onClick={() => setWhiteboardOpen(true)}
                className="w-full py-3 bg-[#151A2B] hover:bg-[#1C223A] border border-gray-800 rounded-xl text-xs font-bold text-gray-300 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4 text-[#8B5CF6]" /> Enable Whiteboard Sketchboard
              </button>
            )}

            {/* Sketchboard whiteboard canvas inline display */}
            {whiteboardOpen && (
              <section className="panel-bg rounded-2xl p-6 border border-gray-800 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-850">
                  <h4 className="text-sm font-bold text-slate-200">Sketchboard Whiteboard</h4>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const canvas = whiteboardCanvasRef.current;
                        const ctx = canvas.getContext('2d');
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                      }}
                      className="text-[9px] bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-slate-400 hover:text-white transition-colors"
                    >
                      Clear
                    </button>
                    <button 
                      onClick={() => setWhiteboardOpen(false)}
                      className="text-[9px] bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded text-rose-400 hover:text-rose-350 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
                <div className="w-full bg-[#0B0F19] rounded-xl overflow-hidden border border-gray-800">
                  <canvas ref={whiteboardCanvasRef} width="640" height="200" className="w-full bg-[#0B0F19] cursor-crosshair h-44" />
                </div>
              </section>
            )}

            {/* Tools Section grid */}
            <section className="panel-bg rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-toolbox text-brand-purple"></i>
                  <h3 className="font-semibold text-white">Interview Tools</h3>
                </div>
                <button 
                  onClick={() => alert('View all interview tools simulated!')}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <button 
                  onClick={() => alert('Mock Notepad activated!')}
                  className="bg-[#0B0F19] hover:bg-[#1A1F33] border border-gray-800 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 transition-colors group"
                >
                  <i className="fa-regular fa-clipboard text-lg text-purple-400 group-hover:scale-110 transition-transform"></i>
                  <span className="text-xs text-white font-medium">Notes</span>
                  <span className="text-[8px] text-gray-500 leading-none">Take notes</span>
                </button>

                <button 
                  onClick={() => setWhiteboardOpen(true)}
                  className="bg-[#0B0F19] hover:bg-[#1A1F33] border border-gray-800 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 transition-colors group"
                >
                  <i className="fa-solid fa-pen-to-square text-lg text-blue-400 group-hover:scale-110 transition-transform"></i>
                  <span className="text-xs text-white font-medium">Whiteboard</span>
                  <span className="text-[8px] text-gray-500 leading-none">Draw &amp; explain</span>
                </button>

                <button 
                  onClick={() => alert('Calculator tool activated!')}
                  className="bg-[#0B0F19] hover:bg-[#1A1F33] border border-gray-800 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 transition-colors group"
                >
                  <i className="fa-solid fa-calculator text-lg text-teal-400 group-hover:scale-110 transition-transform"></i>
                  <span className="text-xs text-white font-medium">Calculator</span>
                  <span className="text-[8px] text-gray-500 leading-none">Calculate</span>
                </button>

                <button 
                  onClick={() => alert('Code Editor tool activated!')}
                  className="bg-[#0B0F19] hover:bg-[#1A1F33] border border-gray-800 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 transition-colors group"
                >
                  <i className="fa-solid fa-code text-lg text-pink-400 group-hover:scale-110 transition-transform"></i>
                  <span className="text-xs text-white font-medium">Code Editor</span>
                  <span className="text-[8px] text-gray-500 leading-none">Write code</span>
                </button>
              </div>
            </section>

            {/* Tips for a better answer list */}
            <section className="panel-bg rounded-2xl p-6 border border-gray-800 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <i className="fa-regular fa-lightbulb text-teal-400"></i>
                  <h3 className="font-semibold text-white">Tips for a Better Answer</h3>
                </div>
              </div>
              
              <ul className="space-y-3.5 relative z-10 w-2/3">
                <li className="flex items-start gap-2.5 text-xs text-gray-300 leading-tight">
                  <i className="fa-solid fa-circle-check text-teal-500 mt-0.5"></i>
                  <span>Structure your answer using STAR method</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-gray-300 leading-tight">
                  <i className="fa-solid fa-circle-check text-teal-500 mt-0.5"></i>
                  <span>Be concise &amp; to the point</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-gray-300 leading-tight">
                  <i className="fa-solid fa-circle-check text-teal-500 mt-0.5"></i>
                  <span>Think out loud when solving problems</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-gray-300 leading-tight">
                  <i className="fa-solid fa-circle-check text-teal-500 mt-0.5"></i>
                  <span>Review &amp; improve with AI feedback</span>
                </li>
              </ul>

              {/* decorative vector circle graphic */}
              <div className="absolute right-4 bottom-4 w-24 h-24 opacity-25 pointer-events-none">
                <svg fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="40" stroke="#14B8A6" strokeOpacity="0.4" strokeWidth="4"></circle>
                  <circle cx="50" cy="50" r="25" stroke="#14B8A6" strokeOpacity="0.7" strokeWidth="4"></circle>
                  <circle cx="50" cy="50" fill="#14B8A6" r="10"></circle>
                  <path d="M80 20 L55 45" stroke="#14B8A6" strokeLinecap="round" strokeWidth="3"></path>
                  <path d="M75 15 L85 25 L80 20 Z" fill="#14B8A6"></path>
                </svg>
              </div>
            </section>

          </div>
        </div>
      )}
    </div>
  );
}
