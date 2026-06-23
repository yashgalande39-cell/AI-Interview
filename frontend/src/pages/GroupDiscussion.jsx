import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { BACKEND_URL, API_BASE } from '../config';
import { 
  Pause, ChevronRight, Copy, Users2
} from 'lucide-react';

export default function GroupDiscussion() {
  const { token, user, updateXp } = useAuth();

  // Topic presets
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  
  // Real-time peer-to-peer variables
  const [roomMode, setRoomMode] = useState('lobby'); // 'lobby', 'solo', 'multi'
  const [roomId, setRoomId] = useState('');
  const [inputRoomId, setInputRoomId] = useState('');
  const [peersList, setPeersList] = useState([]);
  
  // Debate Feed
  const [messages, setMessages] = useState([]);
  const [userText, setUserText] = useState("");
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [speakingIndex, setSpeakingIndex] = useState(0);

  // References
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const res = await fetch(`${API_BASE}/gamification/gd-topic`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTopic(data.gdTopic);
        } else {
          throw new Error("Topic failed");
        }
      } catch (e) {
        console.warn("Using default GD topic presets", e.message);
        setTopic({
          id: "gd_1",
          title: "Will AI and Automation eliminate Software Engineering jobs?",
          description: "Analyze the implications of generative code assistants (like Gemini/GitHub Copilot) on junior developer roles and engineering careers.",
          participants: [
            { name: "Rohit (AI Enthusiast)", avatar: "🤖", color: "border-purple-500 text-purple-400" },
            { name: "Sneha (Experienced Manager)", avatar: "💼", color: "border-cyan-500 text-cyan-400" },
            { name: "David (Ethicist)", avatar: "⚖️", color: "border-amber-500 text-amber-400" },
            { name: "Anjali (Junior Dev)", avatar: "💻", color: "border-pink-500 text-pink-400" }
          ],
          aiDialogueTemplates: [
            "Generative tools will take over routine tasks like boilerplate coding, which means we can focus on core systems design.",
            "I agree, Rohit. Historically, software automation has always boosted coding jobs rather than destroying them.",
            "But we must consider entry-level hiring. If AI writes all basic code, how will junior engineers build early skills?"
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [token]);

  // Socket.IO configurations for Real-time bridge
  useEffect(() => {
    socketRef.current = io(BACKEND_URL, {
      auth: { token }
    });

    socketRef.current.on('connect', () => {
      console.log('🔌 Connected to Socket.IO signaling channel.');
    });

    // Listen for peer joins
    socketRef.current.on('peer_joined', ({ socketId }) => {
      console.log('👤 Peer joined roundtable:', socketId);
      setPeersList(prev => [...prev, { name: "Friend (Candidate)", avatar: "👨‍🎓" }]);
      setMessages(prev => [...prev, { sender: "System", text: "A friend has joined the roundtable! Real-time bridge secured.", avatar: "📢" }]);
    });

    // Listen for peer messages
    socketRef.current.on('gd_message_receive', ({ sender, text, avatar }) => {
      setMessages(prev => [...prev, { sender, text, avatar }]);
      speakDialogue(sender, text);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Text-To-Speech debating dialogs
  function speakDialogue(name, text) {
    if ('speechSynthesis' in window && started) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setActiveSpeaker(name);
      utterance.onend = () => {
        setActiveSpeaker(null);
        // Only trigger next AI turn if it was an AI participant speaking
        const isAI = topic?.participants.some(p => p.name === name);
        if (isAI) {
          setTimeout(() => {
            triggerNextAiTurn();
          }, 3500);
        }
      };
      window.speechSynthesis.speak(utterance);
    }
  }

  const triggerNextAiTurn = () => {
    if (!topic || speakingIndex >= topic.aiDialogueTemplates.length) {
      return;
    }
    const idx = speakingIndex;
    const speaker = topic.participants[idx % topic.participants.length];
    const text = topic.aiDialogueTemplates[idx];

    setMessages(prev => [...prev, { sender: speaker.name, text, avatar: speaker.avatar }]);
    setSpeakingIndex(prev => prev + 1);
    speakDialogue(speaker.name, text);
  };

  // Host P2P debate room
  const handleHostRoom = () => {
    const randomId = 'GD-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    setRoomId(randomId);
    setRoomMode('multi');
    setStarted(true);

    socketRef.current.emit('join_room', randomId);
    setMessages([{ sender: "System", text: `Room hosted! Share Key: ${randomId} with a friend to start.`, avatar: "📢" }]);
  };

  // Join existing friend's room
  const handleJoinRoom = () => {
    const key = inputRoomId.trim().toUpperCase();
    if (!key) {
      alert("Please enter a valid Room Key first.");
      return;
    }
    setRoomId(key);
    setRoomMode('multi');
    setStarted(true);
    setPeersList([{ name: "Room Host", avatar: "👨‍🎓" }]);

    socketRef.current.emit('join_room', key);
    setMessages([{ sender: "System", text: `Joined room: ${key}! Synchronizing roundtable...`, avatar: "📢" }]);
    
    // Automatically announce presence
    setTimeout(() => {
      socketRef.current.emit('gd_message', {
        roomId: key,
        sender: user?.name || "Friend",
        text: "Hello everyone! I've joined the round table to discuss this AI topic.",
        avatar: "👨‍🎓"
      });
    }, 1500);
  };

  const handleStartSolo = () => {
    setRoomMode('solo');
    setStarted(true);
    setMessages([{ sender: "System", text: "Solo Practice started. Topic announced.", avatar: "📢" }]);
    setTimeout(() => {
      triggerNextAiTurn();
    }, 1500);
  };

  // Post speech answers
  const handlePostSpeech = (e) => {
    e.preventDefault();
    if (!userText.trim()) return;

    const senderName = user?.name || "You";
    const textPayload = userText.trim();
    setUserText("");

    // 1. Update local chat feed
    setMessages(prev => [...prev, { sender: `You (${senderName})`, text: textPayload, avatar: "👨‍🎓" }]);

    // 2. Broadcast via Socket.IO if in peer mode
    if (roomMode === 'multi') {
      socketRef.current.emit('gd_message', {
        roomId,
        sender: senderName,
        text: textPayload,
        avatar: "👨‍🎓"
      });
    }

    // 3. AI react to user statement
    setTimeout(() => {
      const responder = topic.participants[Math.floor(Math.random() * topic.participants.length)];
      const reaction = `That's an interesting point from ${senderName}. It addresses how dynamic developers will transition their core competencies.`;
      setMessages(prev => [...prev, { sender: responder.name, text: reaction, avatar: responder.avatar }]);
      speakDialogue(responder.name, reaction);
    }, 2500);
  };

  const handleFinishGD = () => {
    setStarted(false);
    setRoomMode('lobby');
    setPeersList([]);
    window.speechSynthesis.cancel();
    alert("🎉 Mock Group Discussion complete! +120 XP points claimed.");
    updateXp(120, "Debating Scholar");
  };

  const copyRoomKey = () => {
    navigator.clipboard.writeText(roomId);
    alert("Room Key copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-accentViolet border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-6 w-full">
      
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
          👥 Mock Group Discussion & Real-Time Peer Bridge
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm">
          Simulate round table discussions, share live room keys with real friends, and debate alongside AI models in real-time.
        </p>
      </div>

      {roomMode === 'lobby' ? (
        /* Lobby setup cards */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Option 1: Practice Solo */}
          <div className="glass-panel rounded-3xl p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-accentCyan uppercase tracking-widest">Self Practice</span>
              <h3 className="text-lg font-bold text-slate-200">Start Solo Mock GD</h3>
              <p className="text-xs text-slate-450 leading-relaxed">
                Practice debating against the 4 preloaded AI participants in an automated audio turn-taking loop.
              </p>
            </div>
            <button 
              onClick={handleStartSolo}
              className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-850 py-3 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
            >
              Start Solo Practice
            </button>
          </div>

          {/* Option 2: Host Room */}
          <div className="glass-panel rounded-3xl p-6 space-y-4 flex flex-col justify-between bg-gradient-to-b from-violet-500/5 to-slate-950/40 border-violet-500/20">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Collaborative</span>
              <h3 className="text-lg font-bold text-slate-200">Host Peer Roundtable</h3>
              <p className="text-xs text-slate-450 leading-relaxed">
                Create a secure lobby room code. Share it with a friend so they can join the discussion in real-time!
              </p>
            </div>
            <button 
              onClick={handleHostRoom}
              className="w-full bg-glow-gradient py-3 rounded-xl text-xs font-bold text-white shadow shadow-violet-500/10 transition-all active:scale-95"
            >
              Host P2P Session
            </button>
          </div>

          {/* Option 3: Join Room */}
          <div className="glass-panel rounded-3xl p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Friend lobby</span>
              <h3 className="text-lg font-bold text-slate-200">Join Friend's Room</h3>
              <input 
                type="text" 
                value={inputRoomId}
                onChange={e => setInputRoomId(e.target.value)}
                placeholder="Enter Room Key (e.g. GD-9E8D)..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-350 outline-none"
              />
            </div>
            <button 
              onClick={handleJoinRoom}
              className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-850 py-3 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all active:scale-95"
            >
              Join Active Room
            </button>
          </div>
        </div>
      ) : (
        /* Roundtable & Discussion Screen */
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left panel: Round table map */}
          <div className="xl:col-span-2 space-y-6">
            <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden bg-gradient-to-b from-slate-950/60 to-slate-900/40 text-center min-h-[400px]">
              
              {/* Host information widgets */}
              {roomMode === 'multi' && (
                <div className="flex justify-between items-center bg-slate-950/60 px-4 py-2 border border-slate-900 rounded-xl text-left text-[11px] mb-4">
                  <div>
                    <span className="text-slate-500 font-bold block">Room Key</span>
                    <span className="font-extrabold text-accentCyan flex items-center gap-1.5 cursor-pointer" onClick={copyRoomKey}>
                      {roomId} <Copy className="w-3 h-3 text-slate-400" />
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 font-bold block">Roundtable Users</span>
                    <span className="text-slate-300 font-bold flex items-center gap-1"><Users2 className="w-3.5 h-3.5 text-accentCyan" /> {1 + peersList.length} Connected</span>
                  </div>
                </div>
              )}

              {/* Roundtable Visual placement */}
              <div className="relative w-full h-72 flex items-center justify-center">
                {/* Center table */}
                <div className="w-36 h-36 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner relative z-10">
                  <div className="text-[10px] uppercase tracking-widest font-black text-slate-500">Discussion Desk</div>
                </div>

                {/* Placements of AI participants */}
                {topic?.participants.map((p, idx) => {
                  const pos = [
                    "absolute top-2 left-1/4 -translate-x-1/2",
                    "absolute bottom-2 left-1/4 -translate-x-1/2",
                    "absolute left-2 top-1/2 -translate-y-1/2",
                    "absolute right-2 top-1/2 -translate-y-1/2"
                  ][idx];
                  
                  const isSpeaking = activeSpeaker === p.name;

                  return (
                    <div key={p.name} className={`${pos} flex flex-col items-center gap-1.5`}>
                      <div className={`w-14 h-14 rounded-full bg-slate-950 border-2 ${p.color} flex items-center justify-center text-xl shadow-md transition-all ${isSpeaking ? 'scale-110 ring-4 ring-cyan-500/20' : ''}`}>
                        {p.avatar}
                      </div>
                      <span className="text-[9px] font-bold text-slate-400">{p.name.split(' ')[0]}</span>
                      {isSpeaking && <span className="text-[8px] bg-cyan-500 text-slate-950 px-1.5 rounded font-black tracking-wider animate-pulse">SPEAKING</span>}
                    </div>
                  );
                })}

                {/* Placement of Candidate User */}
                <div className="absolute top-2 right-1/4 translate-x-1/2 flex flex-col items-center gap-1.5">
                  <div className={`w-14 h-14 rounded-full bg-slate-950 border-2 border-violet-500 text-violet-400 flex items-center justify-center text-xl shadow-md transition-all ${activeSpeaker === user?.name ? 'scale-110 ring-4 ring-violet-500/20' : ''}`}>
                    👨‍🎓
                  </div>
                  <span className="text-[9px] font-bold text-slate-400">You</span>
                </div>

                {/* Placement of Connected human Peer Friends */}
                {peersList.map((peer, i) => (
                  <div key={i} className="absolute bottom-2 right-1/4 translate-x-1/2 flex flex-col items-center gap-1.5">
                    <div className={`w-14 h-14 rounded-full bg-slate-950 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center text-xl shadow-md transition-all ${activeSpeaker === peer.name ? 'scale-110 ring-4 ring-emerald-500/20' : ''}`}>
                      {peer.avatar}
                    </div>
                    <span className="text-[9px] font-bold text-slate-400">{peer.name.split(' ')[0]}</span>
                    {activeSpeaker === peer.name && <span className="text-[8px] bg-emerald-500 text-slate-950 px-1.5 rounded font-black tracking-wider animate-pulse">SPEAKING</span>}
                  </div>
                ))}
              </div>

              {/* Topic description */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-900 text-left space-y-2">
                <div className="text-xs font-bold text-slate-200">GD Topic: "{topic?.title}"</div>
                <p className="text-[11px] text-slate-450 leading-relaxed">{topic?.description}</p>
              </div>

              <div className="flex gap-3 justify-center">
                <button 
                  onClick={handleFinishGD}
                  className="bg-rose-500 hover:bg-rose-650 px-8 py-3.5 rounded-xl text-xs font-bold text-white shadow transition-all flex items-center gap-1.5"
                >
                  <Pause className="w-4 h-4" /> Conclude & Claim XP
                </button>
              </div>
            </div>
          </div>

          {/* Right panel: Active chat conversation feed */}
          <div className="glass-panel rounded-3xl p-6 space-y-4 flex flex-col justify-between h-[500px]">
            <div>
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3">ROUNDTABLE DEBATE FEED</h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 p-2">
              {messages.map((msg, i) => (
                <div key={i} className={`p-3 rounded-2xl border text-xs space-y-1 ${msg.sender.includes('You') ? 'bg-violet-500/5 border-violet-500/10' : msg.sender.includes('Friend') || msg.sender.includes('Host') ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-slate-950/40 border-slate-900'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-350">
                      <span>{msg.avatar}</span>
                      <span>{msg.sender}</span>
                    </div>
                  </div>
                  <p className="text-slate-400 leading-normal pl-0.5">"{msg.text}"</p>
                </div>
              ))}
            </div>

            <form onSubmit={handlePostSpeech} className="flex gap-2 border-t border-slate-900/60 pt-3">
              <input 
                type="text" 
                value={userText}
                onChange={e => setUserText(e.target.value)}
                placeholder="Pitch your argument (types or talks)..."
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 outline-none focus:border-accentViolet"
              />
              <button type="submit" className="p-2.5 bg-glow-gradient rounded-xl text-white hover:scale-102 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
