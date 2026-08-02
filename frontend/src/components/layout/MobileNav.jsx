import React from 'react';
import { Bot, FileBarChart2, LayoutDashboard, ScanSearch, Settings } from 'lucide-react';
import { NAV_ROUTES } from '../../routes/routeConfig.js';

const MOBILE_ICONS = {
  Dashboard: LayoutDashboard,
  Scanner: ScanSearch,
  Reports: FileBarChart2,
  AI: Bot,
  Settings,
};

function MobileNav({ currentPath, navigate }) {
  const visibleRoutes = NAV_ROUTES.filter((route) =>
    ['Dashboard', 'Scanner', 'Reports', 'AI', 'Settings'].includes(route.label),
  );

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {visibleRoutes.map((route) => {
        const Icon = MOBILE_ICONS[route.label] || LayoutDashboard;
        const active = currentPath === route.path;
        return (
          <button
            key={route.path}
            type="button"
            className={active ? 'active' : ''}
            onClick={() => navigate(route.path)}
          >
            <Icon size={18} />
            <span>{route.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default MobileNav;
