// src/components/Habits/ReportPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToTasks } from '../../firebase/tasksService';
import { getWeeklyStats, formatDuration } from '../../utils/taskUtils';
import '../../styles/layout.css';
import '../../styles/dashboard.css';

export default function ReportPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!user) return;
    return subscribeToTasks(user.uid, setTasks);
  }, [user]);

  const stats = getWeeklyStats(tasks);
  const completedTasks = tasks.filter(t => t.completed);
  const allPending = tasks.filter(t => !t.completed);

  // Build habit analysis
  const tasksWithTimeData = completedTasks.filter(t => t.allocatedMinutes && t.timeSpentSeconds);
  const timeComparisons = tasksWithTimeData.map(t => {
    const allocSecs = t.allocatedMinutes * 60;
    const diff = t.timeSpentSeconds - allocSecs;
    const pct = Math.round((diff / allocSecs) * 100);
    return { ...t, diff, pct };
  });

  const avgDiff = timeComparisons.length > 0
    ? Math.round(timeComparisons.reduce((a, b) => a + b.diff, 0) / timeComparisons.length)
    : null;

  const scoreColor = stats.weeklyScore >= 75
    ? 'var(--accent-green)'
    : stats.weeklyScore >= 50
    ? 'var(--accent-amber)'
    : 'var(--accent-red)';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Weekly Report</h1>
          <p className="page-subtitle">Your productivity snapshot for the current week.</p>
        </div>
      </div>

      {/* SCORE HERO */}
      <div className="card" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        <div className="report-score-ring" style={{ width: '100px', height: '100px' }}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg-tertiary)" strokeWidth="7"/>
            <circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke={scoreColor}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.weeklyScore / 100)}`}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
            />
          </svg>
          <span style={{ position: 'absolute', fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {stats.weeklyScore}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '28px', marginBottom: '4px' }}>{stats.ratingEmoji}</div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {stats.rating}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {stats.completed} of {stats.total} tasks completed this week
            {stats.overdue > 0 && `, ${stats.overdue} overdue`}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Metric label="On-time Completions" value={`${stats.onTimeRate}%`} />
          {stats.avgTimeAccuracy !== null && (
            <Metric label="Time Estimation Accuracy" value={`${stats.avgTimeAccuracy}%`} />
          )}
          <Metric label="Pending Tasks" value={allPending.length} />
        </div>
      </div>

      {/* HABIT ANALYSIS */}
      {timeComparisons.length > 0 && (
        <div className="card" style={{ marginBottom: '14px' }}>
          <div className="card-title">Time Estimation vs. Actual</div>
          {avgDiff !== null && (
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              On average, you take <strong style={{ color: 'var(--text-primary)' }}>
                {avgDiff > 0 ? `${formatDuration(Math.abs(avgDiff))} longer` : `${formatDuration(Math.abs(avgDiff))} less`}
              </strong> than estimated.
              {avgDiff > 0
                ? ' Try allocating a bit more time for tasks.'
                : ' Your time estimates are conservative — great discipline!'}
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {timeComparisons.slice(0, 8).map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ flex: 1, fontSize: '12px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.title}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', minWidth: '70px', textAlign: 'right' }}>
                  {formatDuration(t.timeSpentSeconds)} / {t.allocatedMinutes}m
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: t.pct > 20 ? 'var(--accent-red)' : t.pct < -10 ? 'var(--accent-green)' : 'var(--accent-amber)',
                  minWidth: '44px',
                  textAlign: 'right'
                }}>
                  {t.pct > 0 ? '+' : ''}{t.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPLETED TASKS */}
      <div className="card">
        <div className="card-title">Completed This Week ({completedTasks.length})</div>
        {completedTasks.length === 0 ? (
          <div className="no-data-msg">No completed tasks yet. Start checking things off!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {completedTasks.slice(0, 10).map(t => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)'
              }}>
                <span style={{ fontSize: '13px', color: 'var(--accent-green)' }}>✓</span>
                <span style={{ flex: 1, fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                  {t.title}
                </span>
                {t.timeSpentSeconds > 0 && (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {formatDuration(t.timeSpentSeconds)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        {value}
      </div>
    </div>
  );
}
