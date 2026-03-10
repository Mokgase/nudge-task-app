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

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [allocatedMinutes, setAllocatedMinutes] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToTasks(user.uid, setTasks);
    return unsub;
  }, [user]);

  function filteredTasks() {
    const now = new Date();
    switch (filter) {
      case 'pending': return tasks.filter(t => !t.completed);
      case 'completed': return tasks.filter(t => t.completed);
      case 'overdue': return tasks.filter(t => !t.completed && t.deadline && new Date(t.deadline) < now);
      default: return tasks;
    }
  }

  async function handleAdd() {
    if (!title.trim()) return;
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
        <button className="btn-primary" onClick={() => setShowAdd(v => !v)}>
          <PlusIcon /> Add Task
        </button>
      </div>

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
            {pending.map(task => <TaskCard key={task.id} task={task} />)}
          </>
        )}

        {completed.length > 0 && (
          <>
            {filter === 'all' && <div className="tasks-section-label" style={{ marginTop: '8px' }}>Completed</div>}
            {completed.map(task => <TaskCard key={task.id} task={task} />)}
          </>
        )}
      </div>
    </div>
  );
}
