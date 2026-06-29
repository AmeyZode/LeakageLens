import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, Command, Moon, Sun, Search, ShieldCheck, Menu, X, Settings, User, LogOut } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const PAGE_TITLES = {
  '/': 'Overview',
  '/home': 'Overview',
  '/dashboard': 'Security Dashboard',
  '/scanner': 'Scanner Workspace',
  '/reports': 'Reports & Analytics',
  '/history': 'Scan History',
  '/rules': 'Rule Engine Config',
  '/ai-recommendations': 'AI Recommendations',
  '/profile': 'Profile and Settings',
  '/settings': 'Profile and Settings',
};

function Layout({ currentPath, userToken, onNavigate, onLogout, children }) {
  const pageTitle = PAGE_TITLES[currentPath] || 'LeakageLens';
  const { theme, toggleTheme } = useTheme();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    { id: 1, text: 'Data leakage detected in preprocessing.py', time: '10m ago', type: 'error' },
    { id: 2, text: 'Audit completed for iris_leakage (92% Health)', time: '1h ago', type: 'success' },
    { id: 3, text: 'Missing random seed found in model.py', time: '2h ago', type: 'warning' },
  ];

  const searchItems = [
    { label: 'Start static scan analysis', path: '/scanner', target: 'upload-project' },
    { label: 'View issues by category charts', path: '/reports', target: 'analytics' },
    { label: 'Open recent audit findings lists', path: '/history', target: 'recent-issues' },
    { label: 'Show AI recommendations fix', path: '/ai-recommendations', target: 'ai-recommendation' },
    { label: 'Open workspace settings panel', path: '/profile', target: null },
  ];

  const filteredSearch = searchItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close overlays on path changes
  useEffect(() => {
    setIsSidebarOpen(false);
    setShowSearch(false);
    setShowNotifications(false);
    setShowProfileMenu(false);
  }, [currentPath]);

  const handleSearchClick = (item) => {
    setShowSearch(false);
    onNavigate(item.path);
    if (item.target) {
      window.setTimeout(() => {
        document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  };

  return (
    <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar
        currentPath={currentPath}
        userToken={userToken}
        onNavigate={onNavigate}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="app-main">
        <header className="app-header">
          <div className="app-header-left">
            <button
              type="button"
              className="hamburger-menu-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle navigation menu"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
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
            <div className="header-command" role="search" onClick={() => setShowSearch(true)}>
              <Search size={15} aria-hidden="true" />
              <span>Search audits</span>
              <kbd>
                <Command size={12} aria-hidden="true" />K
              </kbd>
            </div>

            <button
              type="button"
              className="header-icon-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'light' ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
            </button>

            <div className="header-relative-wrapper">
              <button
                type="button"
                className="header-icon-btn notification"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
              >
                <Bell size={16} aria-hidden="true" />
                <span>{notifications.length}</span>
              </button>

              {showNotifications && (
                <div className="notifications-dropdown">
                  <div className="dropdown-header">
                    <span>Notifications</span>
                    <button type="button" className="clear-btn" onClick={() => setShowNotifications(false)}>Dismiss</button>
                  </div>
                  <div className="dropdown-list">
                    {notifications.map((n) => (
                      <div key={n.id} className="notification-item">
                        <span className={`bullet bullet-${n.type}`} />
                        <div className="notification-content">
                          <p>{n.text}</p>
                          <span className="notification-time">{n.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="header-relative-wrapper">
              {userToken ? (
                <button type="button" className="header-user-menu" onClick={() => setShowProfileMenu(!showProfileMenu)}>
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

              {showProfileMenu && userToken && (
                <div className="profile-dropdown">
                  <button type="button" className="profile-dropdown-item" onClick={() => { setShowProfileMenu(false); onNavigate('/profile'); }}>
                    <User size={14} /> View Settings
                  </button>
                  <button type="button" className="profile-dropdown-item" onClick={() => { setShowProfileMenu(false); onNavigate('/profile'); }}>
                    <Settings size={14} /> Workspace Configuration
                  </button>
                  <div className="dropdown-divider" />
                  <button type="button" className="profile-dropdown-item text-danger" onClick={() => { setShowProfileMenu(false); onLogout(); }}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>

      {/* Global Search Dialog Modal */}
      {showSearch && (
        <div className="search-modal-overlay" onClick={() => setShowSearch(false)}>
          <div className="search-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search shortcuts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="button" className="close-btn" onClick={() => setShowSearch(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="search-modal-results">
              {filteredSearch.length > 0 ? (
                filteredSearch.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="search-result-item"
                    onClick={() => handleSearchClick(item)}
                  >
                    <span>{item.label}</span>
                    <span className="search-result-target">{item.path}</span>
                  </button>
                ))
              ) : (
                <p className="search-empty">No shortcuts matching "{searchQuery}"</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Layout;
