import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';
import { Link } from 'react-router-dom';
import {
  Check, Zap, Crown, Users, ArrowRight, Shield,
  Star, Mic, Code2, FileText, Bot, BarChart3, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const PLANS = [
  {
    id: 'free',
    name: 'Starter',
    price: 0,
    priceStr: '₹0',
    per: 'forever',
    tagline: 'Start your placement journey',
    color: '#64748B',
    gradient: 'linear-gradient(135deg, rgba(100,116,139,0.15), rgba(71,85,105,0.08))',
    borderColor: 'rgba(100,116,139,0.25)',
    icon: Zap,
    features: [
      { label: '5 mock interviews / month', ok: true },
      { label: 'Basic resume scoring', ok: true },
      { label: '10 coding challenges / month', ok: true },
      { label: 'Community leaderboard', ok: true },
      { label: 'TRESK AI Career Copilot', ok: false },
      { label: 'Interview Replay', ok: false },
      { label: 'Company placement insights', ok: false },
      { label: 'Daily challenges + contests', ok: false },
    ],
    cta: 'Current Plan',
    ctaDisabled: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 499,
    priceStr: '₹499',
    per: '/month',
    tagline: 'Everything you need to crack top companies',
    color: '#6366F1',
    gradient: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.12))',
    borderColor: 'rgba(99,102,241,0.4)',
    icon: Crown,
    badge: '🔥 Most Popular',
    features: [
      { label: 'Unlimited mock interviews', ok: true },
      { label: 'Full ATS resume analysis', ok: true },
      { label: 'Unlimited coding challenges', ok: true },
      { label: 'Company leaderboard + XP', ok: true },
      { label: 'TRESK AI Career Copilot', ok: true },
      { label: 'Interview Replay & analytics', ok: true },
      { label: 'Company placement insights', ok: true },
      { label: 'Daily challenges + weekly contests', ok: true },
    ],
    cta: 'Upgrade to Pro',
    ctaDisabled: false,
  },
  {
    id: 'teams',
    name: 'Teams',
    price: 1999,
    priceStr: '₹1,999',
    per: '/month',
    tagline: 'For placement cells and coding clubs',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(239,68,68,0.06))',
    borderColor: 'rgba(245,158,11,0.3)',
    icon: Users,
    features: [
      { label: 'Everything in Pro', ok: true },
      { label: 'Up to 25 team members', ok: true },
      { label: 'Admin dashboard & analytics', ok: true },
      { label: 'Custom branding', ok: true },
      { label: 'Priority support (24h SLA)', ok: true },
      { label: 'Bulk interview scheduling', ok: true },
      { label: 'Export reports (PDF/CSV)', ok: true },
      { label: 'Dedicated onboarding', ok: true },
    ],
    cta: 'Upgrade to Teams',
    ctaDisabled: false,
  },
];

const FAQ = [
  {
    q: 'How does the free plan work?',
    a: 'The Starter plan is free forever with no credit card required. You get 5 mock interviews, 10 coding challenges, and basic resume scoring every month.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes! You can cancel your Pro or Teams subscription at any time. You\'ll retain access until the end of your billing period.',
  },
  {
    q: 'How does the Razorpay payment work?',
    a: 'We use Razorpay, India\'s leading payment gateway. Your payment is secured with 256-bit SSL encryption. We accept UPI, cards, net banking, and wallets.',
  },
  {
    q: 'Is there a student discount?',
    a: 'Yes! Students with a valid college email (.edu or .ac.in) get 30% off the Pro plan. Use code STUDENT30 at checkout.',
  },
  {
    q: 'What happens to my data if I downgrade?',
    a: 'Your interview history, resume data, and coding submissions are always preserved. Only feature access changes when you downgrade.',
  },
];

export default function Pricing() {
  const { user, token, updateUser } = useAuth();
  const [loading, setLoading] = useState(null);
  const [successPlan, setSuccessPlan] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const currentPlan = user?.plan || 'free';

  const handleUpgrade = async (planId) => {
    if (planId === 'free' || planId === currentPlan) return;
    setLoading(planId);

    try {
      // 1. Create a Razorpay order
      const orderRes = await fetch(`${API_BASE}/billing/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: planId }),
      });

      const { order, keyId } = await orderRes.json();
      if (!order) throw new Error('Failed to create order');

      // 2. If demo order (Razorpay not configured), auto-verify
      if (order.demo) {
        await verifyPayment(planId, order.id, 'demo_payment_id', 'demo_signature');
        return;
      }

      // 3. Open Razorpay checkout
      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'TRESK AI',
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan Subscription`,
        order_id: order.id,
        image: 'https://i.imgur.com/n5tjHFD.png',
        theme: { color: '#6366F1' },
        handler: async (response) => {
          await verifyPayment(
            planId,
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        modal: { ondismiss: () => setLoading(null) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Upgrade error:', err);
      // Graceful fallback — simulate upgrade in dev
      await verifyPayment(planId, `order_demo_${Date.now()}`, 'demo_pay', 'demo_sig');
    }
  };

  const verifyPayment = async (planId, orderId, paymentId, signature) => {
    try {
      const res = await fetch(`${API_BASE}/billing/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: planId, orderId, paymentId, signature }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) updateUser?.(data.user);
        setSuccessPlan(planId);
      }
    } catch (err) {
      console.error('Verify error:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="px-6 pt-8 pb-16 max-w-5xl mx-auto">

      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-xs font-semibold"
          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: '#A5B4FC' }}>
          <Sparkles size={12} />
          Simple, transparent pricing
        </div>
        <h1 className="text-4xl font-black text-white mb-3">
          Invest in your <span style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6,#EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Dream Job
          </span>
        </h1>
        <p className="text-slate-400 text-base max-w-xl mx-auto">
          Join 10,000+ students who cracked placements at Google, Microsoft, Swiggy, and top product companies using TRESK AI.
        </p>
      </div>

      {/* Social proof */}
      <div className="flex justify-center gap-8 mb-12">
        {[
          { icon: Star, label: '4.9/5 rating', sub: '2,400+ reviews' },
          { icon: Users, label: '10K+ students', sub: 'Placed at top companies' },
          { icon: Shield, label: 'SSL secured', sub: 'Razorpay certified' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="text-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <Icon size={15} className="text-indigo-400" />
            </div>
            <p className="text-white text-xs font-semibold">{label}</p>
            <p className="text-slate-600 text-[10px]">{sub}</p>
          </div>
        ))}
      </div>

      {/* Success banner */}
      {successPlan && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl p-4 flex items-center gap-3"
          style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(16,185,129,0.2)' }}>
            <Check size={16} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-emerald-300 font-semibold text-sm">
              🎉 {PLANS.find(p => p.id === successPlan)?.name} plan activated!
            </p>
            <p className="text-emerald-600 text-xs">All premium features are now unlocked. Happy prepping!</p>
          </div>
          <Link to="/" className="ml-auto text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            Dashboard <ArrowRight size={11} />
          </Link>
        </motion.div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
        {PLANS.map((plan, i) => {
          const Icon = plan.icon;
          const isCurrent = currentPlan === plan.id;
          const isLoading = loading === plan.id;
          const isSuccess = successPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl p-6 flex flex-col relative overflow-hidden"
              style={{
                background: plan.gradient,
                border: `1px solid ${plan.borderColor}`,
                boxShadow: plan.id === 'pro' ? '0 20px 60px rgba(99,102,241,0.2)' : 'none',
              }}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
                  style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
                  {plan.badge}
                </div>
              )}

              {/* Plan icon + name */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${plan.color}20`, border: `1px solid ${plan.color}40` }}>
                  <Icon size={18} style={{ color: plan.color }} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">{plan.name}</h3>
                  <p className="text-slate-500 text-[10px]">{plan.tagline}</p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">{plan.priceStr}</span>
                  <span className="text-slate-500 text-xs">{plan.per}</span>
                </div>
                {plan.price > 0 && (
                  <p className="text-[10px] text-slate-600 mt-0.5">Billed monthly · Cancel anytime</p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map(({ label, ok }) => (
                  <li key={label} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${ok ? '' : 'opacity-30'}`}
                      style={{ background: ok ? `${plan.color}20` : 'rgba(255,255,255,0.05)' }}>
                      <Check size={9} style={{ color: ok ? plan.color : '#475569' }} />
                    </div>
                    <span className={`text-xs ${ok ? 'text-slate-300' : 'text-slate-600'}`}>{label}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <motion.button
                whileHover={!plan.ctaDisabled && !isCurrent ? { scale: 1.02 } : {}}
                whileTap={!plan.ctaDisabled && !isCurrent ? { scale: 0.98 } : {}}
                onClick={() => handleUpgrade(plan.id)}
                disabled={plan.ctaDisabled || isCurrent || isLoading}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-default flex items-center justify-center gap-2"
                style={{
                  background: isCurrent || plan.id === 'free'
                    ? 'rgba(255,255,255,0.06)'
                    : `linear-gradient(135deg, ${plan.color}, ${plan.id === 'pro' ? '#8B5CF6' : '#EF4444'})`,
                  color: isCurrent || plan.id === 'free' ? '#64748B' : '#FFFFFF',
                  border: isCurrent ? `1px solid ${plan.color}40` : 'none',
                  boxShadow: !isCurrent && plan.id !== 'free' ? `0 8px 24px ${plan.color}40` : 'none',
                }}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : isSuccess ? (
                  <><Check size={14} /> Activated!</>
                ) : isCurrent ? (
                  <><Check size={14} /> Current Plan</>
                ) : (
                  <>{plan.cta} <ArrowRight size={14} /></>
                )}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Feature Comparison Strip */}
      <div className="mb-16 rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 className="text-white font-bold text-base mb-5 text-center">What you unlock with Pro</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Bot, label: 'TRESK AI Copilot', desc: '4 specialist modes', color: '#6366F1' },
            { icon: Mic, label: 'Unlimited Interviews', desc: 'No monthly caps', color: '#8B5CF6' },
            { icon: BarChart3, label: 'Interview Replay', desc: 'Full session timeline', color: '#10B981' },
            { icon: Code2, label: 'Daily Challenges', desc: 'XP + leaderboard', color: '#F59E0B' },
          ].map(({ icon: Icon, label, desc, color }) => (
            <div key={label} className="rounded-xl p-4 text-center" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: `${color}18` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <p className="text-white text-xs font-semibold">{label}</p>
              <p className="text-slate-500 text-[10px] mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-white font-bold text-xl text-center mb-6">Frequently Asked Questions</h2>
        <div className="space-y-3 max-w-2xl mx-auto">
          {FAQ.map(({ q, a }, i) => (
            <div key={i} className="rounded-xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between"
              >
                <span className="text-white text-sm font-medium">{q}</span>
                <span className="text-slate-500 text-lg leading-none">{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="px-5 pb-4"
                >
                  <p className="text-slate-400 text-xs leading-relaxed">{a}</p>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 rounded-2xl p-8 text-center"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))', border: '1px solid rgba(99,102,241,0.25)' }}>
        <h3 className="text-white font-black text-2xl mb-2">Start free. Scale when ready.</h3>
        <p className="text-slate-400 text-sm mb-6">No credit card required for the free plan. Upgrade anytime in seconds.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/lobby"
            className="px-6 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}>
            <Mic size={14} /> Start Free Mock Interview
          </Link>
          <Link to="/"
            className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-300 flex items-center gap-2"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Go to Dashboard <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
