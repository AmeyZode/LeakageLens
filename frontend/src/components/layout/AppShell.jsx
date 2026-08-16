import React, { useEffect, useRef } from 'react';
import CommandMenu from './CommandMenu.jsx';
import MobileNav from './MobileNav.jsx';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import { useUI } from '../../context/UIContext.jsx';

function AppShell({ currentPath, route, navigate, children }) {
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useUI();
  const pageRef = useRef(null);

  useEffect(() => {
    pageRef.current?.scrollTo({ top: 0, left: 0 });
    window.scrollTo({ top: 0, left: 0 });
  }, [currentPath]);

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
        <main ref={pageRef} className="app-page">{children}</main>
      </div>

      <MobileNav currentPath={currentPath} navigate={navigate} />
      <CommandMenu currentPath={currentPath} navigate={navigate} />
    </div>
  );
}

export default AppShell;
