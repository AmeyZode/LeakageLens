import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { DEFAULT_SCAN_PATH, PROVIDERS, STORAGE_KEYS } from '../utils/constants.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { useTheme } from './ThemeContext.jsx';

const DEFAULT_SETTINGS = {
  aiProvider: 'fallback',
  openAiKey: '',
  ollamaUrl: 'http://localhost:11434',
  defaultScanPath: DEFAULT_SCAN_PATH,
  autoOpenReport: true,
  compactDensity: false,
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useLocalStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  const { theme, setTheme, toggleTheme } = useTheme();

  const updateSetting = useCallback(
    (key, value) => {
      setSettings((current) => ({ ...DEFAULT_SETTINGS, ...current, [key]: value }));
    },
    [setSettings],
  );

  const resolvedSettings = { ...DEFAULT_SETTINGS, ...settings };
  const runtimeAiProvider = resolvedSettings.aiProvider === 'openai' ? 'openai' : 'fallback';
  const provider = PROVIDERS.find((item) => item.value === resolvedSettings.aiProvider) || PROVIDERS[0];

  const value = useMemo(
    () => ({
      ...resolvedSettings,
      provider,
      runtimeAiProvider,
      theme,
      setTheme,
      toggleTheme,
      updateSetting,
      setSettings,
    }),
    [
      provider,
      resolvedSettings,
      runtimeAiProvider,
      setSettings,
      setTheme,
      theme,
      toggleTheme,
      updateSetting,
    ],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
