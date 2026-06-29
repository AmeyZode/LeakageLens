import React from 'react';
import {
  Bot,
  ChevronDown,
  Clock3,
  FileBarChart2,
  Gauge,
  Home,
  LogIn,
  LogOut,
  ScanSearch,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  X
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: Home, protected: true, targetId: 'dashboard-top' },
  { path: '/scanner', label: 'Scanner', icon: ScanSearch, protected: true, targetId: 'upload-project' },
  { path: '/reports', label: 'Reports', icon: FileBarChart2, protected: true, targetId: 'analytics' },
  { path: '/history', label: 'History', icon: Clock3, protected: true, targetId: 'recent-issues' },
  { path: '/rules', label: 'Rules', icon: SlidersHorizontal, protected: true, targetId: 'recent-issues' },
  { path: '/ai-recommendations', label: 'AI Recommendations', icon: Bot, protected: true, targetId: 'ai-recommendation' },
  { path: '/settings', label: 'Settings', icon: Settings, protected: true },
];

const PIPELINE_STEPS = [
  { label: 'Upload', detail: 'Import your project' },
  { label: 'Scanner', detail: 'File scanning and parsing' },
  { label: 'AST Parser', detail: 'Generate AST structure' },
  { label: 'Context Builder', detail: 'Extract flow & context' },
  { label: 'Rules Engine', detail: 'Apply detection rules' },
  { label: 'AI Report', detail: 'Generate insights' },
];

function Sidebar({ currentPath, userToken, onNavigate, onLogout, isOpen, onClose }) {
  const isActive = (item) => {
    if (item.path === '/settings') return currentPath === '/settings' || currentPath === '/profile';
    return currentPath === item.path;
  };

  const handleNavClick = (item) => {
    if (item.protected && !userToken) {
      onNavigate('/login');
      return;
    }

    onNavigate(item.path);

    if (item.targetId) {
      window.setTimeout(() => {
        document.getElementById(item.targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
    
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand-wrapper">
          <button type="button" className="sidebar-brand" onClick={() => { onNavigate('/'); if (onClose) onClose(); }}>
            <span className="sidebar-logo" aria-hidden="true">
              <Search size={22} />
              <ShieldCheck size={18} />
            </span>
            <span className="sidebar-brand-copy">
              <span className="sidebar-title">LeakageLens</span>
              <span className="sidebar-subtitle">ML Pipeline Auditor</span>
            </span>
          </button>
          
          <button type="button" className="sidebar-mobile-close" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                className={`sidebar-nav-item${isActive(item) ? ' active' : ''}`}
                onClick={() => handleNavClick(item)}
                aria-current={isActive(item) ? 'page' : undefined}
                title={item.label}
              >
                <Icon className="sidebar-nav-icon" size={18} aria-hidden="true" />
                <span className="sidebar-nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-pipeline" aria-label="Analysis pipeline">
          <p className="sidebar-pipeline-label">Analysis Pipeline</p>
          <ol className="sidebar-pipeline-steps">
            {PIPELINE_STEPS.map((step, index) => (
              <li key={step.label}>
                <span className="pipeline-step-dot">
                  <Gauge size={12} aria-hidden="true" />
                </span>
                <span>
                  <span className="pipeline-step-title">{step.label}</span>
                  <span className="pipeline-step-detail">{step.detail}</span>
                </span>
                {index < PIPELINE_STEPS.length - 1 && <span className="pipeline-step-line" aria-hidden="true" />}
              </li>
            ))}
          </ol>
        </div>

        <div className="sidebar-footer">
          {userToken ? (
            <div className="sidebar-user-card">
              <span className="sidebar-avatar" aria-hidden="true">
                A
              </span>
              <span className="sidebar-user-copy">
                <span className="sidebar-user-name">Aditya Pulpati</span>
                <span className="sidebar-user-email">aditya@gmail.com</span>
              </span>
              <span className="sidebar-plan-badge">Pro</span>
              <button type="button" className="sidebar-user-action" onClick={() => { onLogout(); if (onClose) onClose(); }} title="Sign out">
                <LogOut size={15} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button type="button" className="sidebar-signin-card" onClick={() => { onNavigate('/login'); if (onClose) onClose(); }}>
              <span className="sidebar-avatar" aria-hidden="true">
                <LogIn size={17} />
              </span>
              <span className="sidebar-user-copy">
                <span className="sidebar-user-name">Guest Analyst</span>
                <span className="sidebar-user-email">Sign in to scan</span>
              </span>
              <ChevronDown size={15} aria-hidden="true" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
