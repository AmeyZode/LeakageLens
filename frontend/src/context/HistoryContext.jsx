import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createHistoryEntry, getHistory } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const HistoryContext = createContext(null);

export function HistoryProvider({ children }) {
  const { token } = useAuth();
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const loadHistory = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const data = await getHistory({ token });
      setHistory(Array.isArray(data) ? data : []);
      setStatus('success');
    } catch (err) {
      setError(err.message || 'Unable to load history.');
      setStatus('error');
    }
  }, [token]);

  const appendHistory = useCallback(
    async (payload) => {
      try {
        const data = await createHistoryEntry({ ...payload, token });
        if (data?.record) {
          setHistory((current) => [data.record, ...current.filter((item) => item.id !== data.record.id)]);
        }
        return data;
      } catch (err) {
        setError(err.message || 'Unable to save scan history.');
        return null;
      }
    },
    [token],
  );

  const removeHistoryEntry = useCallback(async (id) => {
    setHistory((current) => current.filter((item) => item.id !== id));
    return true;
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const value = useMemo(
    () => ({
      history,
      status,
      error,
      loadHistory,
      appendHistory,
      removeHistoryEntry,
    }),
    [appendHistory, error, history, loadHistory, removeHistoryEntry, status],
  );

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

export function useHistoryData() {
  const context = useContext(HistoryContext);
  if (!context) throw new Error('useHistoryData must be used within HistoryProvider');
  return context;
}
