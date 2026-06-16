import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { Reveal } from "../fx/Reveal";

const EASE = [0.22, 1, 0.36, 1];

const testimonials = [
  { name: "Aarav Mehta", role: "SDE @ Google", quote: "The AI interviewer felt unbelievably real. After two weeks of practice I walked into my onsite completely calm and landed the offer." },
  { name: "Sofia Reyes", role: "Product Manager @ Meta", quote: "The analytics pinpointed exactly where I was rambling. My communication score went from 64 to 91 in a month." },
  { name: "Liam Chen", role: "ML Engineer @ Nvidia", quote: "Real-time coding feedback is a game changer. It's like pair-programming with a senior who never gets tired." },
  { name: "Priya Nair", role: "Data Scientist @ Stripe", quote: "The personalized roadmap kept me focused. Every session felt intentional and measurably better than the last." },
  { name: "Noah Williams", role: "Frontend Lead @ Adobe", quote: "Glassy, fast, and genuinely intelligent. This is what the future of interview prep looks like." },
  { name: "Maya Okafor", role: "Backend Engineer @ Amazon", quote: "I practiced HR rounds I used to dread. The instant feedback rebuilt my confidence completely." },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="lp-section">
      <Reveal className="lp-section-header">
        <span className="lp-section-eyebrow">Loved by candidates</span>
        <h2 className="lp-section-title">
          From nervous to <span className="lp-text-gradient">offer in hand</span>
        </h2>
      </Reveal>

      <div className="lp-testimonials-grid">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: EASE, delay: (i % 3) * 0.1 }}
            whileHover={{ y: -6 }}
            className="lp-testimonial-card"
          >
            <Quote size={24} className="lp-testimonial-quote-icon" />
            <p className="lp-testimonial-text">{t.quote}</p>
            <div className="lp-testimonial-stars">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} size={14} className="lp-star" />
              ))}
            </div>
            <div className="lp-testimonial-author">
              <span className="lp-testimonial-avatar">{t.name.charAt(0)}</span>
              <div>
                <div className="lp-testimonial-name">{t.name}</div>
                <div className="lp-testimonial-role">{t.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
