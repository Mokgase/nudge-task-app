// src/components/Auth/AuthModal.jsx
import AuthPage from './AuthPage';

export default function AuthModal({ onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.6)',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()}>
        <AuthPage />
      </div>
    </div>
  );
}
