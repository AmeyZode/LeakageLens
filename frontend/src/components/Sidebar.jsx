import React from 'react';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard', protected: true },
  { path: '/profile', label: 'Profile', icon: 'profile', protected: true },
];

function NavIcon({ name }) {
  const icons = {
    home: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
      </svg>
    ),
    dashboard: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
    profile: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  };

  return <span className="sidebar-nav-icon">{icons[name]}</span>;
}

function Sidebar({ currentPath, userToken, onNavigate, onLogout }) {
  const isActive = (path) => {
    if (path === '/') return currentPath === '/' || currentPath === '/home';
    return currentPath === path;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
            <path d="M8 11h6M11 8v6" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="sidebar-title">LeakageLens</p>
          <p className="sidebar-subtitle">ML Pipeline Auditor</p>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {NAV_ITEMS.map(({ path, label, icon, protected: isProtected }) => {
          if (isProtected && !userToken) return null;

          return (
            <button
              key={path}
              type="button"
              className={`sidebar-nav-item${isActive(path) ? ' active' : ''}`}
              onClick={() => onNavigate(path)}
              aria-current={isActive(path) ? 'page' : undefined}
            >
              <NavIcon name={icon} />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-pipeline">
        <p className="sidebar-pipeline-label">Analysis Pipeline</p>
        <ol className="sidebar-pipeline-steps">
          <li>Upload</li>
          <li>Scanner</li>
          <li>AST Parser</li>
          <li>Context</li>
          <li>Rules</li>
          <li>Report</li>
        </ol>
      </div>

      <div className="sidebar-footer">
        {userToken ? (
          <button type="button" className="sidebar-auth-btn logout" onClick={onLogout}>
            Sign out
          </button>
        ) : (
          <button
            type="button"
            className="sidebar-auth-btn login"
            onClick={() => onNavigate('/login')}
          >
            Sign in
          </button>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
