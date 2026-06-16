import { usePlan } from '../hooks/usePlan';

const PLAN_LABELS = {
  free: 'Free Plan',
  pro: 'Pro Plan',
  teams: 'Teams Plan',
};

const PLAN_COLORS = {
  free: '#7c6fcd',
  pro: '#a855f7',
  teams: '#06b6d4',
};

/**
 * PlanGate — wraps content that requires a specific plan tier.
 * 
 * Props:
 *  - requires: 'free' | 'pro' | 'teams'  (default: 'pro')
 *  - fallback: ReactNode — shown instead (upgrade prompt)
 *  - children: content shown when user has access
 */
export function PlanGate({ requires = 'pro', fallback, children }) {
  const { hasAccess } = usePlan();

  if (hasAccess(requires)) {
    return children;
  }

  if (fallback) return fallback;

  return (
    <div className="plan-gate-lock">
      <div className="plan-gate-content">
        <div className="plan-gate-icon">🔒</div>
        <h3 className="plan-gate-title">
          {PLAN_LABELS[requires] || 'Upgrade Required'}
        </h3>
        <p className="plan-gate-desc">
          This feature requires the <strong>{requires}</strong> plan or higher.
        </p>
        <a
          href="/#pricing"
          className="plan-gate-cta"
          style={{ background: `linear-gradient(135deg, ${PLAN_COLORS[requires]}, ${PLAN_COLORS[requires]}aa)` }}
        >
          View Pricing →
        </a>
      </div>
    </div>
  );
}

/**
 * UpgradeBanner — inline banner shown inside a page when feature is locked.
 */
export function UpgradeBanner({ feature, requiredPlan = 'pro' }) {
  const { plan } = usePlan();
  const isFree = plan === 'free';

  if (!isFree) return null;

  return (
    <div className="upgrade-banner">
      <span className="upgrade-banner-icon">⚡</span>
      <div>
        <strong>{feature}</strong> is a {requiredPlan} feature.{' '}
        <a href="/#pricing" className="upgrade-banner-link">Upgrade now</a>
      </div>
    </div>
  );
}
