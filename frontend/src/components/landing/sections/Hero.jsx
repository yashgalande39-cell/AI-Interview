import { motion } from "framer-motion";
import { Sparkles, Play, Users, TrendingUp, Trophy } from "lucide-react";
import { Magnetic } from "../fx/Magnetic";
import { CountUp } from "../fx/CountUp";
import { DashboardMockup } from "./DashboardMockup";

const EASE = [0.22, 1, 0.36, 1];

const headline = ["Master", "Every", "Interview", "With", "AI"];

const wordVariant = {
  hidden: { y: "110%", opacity: 0, filter: "blur(20px)" },
  show: {
    y: "0%",
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE },
  },
};

const logos = ["Google", "Microsoft", "Amazon", "Tesla", "Meta", "Adobe", "Infosys"];

export function Hero() {
  return (
    <section className="lp-hero">
      <div className="lp-hero-grid">
        {/* Left copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.9 }}
            className="lp-badge"
          >
            <Sparkles size={14} className="lp-text-primary" />
            #1 AI MOCK INTERVIEW PLATFORM
            <Sparkles size={14} className="lp-text-primary" />
          </motion.div>

          <motion.h1
            className="lp-headline"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 1 } } }}
          >
            {headline.map((word, i) => (
              <span key={i} className="lp-headline-word">
                <motion.span variants={wordVariant} className="lp-headline-word-inner">
                  {word === "AI" || word === "With" ? (
                    <span className="lp-text-gradient">{word}</span>
                  ) : (
                    word
                  )}
                </motion.span>
              </span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 1.7 }}
            className="lp-hero-desc"
          >
            Practice Technical, Coding & HR Interviews with an Intelligent AI Interviewer.
            Get Instant Feedback, Performance Analytics, and Personalized Improvement Plans.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: EASE, delay: 1.9 }}
            className="lp-hero-ctas"
          >
            <Magnetic strength={0.3}>
              <a href="/register" className="lp-btn-primary lp-btn-shimmer">
                <span className="lp-shimmer-layer" />
                <span className="lp-relative-z">Start Mock Interview</span>
                <Sparkles size={16} className="lp-relative-z" />
              </a>
            </Magnetic>
            <Magnetic strength={0.25}>
              <a href="#" className="lp-btn-glass">
                Watch Demo
                <span className="lp-play-btn">
                  <Play size={12} className="lp-play-icon" />
                </span>
              </a>
            </Magnetic>
          </motion.div>

          <div className="lp-stats-grid">
            {[
              { icon: Users, value: 50000, suffix: "+", label: "Students Trained" },
              { icon: TrendingUp, value: 1, suffix: "M+", label: "Interviews Conducted" },
              { icon: Trophy, value: 98, suffix: "%", label: "Success Rate" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 2.1 + i * 0.12 }}
                className="lp-stat-card"
              >
                <s.icon size={16} className="lp-stat-icon" />
                <div className="lp-stat-value">
                  <CountUp to={s.value} suffix={s.suffix} />
                </div>
                <div className="lp-stat-label">{s.label}</div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.6, duration: 1 }}
            className="lp-trusted"
          >
            <p className="lp-trusted-label">Trusted by Students from Top Universities & Companies</p>
            <div className="lp-logos">
              {logos.map((l) => (
                <span key={l} className="lp-logo-item">{l}</span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right dashboard */}
        <DashboardMockup />
      </div>
    </section>
  );
}
