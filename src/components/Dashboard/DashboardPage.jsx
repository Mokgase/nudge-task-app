// src/components/Dashboard/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToTasks } from '../../firebase/tasksService';
import { getWeeklyStats, getDailyBreakdown, formatDeadline, isOverdue } from '../../utils/taskUtils';
import '../../styles/layout.css';
import '../../styles/dashboard.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!user) return;
    return subscribeToTasks(user.uid, setTasks);
  }, [user]);

  const stats = getWeeklyStats(tasks);
  const daily = getDailyBreakdown(tasks);
  const maxDaily = Math.max(...daily.map(d => d.total), 1);

  const pending = tasks.filter(t => !t.completed).sort((a, b) => {
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  }).slice(0, 6);

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.displayName?.split(' ')[0] || 'there';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, {firstName}</h1>
          <p className="page-subtitle">Here's how your week is going.</p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="dashboard-grid">
        <div className="stat-card highlight">
          <span className="stat-label">Weekly Score</span>
          <span className="stat-value">{stats.weeklyScore}</span>
          <span className="stat-sub">{stats.ratingEmoji} {stats.rating}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total This Week</span>
          <span className="stat-value">{stats.total}</span>
          <span className="stat-sub">tasks created</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Completed</span>
          <span className="stat-value">{stats.completed}</span>
          <span className="stat-sub">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% completion rate</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Overdue</span>
          <span className="stat-value" style={{ color: stats.overdue > 0 ? 'var(--accent-red)' : 'inherit' }}>
            {stats.overdue}
          </span>
          <span className="stat-sub">{stats.pending} still pending</span>
        </div>
      </div>

      <div className="dashboard-row">
        {/* DAILY CHART */}
        <div className="card">
          <div className="card-title">Daily Activity — This Week</div>
          <div className="bar-chart">
            {daily.map((d, i) => (
              <div className="bar-group" key={i}>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ height: d.total > 0 ? `${(d.total / maxDaily) * 100}%` : '0%' }}
                  />
                </div>
                <div className="bar-label">{d.day}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '14px', display: 'flex', gap: '16px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', background: 'var(--text-primary)', borderRadius: '2px', display: 'inline-block' }} />
              Tasks created
            </span>
          </div>
        </div>

        {/* WEEKLY REPORT SUMMARY */}
        <div className="report-card">
          <div className="card-title">This Week</div>
          <div className="report-header">
            <div className="report-score-ring">
              <svg width="70" height="70" viewBox="0 0 70 70">
                <circle cx="35" cy="35" r="28" fill="none" stroke="var(--bg-tertiary)" strokeWidth="5"/>
                <circle
                  cx="35" cy="35" r="28"
                  fill="none"
                  stroke="var(--text-primary)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - stats.weeklyScore / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
                />
              </svg>
              <span className="report-score-text">{stats.weeklyScore}</span>
            </div>
            <div className="report-rating">
              <div className="report-emoji">{stats.ratingEmoji}</div>
              <div className="report-rating-label">{stats.rating}</div>
              <div className="report-rating-sub">Week rating</div>
            </div>
          </div>

          <div className="report-stats">
            <div className="report-stat-row">
              <span className="report-stat-name">Completion</span>
              <div className="report-stat-bar-wrap">
                <div className="report-stat-bar">
                  <div className="report-stat-bar-fill" style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }} />
                </div>
                <span className="report-stat-pct">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
              </div>
            </div>
            <div className="report-stat-row">
              <span className="report-stat-name">On-time rate</span>
              <div className="report-stat-bar-wrap">
                <div className="report-stat-bar">
                  <div className="report-stat-bar-fill" style={{ width: `${stats.onTimeRate}%` }} />
                </div>
                <span className="report-stat-pct">{stats.onTimeRate}%</span>
              </div>
            </div>
            {stats.avgTimeAccuracy !== null && (
              <div className="report-stat-row">
                <span className="report-stat-name">Time accuracy</span>
                <div className="report-stat-bar-wrap">
                  <div className="report-stat-bar">
                    <div className="report-stat-bar-fill" style={{ width: `${stats.avgTimeAccuracy}%` }} />
                  </div>
                  <span className="report-stat-pct">{stats.avgTimeAccuracy}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PENDING TASKS */}
      <div className="card">
        <div className="card-title">Upcoming Tasks</div>
        {pending.length === 0 ? (
          <div className="no-data-msg">No pending tasks. You're all caught up! 🎉</div>
        ) : (
          <div className="pending-list">
            {pending.map(task => {
              const ov = isOverdue(task.deadline);
              return (
                <div className="pending-item" key={task.id}>
                  <div className={`pending-dot${ov ? ' overdue' : ''}`} />
                  <span className="pending-name">{task.title}</span>
                  <span className={`pending-deadline${ov ? ' overdue' : ''}`}>
                    {task.deadline ? formatDeadline(task.deadline) : 'No deadline'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
