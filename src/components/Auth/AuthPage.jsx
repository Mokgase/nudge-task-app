// src/components/Auth/AuthPage.jsx
import { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import ResetPassword from './ResetPassword';

export default function AuthPage() {
  const [view, setView] = useState('login');

  if (view === 'signup') return <Signup onSwitch={setView} />;
  if (view === 'reset') return <ResetPassword onSwitch={setView} />;
  return <Login onSwitch={setView} />;
}
