import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, X, Crown, Zap, Users, ArrowRight, Shield } from "lucide-react";
import { Reveal } from "../fx/Reveal";
import { Magnetic } from "../fx/Magnetic";
import { useAuth } from "../../../context/AuthContext";
import { usePlan } from "../../../hooks/usePlan";

/* ─── Plan Data ──────────────────────────────────────────── */
const plans = [
  {
    id: "free",
    name: "Starter",
    icon: Zap,
    monthlyPrice: 0,
    annualPrice: 0,
    period: "forever",
    desc: "Start your placement journey",
    badge: null,
    color: "#64748B",
    features: [
      { text: "5 mock interviews / month", included: true },
      { text: "Basic resume scoring", included: true },
      { text: "10 coding challenges / month", included: true },
      { text: "Community leaderboard", included: true },
      { text: "TRESK AI Career Copilot", included: false },
      { text: "Interview Replay", included: false },
      { text: "Company placement insights", included: false },
      { text: "Daily challenges + contests", included: false },
    ],
    cta: "Start Free",
    featured: false,
  },
  {
    id: "pro",
    name: "Pro",
    icon: Crown,
    monthlyPrice: 499,
    annualPrice: 333,
    period: "/month",
    desc: "Everything you need to crack top companies",
    badge: "🔥 Most Popular",
    color: "#6366F1",
    features: [
      { text: "Unlimited mock interviews", included: true },
      { text: "Full ATS resume analysis", included: true },
      { text: "Unlimited coding challenges", included: true },
      { text: "Company leaderboard + XP", included: true },
      { text: "TRESK AI Career Copilot", included: true },
      { text: "Interview Replay & analytics", included: true },
      { text: "Company placement insights", included: true },
      { text: "Daily challenges + weekly contests", included: true },
    ],
    cta: "Upgrade to Pro",
    featured: true,
  },
  {
    id: "teams",
    name: "Teams",
    icon: Users,
    monthlyPrice: 1999,
    annualPrice: 1333,
    period: "/month",
    desc: "For placement cells and coding clubs",
    badge: null,
    color: "#F59E0B",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Up to 25 team members", included: true },
      { text: "Admin dashboard & analytics", included: true },
      { text: "Custom branding", included: true },
      { text: "Priority support (24h SLA)", included: true },
      { text: "Bulk interview scheduling", included: true },
      { text: "Export reports (PDF/CSV)", included: true },
      { text: "Dedicated onboarding", included: true },
    ],
    cta: "Upgrade to Teams",
    featured: false,
  },
];

/* ─── Helpers ───────────────────────────────────────────── */
const fmt = (n) => `₹${n.toLocaleString("en-IN")}`;

/* ─── Confirmation Modal ────────────────────────────────── */
function PlanModal({ plan, annual, onConfirm, onClose }) {
  if (!plan) return null;
  const Icon = plan.icon;
  const price = annual ? plan.annualPrice : plan.monthlyPrice;
  const billing = annual ? "billed annually" : "billed monthly";
  const annualSavings = plan.monthlyPrice
    ? Math.round(((plan.monthlyPrice - plan.annualPrice) * 12) / 100) * 100
    : 0;

  return (
    <AnimatePresence>
      <motion.div
        className="lp-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="lp-modal-card"
          initial={{ opacity: 0, scale: 0.85, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glow ring */}
          <div className="lp-modal-glow" style={{ background: `radial-gradient(circle, ${plan.color}33, transparent 70%)` }} />

          <button className="lp-modal-close" onClick={onClose}>
            <X size={18} />
          </button>

          <div className="lp-modal-icon" style={{ background: `${plan.color}22`, border: `1px solid ${plan.color}44` }}>
            <Icon size={28} color={plan.color} />
          </div>

          <h3 className="lp-modal-title">
            Activate <span className="lp-text-gradient">{plan.name}</span> Plan
          </h3>
          <p className="lp-modal-sub">
            {plan.id === "free"
              ? "Switch to the free plan — you'll lose access to paid features immediately."
              : `You're choosing ${plan.name} at ${fmt(price)}/${annual ? "mo" : "month"} (${billing}).`}
          </p>

          {annual && annualSavings > 0 && (
            <div className="lp-modal-saving">
              🎉 You save <strong>₹{annualSavings.toLocaleString("en-IN")}/year</strong> with the annual plan!
            </div>
          )}

          <ul className="lp-modal-features">
            {plan.features.filter((f) => f.included).map((f) => (
              <li key={f.text} className="lp-modal-feature">
                <Check size={14} color={plan.color} />
                {f.text}
              </li>
            ))}
          </ul>

          <div className="lp-modal-actions">
            <button className="lp-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              className="lp-modal-confirm"
              style={{ background: `linear-gradient(135deg, ${plan.color}, ${plan.id === "pro" ? "#7c6fcd" : plan.color}cc)` }}
              onClick={() => onConfirm(plan.id)}
            >
              <Shield size={16} />
              {plan.id === "free" ? "Downgrade to Free" : `Activate ${plan.name}`}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Success Toast ─────────────────────────────────────── */
function Toast({ message, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="lp-toast"
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.9 }}
        >
          <Check size={16} color="#4ade80" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Main Pricing Section ──────────────────────────────── */
export function Pricing() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { plan: currentPlan, selectPlan } = usePlan();
  const [annual, setAnnual] = useState(false);
  const [pendingPlan, setPendingPlan] = useState(null);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const handleCTA = (p) => {
    if (!token) {
      // Not logged in — send to register
      navigate("/register");
      return;
    }
    if (p.id === currentPlan) return; // already on this plan
    setPendingPlan(p);
  };

  const handleConfirm = (planId) => {
    selectPlan(planId);
    setPendingPlan(null);
    const label = plans.find((p) => p.id === planId)?.name;
    setToastMsg(`✅ Successfully switched to ${label} plan!`);
    setToast(true);
    setTimeout(() => setToast(false), 3500);
  };

  return (
    <>
      <section id="pricing" className="lp-pricing">
        <div className="lp-pricing-bg">
          <div className="lp-pricing-aurora" />
          <div className="lp-pricing-overlay" />
          <div className="lp-pricing-dots" />
        </div>

        <div className="lp-section-inner">
          <Reveal className="lp-section-header">
            <span className="lp-section-eyebrow">Pricing</span>
            <h2 className="lp-section-title">
              Invest in your <span className="lp-text-gradient">next offer</span>
            </h2>
            <p className="lp-pricing-sub">
              All prices in Indian Rupees (₹). Cancel anytime.
            </p>
          </Reveal>

          {/* Billing Toggle */}
          <div className="lp-billing-toggle">
            <button
              className={`lp-toggle-btn ${!annual ? "lp-toggle-active" : ""}`}
              onClick={() => setAnnual(false)}
            >
              Monthly
            </button>
            <button
              className={`lp-toggle-btn ${annual ? "lp-toggle-active" : ""}`}
              onClick={() => setAnnual(true)}
            >
              Annual
              <span className="lp-toggle-badge">Save 33%</span>
            </button>
          </div>

          {/* Plan Cards */}
          <div className="lp-plans-grid">
            {plans.map((p, i) => {
              const Icon = p.icon;
              const isActive = token && currentPlan === p.id;
              const price = annual ? p.annualPrice : p.monthlyPrice;

              return (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ type: "spring", stiffness: 80, damping: 16, delay: i * 0.12 }}
                  whileHover={{ y: -8 }}
                  className={`lp-plan-card ${p.featured ? "lp-plan-featured" : ""} ${isActive ? "lp-plan-active" : ""}`}
                >
                  {p.featured && p.badge && (
                    <>
                      <motion.div
                        aria-hidden
                        className="lp-plan-border-glow"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      />
                      <span className="lp-plan-badge">{p.badge}</span>
                    </>
                  )}

                  {isActive && (
                    <span className="lp-plan-active-badge">✓ Current Plan</span>
                  )}

                  <div className="lp-plan-header">
                    <div
                      className="lp-plan-icon"
                      style={{ background: `${p.color}18`, border: `1px solid ${p.color}33` }}
                    >
                      <Icon size={20} color={p.color} />
                    </div>
                    <h3 className="lp-plan-name">{p.name}</h3>
                  </div>

                  <p className="lp-plan-desc">{p.desc}</p>

                  <div className="lp-plan-price-row">
                    <motion.span
                      key={`${p.id}-${annual}`}
                      initial={{ opacity: 0, y: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`lp-plan-price ${p.featured ? "lp-text-gradient" : ""}`}
                    >
                      {fmt(price)}
                    </motion.span>
                    {(price > 0 || p.id === "free") && (
                      <span className="lp-plan-period">{p.period}</span>
                    )}
                  </div>

                  {annual && p.monthlyPrice > 0 && (
                    <p className="lp-plan-annual-note">
                      ₹{(p.annualPrice * 12).toLocaleString("en-IN")}/year — save ₹{((p.monthlyPrice - p.annualPrice) * 12).toLocaleString("en-IN")}
                    </p>
                  )}

                  <ul className="lp-plan-features">
                    {p.features.map((f) => (
                      <li
                        key={f.text}
                        className={`lp-plan-feature ${f.included ? "" : "lp-plan-feature-locked"}`}
                      >
                        <span className={`lp-plan-check ${f.included ? "" : "lp-plan-check-locked"}`}>
                          {f.included
                            ? <Check size={12} color={p.color} />
                            : <X size={12} color="#555" />
                          }
                        </span>
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>

                  <Magnetic strength={0.2} className="lp-plan-cta-wrap">
                    <button
                      onClick={() => handleCTA(p)}
                      disabled={isActive}
                      className={`lp-plan-cta ${p.featured ? "lp-btn-primary" : "lp-btn-glass"} ${isActive ? "lp-plan-cta-current" : ""}`}
                      style={isActive ? { opacity: 0.6, cursor: "default" } : {}}
                    >
                      {isActive ? (
                        <>✓ Current Plan</>
                      ) : (
                        <>
                          {p.cta}
                          {p.featured && <Sparkles size={16} />}
                          {!p.featured && <ArrowRight size={14} />}
                        </>
                      )}
                    </button>
                  </Magnetic>
                </motion.div>
              );
            })}
          </div>

          {/* Feature Comparison Note */}
          <Reveal>
            <div className="lp-pricing-note">
              <Shield size={14} />
              <span>Secure payments powered by Razorpay. GST included. Cancel or upgrade anytime.</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Plan Confirmation Modal */}
      <AnimatePresence>
        {pendingPlan && (
          <PlanModal
            plan={pendingPlan}
            annual={annual}
            onConfirm={handleConfirm}
            onClose={() => setPendingPlan(null)}
          />
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <Toast message={toastMsg} visible={toast} />
    </>
  );
}
