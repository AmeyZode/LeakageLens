import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { DashboardTab } from './components/dashboard/DashboardTab';
import { ScannerTab } from './components/scanner/ScannerTab';
import { AuditorTab } from './components/auditor/AuditorTab';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { DEFAULT_SCAN_RESULT } from './utils/sampleData';
import { checkHealth, logHistoryRecord } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scanResult, setScanResult] = useState(DEFAULT_SCAN_RESULT);
  const [backendHealthy, setBackendHealthy] = useState(false);

  useEffect(() => {
    // Verify connection to FastAPI backend
    checkHealth()
      .then((res) => {
        if (res.status === 'ok' || res.status === 'healthy') {
          setBackendHealthy(true);
        }
      })
      .catch(() => setBackendHealthy(false));
  }, []);

  const handleScanComplete = (newResult, projectName = 'uploaded_project.py') => {
    setScanResult(newResult);
    setActiveTab('auditor'); // navigate straight to auditor so user sees line highlights and DAG immediately!

    // Log to history
    logHistoryRecord({
      project_name: projectName,
      score: newResult.score,
      critical_count: newResult.counts?.critical || 0,
      major_count: newResult.counts?.major || 0,
      minor_count: newResult.counts?.minor || 0,
    }).catch((err) => console.warn('History log skipped:', err));
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      
      {/* Top Navigation Header */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendHealthy={backendHealthy}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBoundary>
          {activeTab === 'dashboard' && (
            <DashboardTab 
              scanResult={scanResult} 
              onNavigateScanner={() => setActiveTab('scanner')}
              onNavigateAuditor={() => setActiveTab('auditor')}
            />
          )}

          {activeTab === 'scanner' && (
            <ScannerTab onScanComplete={handleScanComplete} />
          )}

          {activeTab === 'auditor' && (
            <AuditorTab scanResult={scanResult} />
          )}
        </ErrorBoundary>
      </main>

      {/* Modern Minimalist Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 LeakageLens • Pillai College of Engineering, New Panvel</p>
          <p className="font-mono text-[11px] text-slate-400">
            Static AST Analysis • Jupyter Cell Parsing • AI Governance Compliance
          </p>
        </div>
      </footer>

    </div>
  );
}

export default App;
