// src/components/Auth/ResetPassword.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

const LogoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
  </svg>
);

export default function ResetPassword({ onSwitch }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError('Could not send reset email. Check the address and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-bg-glow" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><LogoIcon /></div>
          <span className="auth-logo-text">Nudge</span>
        </div>
        <h1 className="auth-title">Reset password</h1>
        <p className="auth-subtitle">We'll send you a link to reset your password.</p>

        <div className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">Reset link sent — check your inbox.</div>}

          {!success && (
            <>
              <div className="auth-field">
                <label className="auth-label">Email</label>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <button className="auth-btn" onClick={handleSubmit} disabled={loading || !email}>
                {loading ? <span className="auth-spinner" /> : 'Send Reset Link'}
              </button>
            </>
          )}
        </div>

        <div className="auth-footer">
          <p><span className="auth-link" onClick={() => onSwitch('login')}>← Back to sign in</span></p>
        </div>
      </div>
    </div>
  );
}
