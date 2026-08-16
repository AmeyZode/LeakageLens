import React from 'react';
import { AuthProvider } from './AuthContext.jsx';
import { HistoryProvider } from './HistoryContext.jsx';
import { ScanProvider } from './ScanContext.jsx';
import { SettingsProvider } from './SettingsContext.jsx';
import { ThemeProvider } from './ThemeContext.jsx';
import { UIProvider } from './UIContext.jsx';

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <HistoryProvider>
            <ScanProvider>
              <UIProvider>{children}</UIProvider>
            </ScanProvider>
          </HistoryProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
