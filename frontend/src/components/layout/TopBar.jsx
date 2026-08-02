import React, { useEffect, useState } from 'react';
import { Bell, Menu, Moon, PanelLeftClose, PanelLeftOpen, Search, Sun } from 'lucide-react';
import IconButton from '../common/IconButton.jsx';
import StatusPill from '../common/StatusPill.jsx';
import { healthCheck } from '../../services/api.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import NotificationsMenu from './NotificationsMenu.jsx';
import UserMenu from './UserMenu.jsx';

function TopBar({ route, navigate }) {
  const { theme, toggleTheme } = useSettings();
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    setMobileSidebarOpen,
    commandMenuOpen,
    setCommandMenuOpen,
  } = useUI();
  const [health, setHealth] = useState({ status: 'checking', timestamp: null });
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    healthCheck()
      .then((data) => {
        if (!cancelled) setHealth({ status: data?.status || 'ok', timestamp: data?.timestamp });
      })
      .catch(() => {
        if (!cancelled) setHealth({ status: 'offline', timestamp: null });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <IconButton
          className="mobile-menu"
          icon={<Menu size={18} />}
          label="Open navigation"
          onClick={() => setMobileSidebarOpen(true)}
        />
        <IconButton
          className="desktop-collapse"
          icon={sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setSidebarCollapsed((value) => !value)}
        />
        <div>
          <h1>{route.title}</h1>
          <p>{route.subtitle}</p>
        </div>
      </div>

      <div className="topbar-actions">
        <button type="button" className="command-trigger" onClick={() => setCommandMenuOpen(!commandMenuOpen)}>
          <Search size={15} />
          <span>Search workspace</span>
          <kbd>Ctrl K</kbd>
        </button>
        <StatusPill tone={health.status === 'ok' ? 'success' : health.status === 'checking' ? 'neutral' : 'danger'}>
          API {health.status}
        </StatusPill>
        <IconButton
          icon={theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          label="Toggle theme"
          onClick={toggleTheme}
        />
        <div className="menu-anchor">
          <IconButton
            icon={<Bell size={17} />}
            label="Notifications"
            onClick={() => setNotificationsOpen((value) => !value)}
          />
          {notificationsOpen && <NotificationsMenu onClose={() => setNotificationsOpen(false)} />}
        </div>
        <UserMenu navigate={navigate} />
      </div>
    </header>
  );
}

export default TopBar;
