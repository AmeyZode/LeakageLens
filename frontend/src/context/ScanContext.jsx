import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { getRecommendation, scanProject } from '../services/api.js';
import { SCAN_STAGES, STORAGE_KEYS } from '../utils/constants.js';
import { buildHistoryPayload, normalizeIssue, normalizeScanResponse } from '../utils/scanTransforms.js';
import { useAuth } from './AuthContext.jsx';
import { useHistoryData } from './HistoryContext.jsx';
import { useSettings } from './SettingsContext.jsx';

const ScanContext = createContext(null);

function readLatestScan() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.latestScan);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.raw ? normalizeScanResponse(parsed.raw, parsed.sourcePath) : null;
  } catch {
    return null;
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function ScanProvider({ children }) {
  const { token } = useAuth();
  const { appendHistory } = useHistoryData();
  const { runtimeAiProvider, openAiKey } = useSettings();
  const [currentScan, setCurrentScan] = useState(readLatestScan);
  const [rawScan, setRawScan] = useState(() => currentScan?.raw || null);
  const [scanStatus, setScanStatus] = useState('idle');
  const [scanError, setScanError] = useState(null);
  const [scanLogs, setScanLogs] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState(null);

  const pushLog = useCallback((message, type = 'info') => {
    setScanLogs((current) => [
      ...current,
      { id: `${Date.now()}-${current.length}`, timestamp: new Date().toISOString(), message, type },
    ]);
  }, []);

  const setStage = useCallback(
    (stage, message) => {
      setScanStatus(stage);
      if (message) pushLog(message, stage === 'failed' ? 'error' : 'info');
    },
    [pushLog],
  );

  const runScan = useCallback(
    async (path) => {
      const trimmedPath = path?.trim();
      if (!trimmedPath) {
        setScanError('Enter a backend-accessible project path.');
        setStage('failed', 'Scan blocked because no path was provided.');
        return null;
      }

      setScanError(null);
      setScanLogs([]);
      setStage('queued', `Queued scan for ${trimmedPath}.`);
      await sleep(180);
      setStage('validating', 'Request payload prepared for FastAPI scanner.');

      try {
        await sleep(180);
        setStage('scanning', 'Analyzer is discovering files, normalizing AST, and applying rules.');
        const raw = await scanProject({
          path: trimmedPath,
          aiProvider: runtimeAiProvider,
          apiKey: runtimeAiProvider === 'openai' ? openAiKey : null,
          token,
        });

        setStage('recommendations', 'Recommendation engine attached issue guidance.');
        await sleep(160);

        const normalized = normalizeScanResponse(raw, trimmedPath);
        setCurrentScan(normalized);
        setRawScan(raw);
        setSelectedIssueId(normalized.issues[0]?.id || null);

        try {
          window.localStorage.setItem(
            STORAGE_KEYS.latestScan,
            JSON.stringify({ raw, sourcePath: trimmedPath }),
          );
        } catch {
          // Keep in-memory scan even if persistence is unavailable.
        }

        appendHistory(buildHistoryPayload(normalized));
        setStage('complete', `Scan completed with ${normalized.totalIssues} findings.`);
        return normalized;
      } catch (err) {
        const message = err.message || 'Scan failed.';
        setScanError(message);
        setStage('failed', message);
        return null;
      }
    },
    [appendHistory, openAiKey, runtimeAiProvider, setStage, token],
  );

  const refreshRecommendation = useCallback(
    async (issue) => {
      if (!issue || !currentScan) return null;
      pushLog(`Refreshing recommendation for ${issue.rule_id}.`);

      try {
        const recommendation = await getRecommendation({
          issue,
          aiProvider: runtimeAiProvider,
          apiKey: runtimeAiProvider === 'openai' ? openAiKey : null,
          token,
        });

        const nextIssues = currentScan.issues.map((item, index) =>
          item.id === issue.id
            ? normalizeIssue({ ...item, ai_recommendation: recommendation }, index)
            : item,
        );
        const nextRaw = {
          ...(rawScan || currentScan.raw),
          issues: nextIssues.map(({ id, category, fileName, recommendationExplanation, recommendationFix, ...rest }) => rest),
        };
        const nextScan = normalizeScanResponse(nextRaw, currentScan.sourcePath);

        setCurrentScan(nextScan);
        setRawScan(nextRaw);
        pushLog(`Recommendation refreshed for ${issue.rule_id}.`, 'success');
        return recommendation;
      } catch (err) {
        pushLog(err.message || 'Recommendation refresh failed.', 'error');
        return null;
      }
    },
    [currentScan, openAiKey, pushLog, rawScan, runtimeAiProvider, token],
  );

  const selectedIssue = useMemo(
    () => currentScan?.issues.find((issue) => issue.id === selectedIssueId) || currentScan?.issues[0] || null,
    [currentScan, selectedIssueId],
  );

  const activeStage = SCAN_STAGES.find((stage) => stage.id === scanStatus) || SCAN_STAGES[0];

  const value = useMemo(
    () => ({
      currentScan,
      rawScan,
      scanStatus,
      activeStage,
      scanError,
      scanLogs,
      selectedIssue,
      selectedIssueId,
      setSelectedIssueId,
      runScan,
      refreshRecommendation,
    }),
    [
      activeStage,
      currentScan,
      rawScan,
      refreshRecommendation,
      runScan,
      scanError,
      scanLogs,
      scanStatus,
      selectedIssue,
      selectedIssueId,
    ],
  );

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useScan() {
  const context = useContext(ScanContext);
  if (!context) throw new Error('useScan must be used within ScanProvider');
  return context;
}
