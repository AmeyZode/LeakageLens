import React, { createContext, useContext, useMemo, useState } from 'react';
import { STORAGE_KEYS } from '../utils/constants.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage(STORAGE_KEYS.sidebarCollapsed, false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);

  const value = useMemo(
    () => ({
      sidebarCollapsed,
      setSidebarCollapsed,
      mobileSidebarOpen,
      setMobileSidebarOpen,
      commandMenuOpen,
      setCommandMenuOpen,
    }),
    [
      commandMenuOpen,
      mobileSidebarOpen,
      setCommandMenuOpen,
      setMobileSidebarOpen,
      setSidebarCollapsed,
      sidebarCollapsed,
    ],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
}
