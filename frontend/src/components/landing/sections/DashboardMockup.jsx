import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Mic,
  Video,
  Plus,
  Phone,
  Maximize2,
  ChevronRight,
  X,
} from "lucide-react";
import aiAvatar from "../../../assets/ai-avatar.jpg";
import candidate from "../../../assets/candidate.jpg";
import { CountUp } from "../fx/CountUp";

const EASE = [0.22, 1, 0.36, 1];

const chat = [
  { who: "AI Interviewer", t: "10:32 AM", msg: "Can you explain the difference between Array and Linked List?", me: false },
  { who: "You", t: "10:32 AM", msg: "Arrays store elements in contiguous memory locations, while linked lists use dynamic memory allocation...", me: true },
  { who: "AI Interviewer", t: "10:33 AM", msg: "Great! Can you also discuss the time complexity of insertion in a linked list?", me: false },
];

const codeLines = [
  "def twoSum(nums, target):",
  "    hash_map = {}",
  "    for i, num in enumerate(nums):",
  "        diff = target - num",
  "        if diff in hash_map:",
  "            return [hash_map[diff], i]",
  "        hash_map[num] = i",
  "    return []",
];

const metrics = [
  { label: "Technical Knowledge", value: 88, color: "#7c6fcd" },
  { label: "Problem Solving", value: 82, color: "#a855f7" },
  { label: "Communication", value: 84, color: "#eab308" },
  { label: "Confidence", value: 80, color: "#06b6d4" },
];

function ScoreRing({ score }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const r = 38;
  const c = 2 * Math.PI * r;
  return (
    <div ref={ref} className="lp-score-ring">
      <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(100,90,160,0.3)" strokeWidth="7" />
        <motion.circle
          cx="50" cy="50" r={r} fill="none"
          stroke="url(#scoreGrad)" strokeWidth="7"
          strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={inView ? { strokeDashoffset: c - (c * score) / 100 } : {}}
          transition={{ duration: 2, ease: EASE }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="lp-score-ring-value">
        <CountUp to={score} className="lp-score-number" />
        <span className="lp-score-denom">/100</span>
      </div>
    </div>
  );
}

function TypingCode() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => {
      setCount((c) => (c < codeLines.length ? c + 1 : c));
    }, 240);
    return () => clearInterval(id);
  }, [inView]);

  return (
    <div ref={ref} className="lp-code-block">
      {codeLines.slice(0, count).map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="lp-code-line"
        >
          <span className="lp-code-linenum">{i + 1}</span>
          <span className="lp-code-text">
            {line}
            {i === count - 1 && <span className="lp-code-cursor" />}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function Panel({ title, children, live }) {
  return (
    <div className="lp-panel">
      <div className="lp-panel-header">
        <span className="lp-panel-title">{title}</span>
        {live && (
          <span className="lp-live-badge">
            <span className="lp-live-dot" /> LIVE
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Bar({ value, color, delay = 0.2 }) {
  return (
    <div className="lp-bar-track">
      <motion.div
        className="lp-bar-fill"
        style={{ background: color, boxShadow: `0 0 10px ${color}` }}
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: EASE, delay }}
      />
    </div>
  );
}

export function DashboardMockup() {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 80, damping: 18 });
  const sry = useSpring(ry, { stiffness: 80, damping: 18 });
  const rotateX = useTransform(srx, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(sry, [-0.5, 0.5], [-7, 7]);

  const [visibleChat, setVisibleChat] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setVisibleChat((c) => (c < chat.length ? c + 1 : c)), 1200);
    return () => clearInterval(id);
  }, []);

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    rx.set((e.clientY - rect.top) / rect.height - 0.5);
    ry.set((e.clientX - rect.left) / rect.width - 0.5);
  };
  const reset = () => { rx.set(0); ry.set(0); };

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 1400 }}
      initial={{ opacity: 0, y: 60, filter: "blur(14px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1.2, ease: EASE, delay: 0.6 }}
      className="lp-mockup-wrapper"
      id="how-it-works"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="lp-mockup-grid"
      >
        {/* AI Interviewer */}
        <Panel title="AI INTERVIEWER" live>
          <div className="lp-video-frame">
            <motion.img
              src={aiAvatar}
              alt="AI Interviewer"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="lp-video-img"
            />
            <div className="lp-scanline-overlay" />
            <motion.div
              className="lp-scan-beam"
              animate={{ top: ["0%", "90%", "0%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <div className="lp-video-ring" />
          </div>
          <div className="lp-video-controls">
            {[Mic, Video, Plus, Maximize2].map((Icon, i) => (
              <button key={i} className="lp-ctrl-btn">
                <Icon size={14} />
              </button>
            ))}
            <button className="lp-ctrl-btn lp-ctrl-end">
              <Phone size={14} />
            </button>
          </div>
        </Panel>

        {/* Chat */}
        <Panel title="INTERVIEW CONVERSATION">
          <div className="lp-chat-messages">
            {chat.slice(0, visibleChat).map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className={`lp-chat-msg ${m.me ? "lp-chat-msg-me" : ""}`}
              >
                <div className="lp-chat-meta">
                  <span className="lp-chat-who">{m.who}</span>
                  <span>{m.t}</span>
                </div>
                <p className={`lp-chat-bubble ${m.me ? "lp-chat-bubble-me" : "lp-chat-bubble-ai"}`}>
                  {m.msg}
                </p>
              </motion.div>
            ))}
            <div className="lp-listening">
              <span className="lp-listening-label">Listening…</span>
              <div className="lp-waveform">
                {Array.from({ length: 26 }).map((_, i) => (
                  <motion.span
                    key={i}
                    className="lp-wave-bar"
                    animate={{ height: ["20%", "90%", "30%"] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.05, ease: "easeInOut" }}
                  />
                ))}
              </div>
            </div>
          </div>
        </Panel>

        {/* Candidate + analytics */}
        <Panel title="CANDIDATE" live>
          <div className="lp-video-frame">
            <img src={candidate} alt="Interview candidate" className="lp-video-img lp-video-img-short" />
            <span className="lp-live-overlay">
              <span className="lp-live-dot" /> LIVE
            </span>
          </div>

          <div className="lp-score-row">
            <ScoreRing score={85} />
            <div>
              <div className="lp-score-label">Overall Score</div>
              <div className="lp-score-caption">Great Performance! 🎉</div>
            </div>
          </div>

          <div className="lp-hire-prob">
            <div className="lp-hire-prob-header">
              <span>Hiring Probability</span>
              <X size={12} />
            </div>
            <div className="lp-hire-prob-value-row">
              <span>High Chance</span>
              <span className="lp-hire-prob-pct">78%</span>
            </div>
            <Bar value={78} color="#22c55e" />
          </div>

          <div className="lp-metrics">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.15, ease: EASE }}
              >
                <div className="lp-metric-header">
                  <span className="lp-metric-label">{m.label}</span>
                  <span className="lp-metric-value">{m.value}<span className="lp-metric-denom">/100</span></span>
                </div>
                <Bar value={m.value} color={m.color} delay={0.3 + i * 0.15} />
              </motion.div>
            ))}
          </div>
        </Panel>
      </motion.div>

      {/* Coding panel */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.9, ease: EASE }}
        className="lp-coding-panel"
      >
        <div className="lp-coding-header">
          <div className="lp-coding-header-left">
            <span className="lp-coding-title">Coding Challenge</span>
            <span className="lp-coding-difficulty">Medium</span>
          </div>
          <span className="lp-coding-lang">Python 3</span>
        </div>
        <div className="lp-coding-body">
          <div className="lp-coding-problem">
            <div className="lp-coding-problem-title">Two Sum</div>
            <p className="lp-coding-problem-desc">
              Given an array of integers nums and a target, return indices of the two numbers that add up to target.
            </p>
            <TypingCode />
          </div>
          <div className="lp-coding-tests">
            <div className="lp-coding-tests-title">Test Cases</div>
            {[1, 2].map((n) => (
              <div key={n} className="lp-test-case">
                <div>Test Case {n}</div>
                <div>Input: nums = [2,7,11,15], target = 9</div>
                <div>Output: [0,1]</div>
              </div>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.8 }}
              className="lp-tests-passed"
            >
              ✓ All test cases passed
            </motion.div>
          </div>
        </div>
        <div className="lp-coding-actions">
          <button className="lp-btn-code-secondary">Run Code</button>
          <button className="lp-btn-code-primary">
            Submit Solution <ChevronRight size={12} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
