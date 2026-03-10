// src/components/Tasks/TaskCard.jsx
import { useState } from 'react';
import { useStopwatch } from '../../hooks/useStopwatch';
import { formatDuration, formatDeadline, isOverdue } from '../../utils/taskUtils';
import { updateTask, deleteTask, completeTask } from '../../firebase/tasksService';
import '../../styles/tasks.css';

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);
const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
  </svg>
);
const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

export default function TaskCard({ task }) {
  const [showExtend, setShowExtend] = useState(false);
  const [newDeadline, setNewDeadline] = useState('');
  const overdue = !task.completed && isOverdue(task.deadline);

  const elapsed = useStopwatch(task.timeSpentSeconds || 0, !!task.timerRunning);

  async function handleCheck() {
    if (task.completed) return;
    await completeTask(task.id, elapsed);
  }

  async function handleTimerToggle() {
    if (task.completed) return;
    if (task.timerRunning) {
      await updateTask(task.id, { timerRunning: false, timeSpentSeconds: elapsed });
    } else {
      await updateTask(task.id, { timerRunning: true });
    }
  }

  async function handleDelete() {
    if (window.confirm('Delete this task?')) {
      await deleteTask(task.id);
    }
  }

  async function handleExtend() {
    if (!newDeadline) return;
    await updateTask(task.id, { deadline: newDeadline });
    setShowExtend(false);
    setNewDeadline('');
  }

  const deadlineStr = formatDeadline(task.deadline);

  return (
    <div className={`task-card${task.completed ? ' completed' : ''}${overdue ? ' overdue' : ''}`}>
      <button
        className={`task-check${task.completed ? ' checked' : ''}`}
        onClick={handleCheck}
        title={task.completed ? 'Done' : 'Mark complete'}
        disabled={task.completed}
      >
        {task.completed && <CheckIcon />}
      </button>

      <div className="task-body">
        <div className={`task-title${task.completed ? ' strikethrough' : ''}`}>{task.title}</div>
        <div className="task-meta">
          {task.deadline && (
            <span className={`task-meta-chip${overdue ? ' overdue' : ' on-track'}`}>
              <ClockIcon /> {deadlineStr}
            </span>
          )}
          {task.allocatedMinutes && (
            <span className="task-meta-chip">
              <ClockIcon /> {task.allocatedMinutes}m allocated
            </span>
          )}
          {!task.completed && (
            <span className={`task-meta-chip${task.timerRunning ? ' timer-running' : ''}`}>
              ⏱ {formatDuration(elapsed)}
            </span>
          )}
          {task.completed && task.timeSpentSeconds > 0 && (
            <span className="task-meta-chip">
              Took {formatDuration(task.timeSpentSeconds)}
            </span>
          )}
        </div>

        {showExtend && !task.completed && (
          <div className="task-extend-form">
            <input
              className="task-extend-input"
              type="datetime-local"
              value={newDeadline}
              onChange={e => setNewDeadline(e.target.value)}
            />
            <button className="task-extend-ok" onClick={handleExtend}>Save</button>
            <button className="task-extend-ok" onClick={() => setShowExtend(false)}>Cancel</button>
          </div>
        )}
      </div>

      {!task.completed && (
        <span className={`task-timer${task.timerRunning ? ' timer-running' : ''}`}>
          {formatDuration(elapsed)}
        </span>
      )}

      <div className="task-actions">
        {!task.completed && (
          <button
            className={`task-action-btn${task.timerRunning ? ' active' : ''}`}
            onClick={handleTimerToggle}
            title={task.timerRunning ? 'Pause timer' : 'Start timer'}
          >
            {task.timerRunning ? <PauseIcon /> : <PlayIcon />}
          </button>
        )}
        {!task.completed && (
          <button
            className="task-action-btn"
            onClick={() => setShowExtend(v => !v)}
            title="Extend deadline"
          >
            <EditIcon />
          </button>
        )}
        <button className="task-action-btn danger" onClick={handleDelete} title="Delete task">
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
