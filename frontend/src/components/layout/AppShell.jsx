import React from 'react';
import CommandMenu from './CommandMenu.jsx';
import MobileNav from './MobileNav.jsx';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import { useUI } from '../../context/UIContext.jsx';

function AppShell({ currentPath, route, navigate, children }) {
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useUI();

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'is-collapsed' : ''}`}>
      {mobileSidebarOpen && (
        <button
          type="button"
          className="mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <Sidebar currentPath={currentPath} navigate={navigate} />

      <div className="app-workspace">
        <TopBar route={route} navigate={navigate} />
        <main className="app-page">{children}</main>
      </div>

      <MobileNav currentPath={currentPath} navigate={navigate} />
      <CommandMenu currentPath={currentPath} navigate={navigate} />
    </div>
  );
}

export default AppShell;
