import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import ErrorState from '../components/common/ErrorState.jsx';
import Button from '../components/common/Button.jsx';
import ProjectPickerPanel from '../components/scanner/ProjectPickerPanel.jsx';
import ScanLogs from '../components/scanner/ScanLogs.jsx';
import ScanPathForm from '../components/scanner/ScanPathForm.jsx';
import ScanProgress from '../components/scanner/ScanProgress.jsx';
import ScanResultSummary from '../components/scanner/ScanResultSummary.jsx';
import { useScan } from '../context/ScanContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { STORAGE_KEYS } from '../utils/constants.js';

const PENDING_SCAN_KEY = 'leakagelens_pending_scan';

function ScannerPage({ navigate }) {
  const { defaultScanPath, autoOpenReport } = useSettings();
  const {
    currentScan,
    scanStatus,
    activeStage,
    scanError,
    scanLogs,
    runScan,
  } = useScan();
  const [previewFiles, setPreviewFiles] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [lastPath, setLastPath] = useState(defaultScanPath);

  const isScanning = ['queued', 'validating', 'scanning', 'recommendations'].includes(scanStatus);

  useEffect(() => {
    const pending = window.sessionStorage.getItem(PENDING_SCAN_KEY);
    if (pending) {
      setLastPath(pending);
      window.sessionStorage.removeItem(PENDING_SCAN_KEY);
    }
  }, []);

  useEffect(() => {
    if (scanStatus === 'complete') {
      setSuccessMessage(`Scan completed — ${currentScan?.totalIssues ?? 0} findings detected.`);
      if (autoOpenReport) {
        window.setTimeout(() => navigate('/reports'), 1200);
      }
    }
  }, [autoOpenReport, currentScan?.totalIssues, navigate, scanStatus]);

  const handleScan = useCallback(
    async (path) => {
      setSuccessMessage('');
      setLastPath(path);
      await runScan(path);
    },
    [runScan],
  );

  const handleRetry = useCallback(() => {
    if (lastPath) handleScan(lastPath);
  }, [handleScan, lastPath]);

  const initialPath = useMemo(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEYS.latestScan);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.sourcePath || defaultScanPath;
      }
    } catch {
      // ignore parse errors
    }
    return lastPath || defaultScanPath;
  }, [defaultScanPath, lastPath]);

  return (
    <div className="scanner-page page-stack">
      <ScanPathForm
        defaultPath={initialPath}
        isScanning={isScanning}
        onScan={handleScan}
        onPreviewFiles={setPreviewFiles}
      />

      {scanError && (
        <ErrorState
          message={scanError}
          action={
            <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={handleRetry}>
              Retry scan
            </Button>
          }
        />
      )}

      {successMessage && !scanError && (
        <div className="scan-success-banner" role="status">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="scanner-grid">
        <div className="scanner-main">
          <ScanProgress activeStage={activeStage} isScanning={isScanning} />
          <ScanLogs logs={scanLogs} />
        </div>
        <div className="scanner-side">
          <ProjectPickerPanel files={previewFiles} />
          <ScanResultSummary scan={currentScan} navigate={navigate} />
        </div>
      </div>
    </div>
  );
}

export default ScannerPage;
