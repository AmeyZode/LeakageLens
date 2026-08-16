import React, { useState } from 'react';
import { ArrowRight, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

function LoginPage({ navigate, returnTo = '/dashboard' }) {
  const { login, status, error } = useAuth();
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState('');
  const isLoading = status === 'loading';

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.endsWith('@gmail.com')) {
      setLocalError('Use a Gmail address to continue.');
      return;
    }

    setLocalError('');

    try {
      await login(normalizedEmail);
      navigate(returnTo);
    } catch {
      // AuthContext stores the error message.
    }
  };

  const message = localError || error;

  return (
    <div className="login-shell">
      <div className="login-view">
        <div className="login-brand">
          <span className="login-logo" aria-hidden="true">
            <ShieldCheck size={26} />
          </span>
          <div>
            <h1>LeakageLens</h1>
            <p>ML Pipeline Auditor</p>
          </div>
        </div>

        <div className="login-copy">
          <span className="hero-kicker">
            <Sparkles size={14} aria-hidden="true" />
            Secure workspace
          </span>
          <h2>Sign in to audit your ML pipeline.</h2>
          <p>Use your Gmail address to open the dashboard and run static analysis scans.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email</label>
          <div className="login-input-wrap">
            <Mail size={17} aria-hidden="true" />
            <input
              id="login-email"
              type="email"
              value={email}
              placeholder="aditya@gmail.com"
              onChange={(event) => setEmail(event.target.value)}
              disabled={isLoading}
            />
          </div>
          {message && <p className="login-error">{message}</p>}
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="scan-spinner" aria-hidden="true" />
                Signing in
              </>
            ) : (
              <>
                Continue
                <ArrowRight size={18} aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
