/**
 * TRESK AI — Streak Math Helper (Timezone-Aware)
 */
function getLocalDateString(date, timeZone) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(date); // Format: "MM/DD/YYYY"
  } catch (err) {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(date);
  }
}

function daysDiffWithTimezone(dateA, dateB, timeZone = 'UTC') {
  const localA = getLocalDateString(dateA, timeZone);
  const localB = getLocalDateString(dateB, timeZone);
  
  if (localA === localB) return 0;
  
  const [monthA, dayA, yearA] = localA.split('/').map(Number);
  const [monthB, dayB, yearB] = localB.split('/').map(Number);
  
  const utcA = Date.UTC(yearA, monthA - 1, dayA);
  const utcB = Date.UTC(yearB, monthB - 1, dayB);
  
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((utcB - utcA) / msPerDay);
}

function computeStreak(lastActiveISO, currentStreak, timeZone = 'UTC') {
  if (!lastActiveISO) return 1;
  const diff = daysDiffWithTimezone(new Date(lastActiveISO), new Date(), timeZone);
  if (diff <= 0) return currentStreak || 1;
  if (diff === 1) return (currentStreak || 1) + 1;
  return 1;
}

module.exports = {
  getLocalDateString,
  daysDiffWithTimezone,
  computeStreak
};
