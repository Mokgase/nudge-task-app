// src/utils/taskUtils.js

export function formatDuration(seconds) {
  if (!seconds) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatDeadline(isoString) {
  if (!isoString) return 'No deadline';
  const date = new Date(isoString);
  const now = new Date();
  const diff = date - now;
  if (diff < 0) return 'Overdue';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h left`;
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${mins}m left`;
}

export function isOverdue(isoString) {
  if (!isoString) return false;
  return new Date(isoString) < new Date();
}

export function getStartOfWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function getWeeklyStats(tasks) {
  const weekStart = getStartOfWeek();
  const weekTasks = tasks.filter((t) => {
    if (!t.createdAt) return false;
    const created = t.createdAt.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
    return created >= weekStart;
  });

  const total = weekTasks.length;
  const completed = weekTasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const overdue = weekTasks.filter((t) => !t.completed && isOverdue(t.deadline)).length;

  const onTimeTasks = weekTasks.filter((t) => {
    if (!t.completed || !t.deadline || !t.completedAt) return false;
    const deadline = new Date(t.deadline);
    const completedAt = t.completedAt.toDate ? t.completedAt.toDate() : new Date(t.completedAt);
    return completedAt <= deadline;
  });

  const onTimeRate = completed > 0 ? (onTimeTasks.length / completed) * 100 : 0;

  // Time accuracy: compare allocated time vs actual time spent
  const tasksWithTime = weekTasks.filter((t) => t.allocatedMinutes && t.timeSpentSeconds && t.completed);
  const avgTimeAccuracy = tasksWithTime.length > 0
    ? tasksWithTime.reduce((acc, t) => {
        const allocatedSecs = t.allocatedMinutes * 60;
        const accuracy = Math.max(0, 100 - Math.abs((t.timeSpentSeconds - allocatedSecs) / allocatedSecs) * 100);
        return acc + accuracy;
      }, 0) / tasksWithTime.length
    : null;

  // Weekly score out of 100
  const completionScore = total > 0 ? (completed / total) * 40 : 0;
  const onTimeScore = onTimeRate * 0.4;
  const timeAccuracyScore = avgTimeAccuracy !== null ? avgTimeAccuracy * 0.2 : 10;
  const weeklyScore = Math.round(completionScore + onTimeScore + timeAccuracyScore);

  let rating = 'Getting Started';
  let ratingEmoji = '🌱';
  if (weeklyScore >= 90) { rating = 'Exceptional'; ratingEmoji = '🏆'; }
  else if (weeklyScore >= 75) { rating = 'Excellent'; ratingEmoji = '⭐'; }
  else if (weeklyScore >= 60) { rating = 'Good Progress'; ratingEmoji = '✅'; }
  else if (weeklyScore >= 40) { rating = 'Improving'; ratingEmoji = '📈'; }
  else if (weeklyScore >= 20) { rating = 'Needs Focus'; ratingEmoji = '⚡'; }

  return {
    total, completed, pending, overdue,
    onTimeRate: Math.round(onTimeRate),
    avgTimeAccuracy: avgTimeAccuracy !== null ? Math.round(avgTimeAccuracy) : null,
    weeklyScore,
    rating,
    ratingEmoji,
    weekTasks
  };
}

export function getDailyBreakdown(tasks) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekStart = getStartOfWeek();
  return days.map((day, i) => {
    const dayStart = new Date(weekStart);
    dayStart.setDate(weekStart.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const dayTasks = tasks.filter((t) => {
      if (!t.createdAt) return false;
      const created = t.createdAt.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
      return created >= dayStart && created <= dayEnd;
    });

    return {
      day,
      total: dayTasks.length,
      completed: dayTasks.filter((t) => t.completed).length
    };
  });
}
