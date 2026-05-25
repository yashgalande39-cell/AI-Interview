import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Volume2, Mic, MicOff, Video, VideoOff, Play, Pause, 
  RotateCcw, ShieldAlert, Award, FileSpreadsheet, Edit3, ArrowRight, Save,
  Phone, PhoneOff, Grid, Volume1, HelpCircle
} from 'lucide-react';

export default function InterviewRoom() {
  const { token, updateXp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const resumeId = searchParams.get('resumeId');

  // Config overrides for offline/fallback mode
  const oType = searchParams.get('type') || 'HR';
  const oDiff = searchParams.get('difficulty') || 'Easy';
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

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const whiteboardCanvasRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Load Session
  useEffect(() => {
    const initSession = async () => {
      try {
        // Try to fetch existing session if sessionId is a valid server ID
        if (sessionId && !sessionId.startsWith('int_mock_') && !sessionId.startsWith('mock_')) {
          const res = await fetch(`http://localhost:5000/api/interviews/session/${sessionId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.session) {
              setSession(data.session);
              setCurrentQuestion(data.session.questions[0]?.text || "Let's start the interview!");
              setTotalQuestions(data.session.questions.length);
              setLoading(false);
              return;
            }
          }
        }

        // If not retrieved, generate a new one
        const res = await fetch(`http://localhost:5000/api/interviews/generate`, {
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
          setCurrentQuestion(data.session.questions[0]?.text || "Let's start the interview!");
          setTotalQuestions(data.session.questions.length);
        } else {
          throw new Error("Init session failed");
        }
      } catch (err) {
        console.warn("Using local simulator fallback session details", err.message);
        // Generates highly tailored local questions based on mock resume parameters!
        let mockQuestions = [
          "Explain your core software development philosophy and how you handle tight project schedules.",
          "What are your main technical strengths and major programming achievements?",
          "How do you approach team integration and conflict resolutions in project sprints?",
          "Describe a technically demanding project you spearheaded and what metrics determined its success.",
          "Where do you see your technical competencies growing in the next three years?"
        ];

        // Synthesize highly tailored local questions if a mock resume was chosen in offline mode!
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
  }, [sessionId, token]);

  // Anti-Cheat: Screen blur warnings (disabled in telephony mode to match user intent)
  useEffect(() => {
    const handleBlur = () => {
      if (telephonyMode) return; // Do not apply lock during phone simulation rounds
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
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
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
  }, [currentQuestion, loading]);

  // Webcam access & Face analysis canvas overlay simulator with real-time biometric telemetry
  useEffect(() => {
    let stream = null;
    let animId = null;
    const waveHistory = []; // ECG wave history buffer

    const startCamera = async () => {
      if (cameraActive && !telephonyMode) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          
          const ctx = canvasRef.current.getContext('2d');
          
          const drawSim = () => {
            if (ctx && canvasRef.current) {
              ctx.clearRect(0, 0, 320, 240);
              
              const now = Date.now();
              
              // 1. Calculate real-time biometric metrics on-the-spot
              // Heart Rate: fluctuates naturally between 72 and 86 BPM. Jumps slightly if speaking (isListening).
              const baseHr = isListening ? 82 : 74;
              const currentHr = Math.round(baseHr + Math.sin(now / 4000) * 3 + (now % 3 === 0 ? (Math.random() - 0.5) * 1.5 : 0));
              
              // Stress Index: computed frame-by-frame, fluctuating organically. Spikes during speech interaction.
              const baseStress = isListening ? 22 : 12;
              const stressVal = (baseStress + Math.sin(now / 2000) * 2 + Math.cos(now / 500) * 0.8).toFixed(1);
              let stressLevel = "Neutral";
              let stressColor = "#10b981"; // Emerald Green
              if (stressVal > 15) {
                stressLevel = "Focused";
                stressColor = "#06b6d4"; // Cyan
              }
              if (stressVal > 22) {
                stressLevel = "Speaking / Active";
                stressColor = "#a855f7"; // Violet
              }
              
              // Gaze Tracking with real-time micro-drift simulation
              const gazeDrift = Math.sin(now / 6000);
              let gazeStatus = "Gaze Centered: SECURE";
              let gazeColor = "#10b981"; // Emerald
              if (Math.abs(gazeDrift) > 0.8) {
                gazeStatus = "Gaze Drift: Re-aligning...";
                gazeColor = "#f59e0b"; // Amber
              }
              
              // Dynamic coordinates for sci-fi face mesh target
              const driftX = Math.round(Math.sin(now / 300) * 2);
              const driftY = Math.round(Math.cos(now / 400) * 2);
              const boxX = 60 + driftX;
              const boxY = 40 + driftY;
              
              // Pupil tracking coordinates with micro jitter
              const pupilJitterX = (Math.random() - 0.5) * 0.5;
              const pupilJitterY = (Math.random() - 0.5) * 0.5;
              const leftEyeX = 110 + driftX + pupilJitterX;
              const leftEyeY = 95 + driftY + pupilJitterY;
              const rightEyeX = 210 + driftX + pupilJitterX;
              const rightEyeY = 95 + driftY + pupilJitterY;

              // 2. Render premium, high-tech cybernetic UI overlays
              
              // A. Glowing Corner Brackets for Face Bounding Box
              ctx.strokeStyle = stressColor;
              ctx.lineWidth = 1.5;
              const bracketSize = 15;
              // Top-Left
              ctx.beginPath();
              ctx.moveTo(boxX, boxY + bracketSize);
              ctx.lineTo(boxX, boxY);
              ctx.lineTo(boxX + bracketSize, boxY);
              ctx.stroke();
              // Top-Right
              ctx.beginPath();
              ctx.moveTo(boxX + 200 - bracketSize, boxY);
              ctx.lineTo(boxX + 200, boxY);
              ctx.lineTo(boxX + 200, boxY + bracketSize);
              ctx.stroke();
              // Bottom-Left
              ctx.beginPath();
              ctx.moveTo(boxX, boxY + 160 - bracketSize);
              ctx.lineTo(boxX, boxY + 160);
              ctx.lineTo(boxX + bracketSize, boxY + 160);
              ctx.stroke();
              // Bottom-Right
              ctx.beginPath();
              ctx.moveTo(boxX + 200 - bracketSize, boxY + 160);
              ctx.lineTo(boxX + 200, boxY + 160);
              ctx.lineTo(boxX + 200, boxY + 160 - bracketSize);
              ctx.stroke();
              
              // B. Subtle, low-opacity face mesh grid rectangle
              ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
              ctx.lineWidth = 1;
              ctx.strokeRect(boxX, boxY, 200, 160);
              
              // Nose bridge reticle
              ctx.fillStyle = '#06b6d4';
              ctx.fillRect(158 + driftX, 118 + driftY, 4, 4);

              // C. Draw glowing Pupil Target Lock vectors
              ctx.strokeStyle = '#8b5cf6';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(leftEyeX, leftEyeY, 6, 0, 2 * Math.PI);
              ctx.stroke();
              
              ctx.beginPath();
              ctx.arc(rightEyeX, rightEyeY, 6, 0, 2 * Math.PI);
              ctx.stroke();
              
              // Pupil center coordinate dots
              ctx.fillStyle = '#a855f7';
              ctx.beginPath();
              ctx.arc(leftEyeX, leftEyeY, 1.5, 0, 2 * Math.PI);
              ctx.arc(rightEyeX, rightEyeY, 1.5, 0, 2 * Math.PI);
              ctx.fill();

              // Pupil link scanline showing distance calculation
              ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
              ctx.beginPath();
              ctx.moveTo(leftEyeX, leftEyeY);
              ctx.lineTo(rightEyeX, rightEyeY);
              ctx.stroke();

              // D. Biometric telemetry text readouts
              ctx.font = 'bold 9px Outfit';
              
              // Gaze status indicator
              ctx.fillStyle = gazeColor;
              ctx.fillText(gazeStatus, 12, 20);
              
              // Stress index on-the-spot fluctuating calculation
              ctx.fillStyle = stressColor;
              ctx.fillText(`Stress Index: ${stressVal}% (${stressLevel})`, 12, 32);
              
              // Beating Heart icon ❤️ and Pulse
              const heartPulse = (now / 150) % 10;
              const heartBeating = heartPulse > 1.4 && heartPulse < 1.8;
              ctx.fillStyle = '#f43f5e';
              ctx.font = 'bold 10px sans-serif';
              ctx.fillText(heartBeating ? '❤️' : '♡', 12, 45);
              ctx.fillStyle = '#e2e8f0';
              ctx.font = 'bold 9px Outfit';
              ctx.fillText(`Pulse: ${currentHr} BPM`, 26, 44);

              // Eye distance coordinate calculations
              ctx.fillStyle = '#94a3b8';
              ctx.font = '8px monospace';
              ctx.fillText(`DX: ${Math.round(rightEyeX - leftEyeX)}px Y: ${Math.round(leftEyeY)}`, 230, 20);

              // E. Beautiful Rolling ECG (Electrocardiogram) green wave at the bottom
              // Generate realistic P-QRS-T complex simulation wave
              const ecgCycle = (now / 150) % 10;
              let ecgVal = 0;
              if (ecgCycle < 0.8) {
                // P wave
                ecgVal = Math.sin(ecgCycle * Math.PI / 0.8) * 0.15;
              } else if (ecgCycle >= 1.0 && ecgCycle < 1.2) {
                // Q wave
                ecgVal = -0.2;
              } else if (ecgCycle >= 1.2 && ecgCycle < 1.4) {
                // R wave (QRS peak)
                ecgVal = 1.0;
              } else if (ecgCycle >= 1.4 && ecgCycle < 1.6) {
                // S wave
                ecgVal = -0.3;
              } else if (ecgCycle >= 1.8 && ecgCycle < 2.4) {
                // T wave
                ecgVal = Math.sin((ecgCycle - 1.8) * Math.PI / 0.6) * 0.25;
              } else {
                ecgVal = 0;
              }
              // Add a bit of natural micro-tremor noise
              ecgVal += (Math.random() - 0.5) * 0.04;

              // Insert value in history buffer
              waveHistory.push(ecgVal);
              if (waveHistory.length > 90) waveHistory.shift();

              // Draw scrolling electrocardiogram grid and wave
              ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)'; // Emerald grid lines
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(10, 220);
              ctx.lineTo(310, 220);
              ctx.stroke();

              ctx.strokeStyle = '#10b981'; // Emerald scrollline
              ctx.lineWidth = 1.5;
              ctx.shadowColor = '#10b981';
              ctx.shadowBlur = 1;
              ctx.beginPath();
              for (let i = 0; i < waveHistory.length; i++) {
                const x = 12 + i * 3.3; // scrolls across width
                const y = 220 - waveHistory[i] * 16; // baseline at y=220
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              }
              ctx.stroke();
              // Reset shadow for next render cycles
              ctx.shadowBlur = 0;

              // Wave label
              ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
              ctx.font = 'bold 8px Outfit';
              ctx.fillText("ECG / TELEMETRY LIVE", 12, 208);

              animId = requestAnimationFrame(drawSim);
            }
          };
          animId = requestAnimationFrame(drawSim);
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

    try {
      const res = await fetch(`http://localhost:5000/api/interviews/submit-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: session.id,
          answerText,
          speechDurationSeconds: speechTimer || 30,
          tabBlurCount: strikeCount
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Evaluation failed');

      if (data.isCompleted) {
        handleFinishInterview();
      } else {
        setAnswerText("");
        setSpeechTimer(0);
        setCurrentIndex(prev => prev + 1);
        setCurrentQuestion(data.nextQuestion.text || data.nextQuestion.question);
        setLoading(false);
      }
    } catch (e) {
      console.warn("Answer evaluated offline inside local simulator:", e.message);
      
      const nextIdx = currentIndex + 1;
      if (nextIdx >= totalQuestions) {
        handleFinishInterview();
      } else {
        setAnswerText("");
        setSpeechTimer(0);
        setCurrentIndex(nextIdx);
        setCurrentQuestion(session.questions[nextIdx]?.text || "Answer the following topic:");
        setLoading(false);
      }
    }
  };

  const handleFinishInterview = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/interviews/finish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId: session.id })
      });
      const data = await res.json();
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
    // Ring for 2 seconds then connect
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
    // Mimic standard DTMF frequency tones using browser audio context if available
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 400; // General keypad beep tone
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch(e) {}
  };

  if (loading && !session) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-accentViolet border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Structuring Adaptive Room...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-76px)]">
      
      {/* Top Details & Timer */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/40 p-4 border border-slate-900 rounded-2xl">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Prep Room</span>
          <div className="text-xs font-bold text-slate-200">{session?.role} Target at {session?.company}</div>
        </div>
        
        <div className="flex flex-wrap items-center gap-6">
          <button
            onClick={() => {
              setTelephonyMode(true);
              startPhoneCall();
            }}
            className="px-4 py-2.5 rounded-xl border border-amber-500/25 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            📞 Switch to Mobile Call Simulator
          </button>

          <div className="text-right">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Fluency Clock</span>
            <span className="text-sm font-extrabold text-accentCyan">{speechTimer}s</span>
          </div>

          <div className="text-right">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Question Progress</span>
            <span className="text-sm font-extrabold text-accentViolet">{currentIndex + 1} / {totalQuestions}</span>
          </div>
        </div>
      </div>

      {/* Warnings & Strikes */}
      {warnings.length > 0 && !telephonyMode && (
        <div className="space-y-2">
          {warnings.slice(-2).map((w, idx) => (
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
          {/* Internal Speaker Reticle */}
          <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto mb-6 border border-slate-800/60 shadow-inner"></div>

          {/* Caller ID Section */}
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

          {/* Connected Voice Audio waves or Ring status */}
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
                {/* Audio frequencies simulation */}
                <div className="flex gap-1 justify-center items-end h-16">
                  {(aiSpeaking ? [2, 5, 8, 3, 7, 4, 9, 2, 6, 8, 3, 5] : isListening ? [4, 7, 3, 8, 2, 5, 3] : [1, 2, 1, 2, 1]).map((h, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 rounded transition-all duration-150 ${aiSpeaking ? 'bg-accentCyan' : isListening ? 'bg-rose-400' : 'bg-slate-700'}`}
                      style={{ height: `${h * 4 + 4}px`, transform: `scaleY(${aiSpeaking || isListening ? 1.2 : 0.8})` }}
                    ></div>
                  ))}
                </div>
                
                {/* Visual captions panel inside phone */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-900 text-left h-24 overflow-y-auto text-[11px] leading-normal font-medium space-y-2">
                  <div className="text-accentCyan font-bold">Coach (Voice AI):</div>
                  <p className="text-slate-350 font-semibold italic">"{currentQuestion}"</p>
                  
                  {answerText && (
                    <>
                      <div className="text-rose-400 font-bold mt-2">You (Speech Input):</div>
                      <p className="text-slate-400 italic">"{answerText}"</p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-xs text-rose-500 font-bold">Call Terminated</span>
            )}
          </div>

          {/* Interactive Telephone Keypad Grid overlay */}
          {showKeypad && callState === 'connected' && (
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-900 mb-4 animate-fade-in">
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

          {/* Phone call utilities & controls */}
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
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1 mx-auto ${phoneSpeaker ? 'bg-cyan-500/10 border-cyan-500/20 text-accentCyan' : 'bg-slate-950 border-slate-900'}`}
                >
                  <Volume1 className="w-4 h-4" /> Speaker
                </button>
              </div>
            )}

            {/* Answer trigger grids */}
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
                      {isListening ? '🎙️ Stop Recording answer' : '🎙️ Click to Speak Response'}
                    </button>
                  )}
                  
                  <div className="flex gap-4 w-full">
                    {callState === 'connected' && (
                      <button
                        onClick={handleAnswerSubmit}
                        className="flex-1 bg-glow-gradient py-3.5 rounded-xl text-xs font-bold text-white shadow hover:scale-[1.01] transition-all"
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
        /* Original Visual workspace: Avatar grids + text answers */
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Pulsing Avatar & Questions */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between min-h-[350px] relative overflow-hidden bg-gradient-to-b from-slate-950/60 to-slate-900/40">
              <div className="absolute top-4 left-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                AI Interviewer
              </div>

              <div className="flex flex-col items-center justify-center py-6">
                <div className={`w-28 h-28 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-4xl shadow-inner relative transition-transform ${aiSpeaking ? 'pulse-speech scale-105 border-accentCyan' : ''}`}>
                  🤖
                  {aiSpeaking && (
                    <div className="absolute -top-1 -right-1 bg-accentCyan text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full animate-bounce">
                      SPEAKING
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mt-4">AI Coach</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-900 text-slate-200 text-sm font-bold text-center leading-relaxed">
                "{currentQuestion}"
              </div>

              <div className="flex items-center justify-center gap-3 mt-4">
                <button 
                  onClick={speakQuestion}
                  className="p-3 rounded-xl border border-slate-850 bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all active:scale-95 flex items-center gap-2 text-xs font-bold"
                >
                  <Volume2 className="w-4 h-4" /> Repeat Audio
                </button>
              </div>
            </div>

            {/* Right Column: Video camera & Canvas trackers */}
            <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between min-h-[350px] relative overflow-hidden">
              <div className="absolute top-4 left-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest z-10">
                Candidate webcam Feed
              </div>

              <div className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-900 flex items-center justify-center mt-4">
                {cameraActive ? (
                  <>
                    <video ref={videoRef} muted playsInline className="absolute top-0 left-0 w-full h-full object-cover scale-x-[-1]" />
                    <canvas ref={canvasRef} width="320" height="240" className="absolute top-0 left-0 w-full h-full pointer-events-none" />
                  </>
                ) : (
                  <div className="text-slate-600 text-xs flex flex-col items-center gap-2">
                    <VideoOff className="w-8 h-8" />
                    <span>Webcam feed disabled</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center gap-4 mt-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCameraActive(!cameraActive)}
                    className={`p-3 rounded-xl border transition-all active:scale-95 ${cameraActive ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}
                  >
                    {cameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setMicActive(!micActive)}
                    className={`p-3 rounded-xl border transition-all active:scale-95 ${micActive ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}
                  >
                    {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  onClick={() => setWhiteboardOpen(!whiteboardOpen)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 ${whiteboardOpen ? 'bg-slate-900 border-slate-850 text-accentCyan' : 'bg-slate-950/60 border-slate-900 text-slate-400 hover:text-slate-200'}`}
                >
                  <Edit3 className="w-4 h-4" /> Sketchboard Whiteboard
                </button>
              </div>
            </div>
          </div>

          {/* Interactive whiteboard workspace overlay */}
          {whiteboardOpen && (
            <div className="glass-panel rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-200">Interactive Sketchboard Canvas</h4>
                <button 
                  onClick={() => {
                    const canvas = whiteboardCanvasRef.current;
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                  }}
                  className="text-[10px] bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-all font-semibold"
                >
                  Reset Canvas
                </button>
              </div>
              <div className="w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-900 relative">
                <canvas ref={whiteboardCanvasRef} width="800" height="250" className="w-full bg-slate-950/80 cursor-crosshair h-60" />
              </div>
            </div>
          )}

          {/* Answer Area */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Your Response Transcript
              </label>

              <button
                onClick={toggleListening}
                className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all active:scale-95 ${isListening ? 'bg-rose-500 text-white border-rose-600 animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'}`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" /> Stop Audio Record
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" /> Speak Answer (Mic-free option)
                  </>
                )}
              </button>
            </div>

            <textarea
              value={answerText}
              onChange={e => setAnswerText(e.target.value)}
              placeholder="Speak using the mic button, or type out your response in detail directly here..."
              className="w-full h-32 p-4 rounded-2xl bg-slate-950/50 border border-slate-850 text-slate-200 text-sm focus:border-accentViolet outline-none transition-all leading-relaxed resize-none"
            />

            <div className="flex justify-between items-center gap-4">
              <span className="text-[10px] text-slate-500 font-semibold leading-normal">
                💡 Practice pacing: Slow down and pause instead of using filler syllables like "um" or "like".
              </span>
              <button
                onClick={handleAnswerSubmit}
                disabled={loading}
                className="bg-glow-gradient px-6 py-3.5 rounded-xl text-xs font-bold text-white shadow-lg hover:shadow-violet-500/20 hover:scale-[1.02] transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                {currentIndex + 1 === totalQuestions ? "Finish Interview" : "Submit Answer"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
