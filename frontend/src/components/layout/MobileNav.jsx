import React from 'react';
import { Clock3, ScanSearch, Settings } from 'lucide-react';
import { NAV_ROUTES } from '../../routes/routeConfig.js';

const MOBILE_ICONS = {
  Auditor: ScanSearch,
  'Scan History': Clock3,
  Settings: Settings,
};

function MobileNav({ currentPath, navigate }) {
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {NAV_ROUTES.map((route) => {
        const Icon = MOBILE_ICONS[route.label] || ScanSearch;
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
