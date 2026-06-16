import { motion } from "framer-motion";
import { Brain, Code2, MessagesSquare, BarChart3, Target, Trophy } from "lucide-react";
import { Reveal } from "../fx/Reveal";

const EASE = [0.22, 1, 0.36, 1];

const features = [
  { icon: Brain, title: "AI Powered Interviews", desc: "Advanced AI conducts realistic interviews and evaluates your performance." },
  { icon: Code2, title: "Real-time Coding", desc: "Solve coding problems in real-time with intelligent code execution and feedback." },
  { icon: MessagesSquare, title: "HR Interview Simulation", desc: "Practice HR questions with AI and get expert feedback on your responses." },
  { icon: BarChart3, title: "Detailed Analytics", desc: "Get comprehensive analytics and insights to improve your weak areas." },
  { icon: Target, title: "Personalized Roadmap", desc: "AI creates a customized learning path to help you ace your interviews." },
  { icon: Trophy, title: "Expert Approved", desc: "Content curated by industry experts and top interviewers from leading companies." },
];

export function Features() {
  return (
    <section id="features" className="lp-section">
      <Reveal className="lp-section-header">
        <span className="lp-section-eyebrow">Capabilities</span>
        <h2 className="lp-section-title">
          Everything you need to <span className="lp-text-gradient">win the offer</span>
        </h2>
      </Reveal>

      <motion.div
        className="lp-features-grid"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
      >
        {features.map((f) => (
          <motion.div
            key={f.title}
            variants={{
              hidden: { opacity: 0, y: 50, rotate: -1.5, filter: "blur(8px)" },
              show: { opacity: 1, y: 0, rotate: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } },
            }}
            whileHover={{ y: -8 }}
            className="lp-feature-card"
          >
            <div className="lp-feature-aurora" />
            <span className="lp-feature-icon-wrap">
              <f.icon size={20} className="lp-feature-icon" />
            </span>
            <h3 className="lp-feature-title">{f.title}</h3>
            <p className="lp-feature-desc">{f.desc}</p>
            <span className="lp-feature-glow" />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
