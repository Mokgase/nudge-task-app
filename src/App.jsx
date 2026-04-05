// src/App.jsx
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import AuthModal from './components/Auth/AuthModal';
import Sidebar from './components/Layout/Sidebar';
import DashboardPage from './components/Dashboard/DashboardPage';
import TasksPage from './components/Tasks/TasksPage';
import ReportPage from './components/Habits/ReportPage';
import { addTask } from './firebase/tasksService';
import './styles/global.css';
import './styles/layout.css';

const GUEST_TASKS_KEY = 'nudge_guest_tasks';

export default function App() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('tasks');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Migrate guest tasks to Firestore when user signs in
  useEffect(() => {
    if (!user) return;
    const raw = localStorage.getItem(GUEST_TASKS_KEY);
    if (!raw) return;
    try {
      const guestTasks = JSON.parse(raw);
      guestTasks.forEach(t => addTask(user.uid, {
        title: t.title,
        deadline: t.deadline || null,
        allocatedMinutes: t.allocatedMinutes || null,
      }));
    } catch {}
    localStorage.removeItem(GUEST_TASKS_KEY);
  }, [user?.uid]);

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg-primary)'
      }}>
        <div style={{
          width: '20px', height: '20px',
          border: '2px solid var(--border)',
          borderTopColor: 'var(--text-primary)',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        onSignIn={() => setShowAuthModal(true)}
      />
      <main className="main-content">
        {activePage === 'dashboard' && <DashboardPage />}
        {activePage === 'tasks' && (
          <TasksPage onAuthRequired={() => setShowAuthModal(true)} />
        )}
        {activePage === 'report' && <ReportPage />}
      </main>
      {showAuthModal && !user && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}
