import React, { useState } from 'react';
import {
  Key,
  Eye,
  EyeOff,
  Save,
  Database,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Clock
} from 'lucide-react';

const MOCK_AUDITS = [
  {
    id: 1,
    path: './sample_projects/iris_leakage',
    date: '2026-06-29 14:32',
    score: 92,
    files: 48,
    findings: { critical: 0, major: 3, minor: 9, total: 12 },
  },
  {
    id: 2,
    path: '/workspaces/credit_risk_pipeline',
    date: '2026-06-28 09:15',
    score: 68,
    files: 14,
    findings: { critical: 1, major: 8, minor: 15, total: 24 },
  },
  {
    id: 3,
    path: '/user/repos/customer_churn',
    date: '2026-06-25 18:45',
    score: 98,
    files: 32,
    findings: { critical: 0, major: 0, minor: 2, total: 2 },
  },
];

function Profile({ onNavigate }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('leakagelens_openai_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveKey = (e) => {
    e.preventDefault();
    setIsSaving(true);
    window.setTimeout(() => {
      localStorage.setItem('leakagelens_openai_key', apiKey.trim());
      setIsSaving(false);
      setSaveSuccess(true);
      window.setTimeout(() => setSaveSuccess(false), 2000);
    }, 600);
  };

  const handleRunAudit = (path) => {
    localStorage.setItem('leakagelens_pending_scan', path);
    onNavigate('/dashboard');
  };

  return (
    <div className="profile-dashboard-layout">
      {/* Settings Header */}
      <div className="settings-header">
        <div className="settings-header-info">
          <h2>Workspace Settings</h2>
          <p>Manage your audit API keys, user profile configurations, and review scan history logs.</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Left Column: Profile Card & API Configuration */}
        <div className="settings-left-col">
          {/* User Profile Card */}
          <div className="settings-card profile-card-details">
            <div className="profile-avatar-large">A</div>
            <div className="profile-user-info">
              <h3>Aditya Pulpati</h3>
              <p className="profile-user-email">aditya@gmail.com</p>
              <div className="profile-badge-row">
                <span className="badge badge-pro">Pro Plan</span>
                <span className="badge badge-status">Active Workspace</span>
              </div>
            </div>
            <div className="profile-stats-grid">
              <div className="stat-item">
                <span className="stat-label">Scans Run</span>
                <span className="stat-value">28</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Health Avg</span>
                <span className="stat-value">86%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">API Status</span>
                <span className="stat-value text-green">Online</span>
              </div>
            </div>
          </div>

          {/* API Key Configuration Card */}
          <div className="settings-card api-key-card">
            <div className="card-header">
              <Key size={16} className="text-purple" />
              <h4>OpenAI API Configuration</h4>
            </div>
            <p className="card-description">
              Provide an OpenAI API key to enable advanced AI-powered code analysis and smart audit recommendations.
            </p>
            <form onSubmit={handleSaveKey} className="api-key-form">
              <div className="input-group">
                <label htmlFor="openai-key">OpenAI API Key</label>
                <div className="input-wrapper">
                  <input
                    id="openai-key"
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-proj-..."
                    className="password-input"
                  />
                  <button
                    type="button"
                    className="eye-toggle-btn"
                    onClick={() => setShowKey(!showKey)}
                    title={showKey ? 'Hide key' : 'Show key'}
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="status-indicator-row">
                <span className="status-label">Status:</span>
                {localStorage.getItem('leakagelens_openai_key') ? (
                  <span className="status-value text-green">
                    <CheckCircle2 size={12} /> Configured
                  </span>
                ) : (
                  <span className="status-value text-amber">
                    <ShieldAlert size={12} /> Not Configured
                  </span>
                )}
              </div>

              <button type="submit" className="btn btn-primary save-key-btn" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <span className="scan-spinner" />
                    Saving
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle2 size={16} />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Configuration
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Scan History */}
        <div className="settings-right-col">
          <div className="settings-card history-card">
            <div className="card-header">
              <Clock size={16} className="text-blue" />
              <h4>Audit History Log</h4>
            </div>
            <p className="card-description">
              Recent static analysis scans run across your local and remote machine learning workspace paths.
            </p>

            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Scanned Path</th>
                    <th>Date / Time</th>
                    <th>Health</th>
                    <th>Files</th>
                    <th>Findings</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_AUDITS.map((audit) => (
                    <tr key={audit.id}>
                      <td className="path-cell" title={audit.path}>
                        <Database size={13} className="text-muted" />
                        <span>{audit.path}</span>
                      </td>
                      <td className="date-cell">{audit.date}</td>
                      <td className="score-cell">
                        <span className={`score-badge ${audit.score >= 90 ? 'score-high' : audit.score >= 70 ? 'score-medium' : 'score-low'}`}>
                          {audit.score}%
                        </span>
                      </td>
                      <td className="files-cell">{audit.files}</td>
                      <td className="findings-cell">
                        <div className="severity-summary">
                          {audit.findings.critical > 0 && (
                            <span className="badge badge-crit" title="Critical Findings">
                              {audit.findings.critical} C
                            </span>
                          )}
                          <span className="badge badge-maj" title="Medium Findings">
                            {audit.findings.major} M
                          </span>
                          <span className="badge badge-min" title="Low Findings">
                            {audit.findings.minor} L
                          </span>
                        </div>
                      </td>
                      <td className="actions-cell">
                        <button
                          type="button"
                          className="btn-table-action"
                          onClick={() => handleRunAudit(audit.path)}
                          title="Run scan on this path"
                        >
                          Scan Path <ArrowRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
