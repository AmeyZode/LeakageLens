import React from 'react';
import {
  Clock3,
  ScanSearch,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useUI } from '../../context/UIContext.jsx';
import { NAV_ROUTES } from '../../routes/routeConfig.js';

const ICONS = {
  Auditor: ScanSearch,
  'Scan History': Clock3,
  Settings: Settings,
};

function Sidebar({ currentPath, navigate }) {
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useUI();

  const handleNavigate = (path) => {
    navigate(path);
    setMobileSidebarOpen(false);
  };

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-brand-row">
        <button type="button" className="sidebar-brand" onClick={() => handleNavigate('/auditor')}>
          <span className="brand-mark">
            <ShieldCheck size={20} />
          </span>
          <span className="brand-copy">
            <strong>LeakageLens</strong>
            <small>ML Pipeline Auditor</small>
          </span>
        </button>
        <button type="button" className="sidebar-close" aria-label="Close navigation" onClick={() => setMobileSidebarOpen(false)}>
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {NAV_ROUTES.map((route) => {
          const Icon = ICONS[route.label] || ScanSearch;
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
        <span className="sidebar-label">Analysis Pipeline</span>
        {['Ingestion', 'AST Normalization', 'Context Graph', 'Rules Engine', 'AI Fixes'].map((step, index) => (
          <div key={step} className="pipeline-step">
            <i>{index + 1}</i>
            <span>{step}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;
