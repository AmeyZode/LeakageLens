import React from 'react';
import { Bell, ChevronDown, Command, Moon, Search, ShieldCheck } from 'lucide-react';
import Sidebar from './Sidebar.jsx';

const PAGE_TITLES = {
  '/': 'Overview',
  '/home': 'Overview',
  '/dashboard': 'Security Dashboard',
  '/scanner': 'Scanner',
  '/reports': 'Reports',
  '/history': 'History',
  '/rules': 'Rules',
  '/ai-recommendations': 'AI Recommendations',
  '/profile': 'Profile and Settings',
  '/settings': 'Profile and Settings',
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
          <div className="app-header-left">
            <div className="app-header-status">
              <ShieldCheck size={15} aria-hidden="true" />
              <span>Live audit workspace</span>
            </div>
            <div className="app-header-title-group">
              <h1 className="app-header-title">{pageTitle}</h1>
              <p className="app-header-subtitle">
                Static analysis for leakage, reproducibility, evaluation, and ML anti-patterns
              </p>
            </div>
          </div>

          <div className="app-header-actions">
            <div className="header-command" role="search">
              <Search size={15} aria-hidden="true" />
              <span>Search audits</span>
              <kbd>
                <Command size={12} aria-hidden="true" />K
              </kbd>
            </div>
            <button type="button" className="header-icon-btn" aria-label="Toggle theme">
              <Moon size={16} aria-hidden="true" />
            </button>
            <button type="button" className="header-icon-btn notification" aria-label="Notifications">
              <Bell size={16} aria-hidden="true" />
              <span>3</span>
            </button>
            {userToken ? (
              <button type="button" className="header-user-menu" onClick={onLogout} title="Sign out">
                <span className="header-avatar">A</span>
                <span className="header-user-name">Aditya</span>
                <ChevronDown size={15} aria-hidden="true" />
              </button>
            ) : (
              <button type="button" className="header-user-menu" onClick={() => onNavigate('/login')}>
                <span className="header-avatar">L</span>
                <span className="header-user-name">Sign in</span>
              </button>
            )}
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
