import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Magnetic } from "../fx/Magnetic";

const EASE = [0.22, 1, 0.36, 1];
const words = ["Your", "next", "offer", "starts", "today"];

export function FinalCTA() {
  return (
    <section className="lp-final-cta">
      <div className="lp-final-cta-glow" />

      <div className="lp-final-cta-inner">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="lp-badge"
        >
          <Sparkles size={14} className="lp-text-primary" /> Join 50,000+ candidates
        </motion.div>

        <motion.h2
          className="lp-final-headline"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        >
          {words.map((w, i) => (
            <span key={i} className="lp-headline-word">
              <motion.span
                variants={{
                  hidden: { y: "110%", opacity: 0, filter: "blur(16px)" },
                  show: { y: "0%", opacity: 1, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } },
                }}
                className={`lp-headline-word-inner ${w === "offer" ? "lp-text-gradient" : ""}`}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, ease: EASE }}
          className="lp-final-desc"
        >
          Run your first AI mock interview in under a minute. No credit card. Just instant, expert-level feedback.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, ease: EASE }}
          className="lp-final-ctas"
        >
          <Magnetic strength={0.4}>
            <a href="/register" className="lp-btn-primary lp-btn-shimmer lp-btn-lg">
              <span className="lp-shimmer-layer" />
              <span className="lp-relative-z">Start Mock Interview</span>
              <ArrowRight size={16} className="lp-relative-z lp-icon-slide" />
            </a>
          </Magnetic>
          <Magnetic strength={0.25}>
            <a href="#" className="lp-btn-glass lp-btn-lg">Book a Demo</a>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-inner">
        <div className="lp-brand">
          <span className="lp-brand-icon lp-brand-icon-sm">
            <Sparkles size={16} color="white" />
          </span>
          <span className="lp-brand-text">INTERVIEW AI</span>
        </div>
        <p className="lp-footer-copy">© {new Date().getFullYear()} Interview AI. Master every interview.</p>
        <div className="lp-footer-links">
          <a href="#" className="lp-footer-link">Privacy</a>
          <a href="#" className="lp-footer-link">Terms</a>
          <a href="#" className="lp-footer-link">Contact</a>
        </div>
      </div>
    </footer>
  );
}
