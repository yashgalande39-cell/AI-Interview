import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';
import { 
  MessageSquare, X, Send, Sparkles, Loader2, 
  HelpCircle, ArrowRightLeft, BookOpen, Compass 
} from 'lucide-react';

export default function ChatAssistant() {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: "Hello! I am **Aura**, your dedicated AI Interview Prep Assistant. Ask me anything about placement strategies, technical concepts, mock interview rules, or sandbox practice!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  const quickPrompts = [
    { label: "Optimize ATS Resume", text: "How do I optimize my resume for a high ATS compatibility score?" },
    { label: "STAR Interview Method", text: "Explain how to structure answers using the STAR method in behavioral rounds." },
    { label: "Coding Practice Tips", text: "What is the best strategy to approach coding questions in the Double-Panel Sandbox?" }
  ];

  // Scroll to bottom whenever new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    if (!textToSend) setInput('');
    
    // 1. Add user message
    const updatedMessages = [...messages, { role: 'user', text: query }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Format chat history context for Gemini (filter out initial bot message if desired, or send all)
      const chatHistory = updatedMessages.slice(1, -1).map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch(`${API_BASE}/chat-assistant`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          message: query,
          chatHistory
        })
      });
      const data = await res.json();
      
      if (res.ok && data.reply) {
        setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
      } else {
        throw new Error(data.message || "Failed assistant response");
      }
    } catch (e) {
      console.warn("Real-time assistant error, using fallback matching reply:", e.message);
      // Fallback matching replies if offline
      let reply = "I apologize, I'm having trouble matching with my AI core. Please try again or type a prep keyword!";
      const qLower = query.toLowerCase();
      if (qLower.includes("resume") || qLower.includes("ats")) {
        reply = "You can optimize ATS keywords by building your CV in our **Resume Hub** tab, running an ATS scan, and aligning missing parameters.";
      } else if (qLower.includes("interview") || qLower.includes("lobby")) {
        reply = "Configure adaptive mock voice rounds inside the **Interview Room** using standard microphones and cameras tracking gaze Stress.";
      } else if (qLower.includes("code") || qLower.includes("sandbox")) {
        reply = "Compile algorithms inside the **Coding Sandbox** side-by-side with automatic test checks checking outputs.";
      }
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPromptClick = (text) => {
    handleSend(text);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 print:hidden font-sans">
      {/* Floating Glowing Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-glow-gradient hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 border border-violet-400/20 transition-all cursor-pointer group relative"
        >
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-ping"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full"></div>
          <MessageSquare className="w-6 h-6 transition-transform group-hover:rotate-6" />
        </button>
      )}

      {/* Expanded Glassmorphic Chat Widget */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] glass-panel rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-950 to-[#090d16] flex flex-col justify-between overflow-hidden shadow-2xl animate-scale-up">
          {/* Header */}
          <div className="px-5 py-4 bg-slate-900/60 border-b border-slate-850 flex justify-between items-center relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-violet-500/5 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-full bg-violet-500/10 border border-violet-500/25 flex items-center justify-center text-lg shadow-sm">
                🤖
              </span>
              <div className="text-left">
                <h4 className="font-extrabold text-slate-200 text-xs flex items-center gap-1.5">
                  Aura <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse"></span> Online</span>
                </h4>
                <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase">AI Prep Assistant</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Panel */}
          <div 
            ref={scrollRef}
            className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[350px] leading-relaxed"
          >
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <span className="w-7 h-7 shrink-0 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-sm">
                    🤖
                  </span>
                )}
                <div 
                  className={`p-3.5 rounded-2xl border text-xs max-w-[80%] leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-violet-500/5 border-violet-500/15 text-slate-200 rounded-tr-none' 
                      : 'bg-slate-950/60 border-slate-900 text-slate-300 rounded-tl-none font-medium'
                  }`}
                >
                  <p className="whitespace-pre-line leading-normal">
                    {msg.text.replace(/\*\*(.*?)\*\*/g, '$1')}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <span className="w-7 h-7 shrink-0 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-sm animate-pulse">
                  🤖
                </span>
                <div className="p-3.5 rounded-2xl rounded-tl-none border border-slate-900 bg-slate-950/60 text-xs text-slate-500 font-bold flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" /> Aura is thinking...
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts & Inputs */}
          <div className="p-4 bg-slate-950/40 border-t border-slate-900/60 space-y-3">
            {/* Quick Prompts Carousel if feed is short */}
            {messages.length === 1 && !isLoading && (
              <div className="space-y-1.5 text-left">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest pl-1">Suggested Questions</span>
                <div className="flex flex-col gap-1.5">
                  {quickPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickPromptClick(p.text)}
                      className="px-3 py-2 bg-slate-950 border border-slate-900 hover:border-slate-850 hover:bg-slate-900/20 rounded-xl text-[10px] text-slate-400 text-left hover:text-slate-200 transition-colors w-full font-bold flex items-center justify-between"
                    >
                      <span>{p.label}</span>
                      <span className="text-violet-400 font-extrabold font-mono">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form Input */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask Aura a placement question..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-855 rounded-xl text-xs text-slate-300 outline-none focus:border-violet-500 transition-all"
              />
              <button 
                type="submit" 
                disabled={isLoading}
                className="p-2.5 bg-glow-gradient rounded-xl text-white hover:scale-102 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
