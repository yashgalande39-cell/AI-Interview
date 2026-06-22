import { useAuth } from '../context/AuthContext';

/**
 * Plan hierarchy: free < pro < teams
 * Features available per plan:
 *
 * FREE:
 *  - 3 mock interviews / month
 *  - Basic performance report
 *  - HR question bank
 *  - Community support
 *
 * PRO (includes everything in free +):
 *  - Unlimited mock interviews
 *  - Real-time coding evaluation
 *  - Advanced analytics & roadmap
 *  - Resume + JD targeting
 *  - Priority AI feedback
 *
 * TEAMS (includes everything in pro +):
 *  - Up to 25 seats
 *  - Cohort dashboards
 *  - Custom question sets
 *  - Dedicated success manager
 */

const PLAN_LEVEL = { free: 0, pro: 1, teams: 2 };

// Which plan is required per feature key
export const FEATURE_PLAN = {
  // Free features — always accessible
  hrQuestionBank:         'free',
  communitySupport:       'free',
  basicReport:            'free',
  limitedInterviews:      'free',

  // Pro features
  unlimitedInterviews:    'pro',
  codingArena:            'pro',
  advancedAnalytics:      'pro',
  resumeAnalyzer:         'pro',
  jobAnalyzer:            'pro',
  groupDiscussion:        'pro',
  learningRoadmap:        'pro',
  aptitudeTest:           'pro',
  leaderboard:            'pro',
  priorityFeedback:       'pro',

  // Teams features
  cohortDashboards:       'teams',
  customQuestions:        'teams',
  multiSeat:              'teams',
  dedicatedManager:       'teams',
};

export function usePlan() {
  const { plan, selectPlan } = useAuth();

  /**
   * Returns true if the user's plan meets or exceeds the required plan
   */
  const hasAccess = (requiredPlan) => {
    const userLevel = PLAN_LEVEL[plan] ?? 0;
    const reqLevel  = PLAN_LEVEL[requiredPlan] ?? 0;
    return userLevel >= reqLevel;
  };

  /**
   * Returns true if the user has access to a named feature key
   */
  const canUse = (featureKey) => {
    const required = FEATURE_PLAN[featureKey] ?? 'free';
    return hasAccess(required);
  };

  const isFreePlan  = plan === 'free';
  const isProPlan   = plan === 'pro';
  const isTeamsPlan = plan === 'teams';

  return { plan, hasAccess, canUse, selectPlan, isFreePlan, isProPlan, isTeamsPlan };
}
