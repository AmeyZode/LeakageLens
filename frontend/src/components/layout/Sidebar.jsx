import React from 'react';
import {
  Bot,
  Clock3,
  FileBarChart2,
  LayoutDashboard,
  LogOut,
  ScanSearch,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { NAV_ROUTES } from '../../routes/routeConfig.js';

const ICONS = {
  Dashboard: LayoutDashboard,
  Scanner: ScanSearch,
  Reports: FileBarChart2,
  History: Clock3,
  AI: Bot,
  Rules: SlidersHorizontal,
  Settings,
};

function Sidebar({ currentPath, navigate }) {
  const { user, logout } = useAuth();
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useUI();

  const handleNavigate = (path) => {
    navigate(path);
    setMobileSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileSidebarOpen(false);
  };

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-brand-row">
        <button type="button" className="sidebar-brand" onClick={() => handleNavigate('/dashboard')}>
          <span className="brand-mark">
            <Search size={18} />
            <ShieldCheck size={15} />
          </span>
          <span className="brand-copy">
            <strong>LeakageLens</strong>
            <small>ML Static Analysis</small>
          </span>
        </button>
        <button type="button" className="sidebar-close" aria-label="Close navigation" onClick={() => setMobileSidebarOpen(false)}>
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {NAV_ROUTES.map((route) => {
          const Icon = ICONS[route.label] || LayoutDashboard;
          const active = currentPath === route.path;
          return (
            <button
              key={route.path}
              type="button"
              className={`sidebar-link ${active ? 'active' : ''}`}
              onClick={() => handleNavigate(route.path)}
              aria-current={active ? 'page' : undefined}
              title={route.label}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{route.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-pipeline">
        <span className="sidebar-label">Pipeline</span>
        {['Ingest', 'Normalize', 'Context', 'Rules', 'AI'].map((step, index) => (
          <div key={step} className="pipeline-step">
            <i>{index + 1}</i>
            <span>{step}</span>
          </div>
        ))}
      </div>

      <div className="sidebar-user">
        <button type="button" className="sidebar-user-card" onClick={() => handleNavigate('/profile')}>
          <span className="avatar">{user?.name?.charAt(0) || 'L'}</span>
          <span>
            <strong>{user?.name || 'LeakageLens User'}</strong>
            <small>{user?.email || 'Local workspace'}</small>
          </span>
        </button>
        <button type="button" className="sidebar-logout" onClick={handleLogout} title="Sign out">
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
