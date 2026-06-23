/**
 * TRESK AI — Streak Math Helper
 * Timezone- and DST-safe calendar day difference check.
 */
function daysDiff(dateA, dateB) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const utcA = Date.UTC(dateA.getUTCFullYear(), dateA.getUTCMonth(), dateA.getUTCDate());
  const utcB = Date.UTC(dateB.getUTCFullYear(), dateB.getUTCMonth(), dateB.getUTCDate());
  return Math.round(Math.abs(utcA - utcB) / msPerDay);
}

function computeStreak(lastActiveISO, currentStreak) {
  if (!lastActiveISO) return 1;
  const diff = daysDiff(new Date(lastActiveISO), new Date());
  if (diff === 0) return currentStreak || 1;
  if (diff === 1) return (currentStreak || 1) + 1;
  return 1;
}

module.exports = {
  daysDiff,
  computeStreak
};
