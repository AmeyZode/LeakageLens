import React, { useState } from 'react';
import MetricCard from '../components/MetricCard.jsx';
import IssueAccordion from '../components/IssueAccordion.jsx';

/**
 * Expected shape from POST /api/scan (FastAPI).
 * Matches leakagelens Issue model + report metadata.
 */
export const PLACEHOLDER_SCAN_RESPONSE = {
  score: 42,
  files_scanned: 8,
  counts: {
    critical: 2,
    major: 4,
    minor: 3,
    total: 9,
    leakage: 3,
    evaluation: 2,
    reproducibility: 3,
    quality: 1,
  },
  issues: [
    {
      rule_id: 'PREPROCESSING_LEAKAGE',
      rule_name: 'Data Leakage',
      severity: 'critical',
      file_path: 'sample_projects/training.py',
      line_number: 45,
      context_line: 'X_scaled = scaler.fit_transform(X)',
      description: 'Preprocessing performed before train-test split.',
      suggested_fix: 'Split data first, then apply preprocessing.',
    },
    {
      rule_id: 'RANDOM_STATE',
      rule_name: 'Missing random_state',
      severity: 'major',
      file_path: 'sample_projects/training.py',
      line_number: 16,
      context_line: 'train_test_split(X_scaled, y)',
      description:
        "Detected 'train_test_split' missing a 'random_state' argument. This leads to non-reproducible splits.",
      suggested_fix: 'Pass a fixed integer to random_state (e.g. random_state=42).',
    },
    {
      rule_id: 'TEST_ON_TRAIN',
      rule_name: 'Testing on Training Data',
      severity: 'major',
      file_path: 'sample_projects/training.py',
      line_number: 23,
      context_line: 'train_acc = model.score(X_train, y_train)',
      description:
        'Model is evaluated on training features without any held-out test evaluation.',
      suggested_fix: 'Evaluate the model on a separate test or validation set.',
    },
    {
      rule_id: 'GLOBAL_SEED',
      rule_name: 'Missing Global Seed',
      severity: 'major',
      file_path: 'sample_projects/training.py',
      line_number: 1,
      context_line: 'import numpy as np',
      description: 'No global random seed initialization detected in this file.',
      suggested_fix: 'Add random.seed(42) and np.random.seed(42) at the entry point.',
    },
    {
      rule_id: 'HARDCODED_PATH',
      rule_name: 'Hardcoded Absolute Path',
      severity: 'major',
      file_path: 'sample_projects/leaky_notebook.ipynb',
      line_number: 5,
      context_line: 'df = pd.read_csv("C:\\\\Users\\\\admin\\\\dataset.csv")',
      description: 'Hardcoded absolute path prevents reproducibility across environments.',
      suggested_fix: 'Use relative paths or environment variables for dataset locations.',
    },
    {
      rule_id: 'TEMPORAL_LEAKAGE',
      rule_name: 'Temporal Leakage',
      severity: 'critical',
      file_path: 'sample_projects/features.py',
      line_number: 31,
      context_line: 'X_train, X_test = train_test_split(X, shuffle=True)',
      description: 'Random split applied on time-series data without temporal ordering.',
      suggested_fix: 'Use chronological splits for temporal datasets.',
    },
    {
      rule_id: 'UNUSED_IMPORT',
      rule_name: 'Unused Import',
      severity: 'minor',
      file_path: 'sample_projects/training.py',
      line_number: 1,
      context_line: 'import numpy as np',
      description: "Import 'np' is declared but never used in the file.",
      suggested_fix: "Remove the unused import or use the imported module.",
    },
  ],
  recommendations: {
    PREPROCESSING_LEAKAGE: {
      explanation:
        'Preprocessing was fit on the full dataset before splitting, leaking test-set statistics into training.',
      risk: 'Over-optimistic validation metrics and poor real-world generalization.',
      suggested_fix: 'Split data first, then apply preprocessing.',
      code_snippet: `# Split first
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)`,
    },
  },
};

export function normalizeScanResponse(data) {
  const counts = data.counts || {};
  const issues = data.issues || [];
  const totalIssues =
    counts.total ?? issues.length ?? (counts.critical || 0) + (counts.major || 0) + (counts.minor || 0);

  return {
    score: data.score ?? 0,
    filesScanned: data.files_scanned ?? 0,
    counts: {
      critical: counts.critical ?? 0,
      major: counts.major ?? 0,
      minor: counts.minor ?? 0,
      total: totalIssues,
      leakage: counts.leakage ?? 0,
      evaluation: counts.evaluation ?? 0,
      reproducibility: counts.reproducibility ?? 0,
      quality: counts.quality ?? 0,
    },
    issues,
    recommendations: data.recommendations || {},
  };
}

function CategoryBar({ label, count, maxCount, colorClass }) {
  const width = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;

  return (
    <div className="category-bar">
      <div className="category-bar-label">
        <span>{label}</span>
        <span className="category-bar-count">{count}</span>
      </div>
      <div className="category-bar-track">
        <div
          className={`category-bar-fill ${colorClass}`}
          style={{ width: `${width}%` }}
          role="meter"
          aria-valuenow={count}
          aria-valuemin={0}
          aria-valuemax={maxCount}
          aria-label={`${label}: ${count} issues`}
        />
      </div>
    </div>
  );
}

function Dashboard() {
  const [scanPath, setScanPath] = useState('');
  const [scanResult, setScanResult] = useState(() =>
    normalizeScanResponse(PLACEHOLDER_SCAN_RESPONSE),
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState(null);

  const handleScan = async () => {
    if (!scanPath.trim()) {
      setScanError('Enter a project path to scan.');
      return;
    }

    setIsScanning(true);
    setScanError(null);

    try {
      const token = localStorage.getItem('leakagelens_token');
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          path: scanPath.trim(),
          ai_provider: 'fallback',
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Scan failed (${response.status})`);
      }

      const data = await response.json();
      setScanResult(normalizeScanResponse(data));
    } catch (err) {
      setScanError(err.message || 'Unable to reach the scan API.');
    } finally {
      setIsScanning(false);
    }
  };

  const { score, filesScanned, counts, issues, recommendations } = scanResult;

  const categoryData = [
    { label: 'Leakage Issues', count: counts.leakage, colorClass: 'bar-leakage' },
    { label: 'Evaluation Issues', count: counts.evaluation, colorClass: 'bar-evaluation' },
    {
      label: 'Reproducibility Issues',
      count: counts.reproducibility,
      colorClass: 'bar-reproducibility',
    },
    { label: 'Code Quality Issues', count: counts.quality, colorClass: 'bar-quality' },
  ];

  const maxCategoryCount = Math.max(...categoryData.map((c) => c.count), 1);

  const scoreLabel =
    score >= 80 ? 'Healthy' : score >= 50 ? 'Needs Attention' : score >= 25 ? 'At Risk' : 'Critical';

  return (
    <div className="dashboard-view">
      <section className="dashboard-scan-bar">
        <div className="dashboard-scan-input-group">
          <label htmlFor="scan-path" className="dashboard-scan-label">
            Project path
          </label>
          <input
            id="scan-path"
            type="text"
            className="dashboard-scan-input"
            placeholder="e.g. ./sample_projects or /path/to/ml-project"
            value={scanPath}
            onChange={(e) => setScanPath(e.target.value)}
            disabled={isScanning}
          />
        </div>
        <button
          type="button"
          className="dashboard-scan-btn"
          onClick={handleScan}
          disabled={isScanning}
        >
          {isScanning ? (
            <>
              <span className="scan-spinner" aria-hidden="true" />
              Scanning…
            </>
          ) : (
            'Scan Project'
          )}
        </button>
      </section>

      {scanError && (
        <div className="dashboard-alert dashboard-alert--error" role="alert">
          {scanError}
        </div>
      )}

      <p className="dashboard-placeholder-note">
        Displaying placeholder data for UI testing. Connect{' '}
        <code>POST /api/scan</code> to load live results.
      </p>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">Project Health Overview</h2>
        <div className="metric-grid">
          <MetricCard
            title="Health Score"
            value={`${score}/100`}
            subtitle={scoreLabel}
            variant="score"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            }
          />
          <MetricCard
            title="Files Scanned"
            value={filesScanned}
            subtitle="Python & notebooks"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M10 13h4M10 17h4" />
              </svg>
            }
          />
          <MetricCard
            title="Issues Found"
            value={counts.total}
            subtitle={`${counts.major} major · ${counts.minor} minor`}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
              </svg>
            }
          />
          <MetricCard
            title="Critical Issues"
            value={counts.critical}
            subtitle="Requires immediate fix"
            variant="critical"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
              </svg>
            }
          />
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">Issue Analytics</h2>
        <div className="analytics-panel">
          {categoryData.map((category) => (
            <CategoryBar
              key={category.label}
              label={category.label}
              count={category.count}
              maxCount={maxCategoryCount}
              colorClass={category.colorClass}
            />
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">Detected Problems</h2>
          <span className="dashboard-issue-count">{issues.length} issues</span>
        </div>
        <IssueAccordion issues={issues} recommendations={recommendations} />
      </section>
    </div>
  );
}

export default Dashboard;
