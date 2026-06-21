import { motion } from "framer-motion";
import { Brain, Code2, MessagesSquare, BarChart3, Target, Trophy, ArrowRight } from "lucide-react";
import { Reveal } from "../fx/Reveal";

const EASE = [0.22, 1, 0.36, 1];

const features = [
  {
    icon: Brain,
    title: "AI Powered Interviews",
    desc: "Advanced AI conducts realistic voice interviews tailored to your role, company, and experience. Gets smarter with every session.",
    accent: "#3B82F6",
    featured: true,
    badge: "Most Popular",
    visual: (
      <div className="flex gap-2 mt-4 sm:mt-0">
        {["Technical", "HR", "Behavioral", "System Design"].map((t, i) => (
          <div key={t}
            className="px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap"
            style={{
              background: `rgba(99,102,241,${0.06 + i * 0.04})`,
              border: `1px solid rgba(99,102,241,${0.1 + i * 0.06})`,
              color: i === 0 ? '#818CF8' : 'rgba(148,163,184,0.8)',
              transform: `translateY(${i % 2 === 0 ? '-4px' : '4px'})`,
              transition: 'all 0.3s ease',
            }}
          >{t}</div>
        ))}
      </div>
    )
  },
  {
    icon: Code2,
    title: "Real-time Coding Arena",
    desc: "Solve DSA problems with live execution, AI hints, and multi-language support.",
    accent: "#8B5CF6",
  },
  {
    icon: MessagesSquare,
    title: "HR Simulation",
    desc: "Practice behavioral questions and soft skill interviews with instant AI feedback.",
    accent: "#06B6D4",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    desc: "Comprehensive performance insights with radar charts, trends, and actionable improvement plans.",
    accent: "#10B981",
  },
  {
    icon: Target,
    title: "Personalized Roadmap",
    desc: "AI generates a custom learning path based on your weaknesses and target company.",
    accent: "#F59E0B",
  },
  {
    icon: Trophy,
    title: "Gamified Progress",
    desc: "Daily challenges, streaks, XP economy, leaderboards, and certifications to keep you motivated.",
    accent: "#EF4444",
    featured: true,
    visual: (
      <div className="flex items-center gap-3 mt-2 sm:mt-0">
        {[
          { label: "Streak", value: "12🔥", color: "#F59E0B" },
          { label: "XP", value: "2,400", color: "#8B5CF6" },
          { label: "Rank", value: "#42", color: "#10B981" },
        ].map(s => (
          <div key={s.label} className="text-center px-3 py-2 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="font-bold text-sm" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>
    )
  },
];

export function Features() {
  return (
    <section id="features" className="lp-section">
      <Reveal className="lp-section-header">
        <span className="lp-section-eyebrow">Capabilities</span>
        <h2 className="lp-section-title">
          Everything you need to <span className="lp-text-gradient">win the offer</span>
        </h2>
        <p className="lp-hero-desc text-center mx-auto mt-3">
          Nine powerful modules. One platform. Designed to take you from first application to final offer.
        </p>
      </Reveal>

      <motion.div
        className="lp-features-grid"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      >
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              variants={{
                hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
                show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE } },
              }}
              whileHover={{ y: -6 }}
              className="lp-feature-card"
              style={{ '--feature-accent': f.accent }}
            >
              <div className="lp-feature-aurora" />
              {f.badge && (
                <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${f.accent}20`, color: f.accent, border: `1px solid ${f.accent}30` }}>
                  {f.badge}
                </span>
              )}

              <div className={f.featured ? 'lp-feature-card-featured' : ''}>
                <div className="lp-feature-content">
                  <span className="lp-feature-icon-wrap" style={{ '--icon-accent': f.accent }}>
                    <Icon size={20} className="lp-feature-icon" />
                  </span>
                  <h3 className="lp-feature-title">{f.title}</h3>
                  <p className="lp-feature-desc">{f.desc}</p>
                  <a href="/register" className="inline-flex items-center gap-1 text-xs font-semibold mt-3 transition-colors"
                    style={{ color: f.accent }}>
                    Get Started <ArrowRight size={12} />
                  </a>
                </div>
                {f.visual && (
                  <div className="lp-feature-visual">{f.visual}</div>
                )}
              </div>

              <span className="lp-feature-glow" />
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
