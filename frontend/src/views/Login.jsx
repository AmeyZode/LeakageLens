import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, ShieldCheck, Sparkles } from 'lucide-react';

function Login({ onLoginSuccess, onNavigate }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.endsWith('@gmail.com')) {
      setError('Use a Gmail address to continue.');
      return;
    }

    setError('');
    setIsLoading(true);

    window.setTimeout(() => {
      onLoginSuccess(`leakagelens-demo-token:${normalizedEmail}`);
    }, 450);
  };

  return (
    <motion.div
      className="login-view"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
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
        {error && <p className="login-error">{error}</p>}
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

      <button type="button" className="login-back-btn" onClick={() => onNavigate('/')}>
        Back to overview
      </button>
    </motion.div>
  );
}

export default Login;
