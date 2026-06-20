import React from 'react';
import Sidebar from './Sidebar.jsx';

const PAGE_TITLES = {
  '/': 'Overview',
  '/home': 'Overview',
  '/dashboard': 'Scan Dashboard',
  '/profile': 'Profile & Settings',
};

function Layout({ currentPath, userToken, onNavigate, onLogout, children }) {
  const pageTitle = PAGE_TITLES[currentPath] || 'LeakageLens';

  return (
    <div className="app-layout">
      <Sidebar
        currentPath={currentPath}
        userToken={userToken}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <div className="app-main">
        <header className="app-header">
          <div className="app-header-text">
            <h1 className="app-header-title">{pageTitle}</h1>
            <p className="app-header-subtitle">
              Static analysis for data leakage, reproducibility, and ML anti-patterns
            </p>
          </div>
          {userToken && (
            <div className="app-header-status">
              <span className="status-dot" aria-hidden="true" />
              Session active
            </div>
          )}
        </header>

        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
