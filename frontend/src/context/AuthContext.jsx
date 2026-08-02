import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { loginWithGoogleCredential } from '../services/api.js';
import { STORAGE_KEYS } from '../utils/constants.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken, clearToken] = useLocalStorage(STORAGE_KEYS.token, null);
  const [user, setUser, clearUser] = useLocalStorage(STORAGE_KEYS.user, null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const login = useCallback(
    async (credential) => {
      setStatus('loading');
      setError(null);

      try {
        const data = await loginWithGoogleCredential(credential);
        setToken(data.token);
        setUser(data.user);
        setStatus('authenticated');
        return data;
      } catch (err) {
        setError(err.message || 'Unable to sign in.');
        setStatus('error');
        throw err;
      }
    },
    [setToken, setUser],
  );

  const logout = useCallback(() => {
    clearToken();
    clearUser();
    setStatus('idle');
    setError(null);
  }, [clearToken, clearUser]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      status,
      error,
      login,
      logout,
    }),
    [error, login, logout, status, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
