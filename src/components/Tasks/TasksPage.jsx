// src/components/Tasks/TasksPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToTasks, addTask } from '../../firebase/tasksService';
import TaskCard from './TaskCard';
import '../../styles/layout.css';
import '../../styles/tasks.css';

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const FILTERS = ['all', 'pending', 'completed', 'overdue'];
const GUEST_TASKS_KEY = 'nudge_guest_tasks';

function loadGuestTasks() {
  try { return JSON.parse(localStorage.getItem(GUEST_TASKS_KEY) || '[]'); }
  catch { return []; }
}

export default function TasksPage({ onAuthRequired }) {
  const { user } = useAuth();
  const [firestoreTasks, setFirestoreTasks] = useState([]);
  const [guestTasks, setGuestTasks] = useState(() => loadGuestTasks());
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [allocatedMinutes, setAllocatedMinutes] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToTasks(user.uid, setFirestoreTasks);
    return unsub;
  }, [user]);

  // Persist guest tasks to localStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem(GUEST_TASKS_KEY, JSON.stringify(guestTasks));
    }
  }, [guestTasks, user]);

  const tasks = user ? firestoreTasks : guestTasks;

  // Guest handlers — operate on local state instead of Firestore
  const guestHandlers = !user ? {
    onUpdate: (taskId, updates) => setGuestTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, ...updates } : t)
    ),
    onDelete: (taskId) => setGuestTasks(prev => prev.filter(t => t.id !== taskId)),
    onComplete: (taskId, timeSpent) => setGuestTasks(prev =>
      prev.map(t => t.id === taskId
        ? { ...t, completed: true, completedAt: new Date().toISOString(), timeSpentSeconds: timeSpent, timerRunning: false }
        : t
      )
    ),
  } : null;

  function filteredTasks() {
    const now = new Date();
    switch (filter) {
      case 'pending': return tasks.filter(t => !t.completed);
      case 'completed': return tasks.filter(t => t.completed);
      case 'overdue': return tasks.filter(t => !t.completed && t.deadline && new Date(t.deadline) < now);
      default: return tasks;
    }
  }

  function handleAddClick() {
    if (!user && tasks.length >= 1) {
      onAuthRequired?.();
      return;
    }
    setShowAdd(v => !v);
  }

  async function handleAdd() {
    if (!title.trim()) return;

    if (!user) {
      const newTask = {
        id: `guest-${Date.now()}`,
        title: title.trim(),
        deadline: deadline || null,
        allocatedMinutes: allocatedMinutes ? parseInt(allocatedMinutes, 10) : null,
        completed: false,
        completedAt: null,
        timeSpentSeconds: 0,
        timerRunning: false,
        createdAt: new Date().toISOString(),
      };
      setGuestTasks(prev => [newTask, ...prev]);
      setTitle(''); setDeadline(''); setAllocatedMinutes('');
      setShowAdd(false);
      return;
    }

    setAdding(true);
    try {
      await addTask(user.uid, {
        title: title.trim(),
        deadline: deadline || null,
        allocatedMinutes: allocatedMinutes ? parseInt(allocatedMinutes, 10) : null,
      });
      setTitle(''); setDeadline(''); setAllocatedMinutes('');
      setShowAdd(false);
    } finally {
      setAdding(false);
    }
  }

  const shown = filteredTasks();
  const pending = shown.filter(t => !t.completed);
  const completed = shown.filter(t => t.completed);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{tasks.length} total · {tasks.filter(t => !t.completed).length} pending</p>
        </div>
        <button className="btn-primary" onClick={handleAddClick}>
          <PlusIcon /> Add Task
        </button>
      </div>

      {!user && tasks.length === 0 && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          marginBottom: '16px',
        }}>
          Try it out — add your first task below. Sign in to save more.
        </div>
      )}

      {!user && tasks.length >= 1 && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <span>You're on the free preview. Sign in to add unlimited tasks.</span>
          <button
            className="btn-primary"
            style={{ padding: '6px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
            onClick={() => onAuthRequired?.()}
          >
            Sign In / Sign Up
          </button>
        </div>
      )}

      {showAdd && (
        <div className="tasks-add-section">
          <div className="tasks-add-title">New Task</div>
          <div className="tasks-add-grid">
            <div className="tasks-input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="tasks-input-label">Task Name</label>
              <input
                className="tasks-input"
                type="text"
                placeholder="What needs to be done?"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                autoFocus
              />
            </div>
            <div className="tasks-input-group">
              <label className="tasks-input-label">Deadline</label>
              <input
                className="tasks-input"
                type="datetime-local"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
              />
            </div>
            <div className="tasks-input-group">
              <label className="tasks-input-label">Allocated Time (mins)</label>
              <input
                className="tasks-input"
                type="number"
                placeholder="e.g. 30"
                min="1"
                value={allocatedMinutes}
                onChange={e => setAllocatedMinutes(e.target.value)}
                style={{ width: '130px' }}
              />
            </div>
            <button className="tasks-add-btn" onClick={handleAdd} disabled={adding || !title.trim()}>
              <PlusIcon /> {adding ? 'Adding...' : 'Add Task'}
            </button>
            <button className="tasks-cancel-btn" onClick={() => { setShowAdd(false); setTitle(''); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="tasks-filters">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`filter-chip${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="tasks-list">
        {shown.length === 0 && (
          <div className="tasks-empty">
            <svg className="tasks-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
            <p>No tasks here. Add one above.</p>
          </div>
        )}

        {pending.length > 0 && (
          <>
            {filter === 'all' && <div className="tasks-section-label">Pending</div>}
            {pending.map(task => <TaskCard key={task.id} task={task} handlers={guestHandlers} />)}
          </>
        )}

        {completed.length > 0 && (
          <>
            {filter === 'all' && <div className="tasks-section-label" style={{ marginTop: '8px' }}>Completed</div>}
            {completed.map(task => <TaskCard key={task.id} task={task} handlers={guestHandlers} />)}
          </>
        )}
      </div>
    </div>
  );
}
