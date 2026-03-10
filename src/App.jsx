// src/App.jsx
import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import AuthPage from './components/Auth/AuthPage';
import Sidebar from './components/Layout/Sidebar';
import DashboardPage from './components/Dashboard/DashboardPage';
import TasksPage from './components/Tasks/TasksPage';
import ReportPage from './components/Habits/ReportPage';
import './styles/global.css';
import './styles/layout.css';

export default function App() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

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

  if (!user) return <AuthPage />;

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="main-content">
        {activePage === 'dashboard' && <DashboardPage />}
        {activePage === 'tasks' && <TasksPage />}
        {activePage === 'report' && <ReportPage />}
      </main>
    </div>
  );
}
