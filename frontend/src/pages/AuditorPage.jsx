import React, { useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Code2,
  Copy,
  Cpu,
  Download,
  FileCode,
  FileText,
  FolderOpen,
  Play,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  UploadCloud,
} from 'lucide-react';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import CodeBlock from '../components/common/CodeBlock.jsx';
import CopyButton from '../components/common/CopyButton.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import SectionHeader from '../components/common/SectionHeader.jsx';
import StatusPill from '../components/common/StatusPill.jsx';
import { useScan } from '../context/ScanContext.jsx';
import { useDerivedScanMetrics } from '../hooks/useDerivedScanMetrics.js';
import { buildJsonReport, buildMarkdownReport } from '../utils/reportBuilders.js';
import { getCategoryLabel } from '../utils/ruleCatalog.js';

const SAMPLE_PRESETS = [
  { label: 'Synthetic Benchmark', path: 'sample_projects/leaky_pipeline_benchmark.py', badge: 'Recommended' },
  { label: 'All Sample Projects', path: 'sample_projects' },
  { label: 'Preprocessing Leakage', path: 'sample_projects/preprocessing_leakage.py' },
  { label: 'Current Repo Root', path: '.' },
];

function AuditorPage({ navigate }) {
  const { currentScan, rawScan, scanStatus, scanError, scanLogs, runScan, uploadFile, refreshRecommendation } = useScan();
  const [inputPath, setInputPath] = useState('sample_projects/leaky_pipeline_benchmark.py');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const fileInputRef = useRef(null);

  const { severityData, topIssues } = useDerivedScanMetrics(currentScan);
  const isScanning = scanStatus === 'scanning';

  const handleScanSubmit = (event) => {
    event?.preventDefault();
    if (uploadedFile) {
      uploadFile(uploadedFile);
    } else if (inputPath.trim()) {
      runScan(inputPath.trim());
    }
  };

  const handlePresetSelect = (presetPath) => {
    setUploadedFile(null);
    setInputPath(presetPath);
    runScan(presetPath);
  };

  const handleInputChange = (event) => {
    setUploadedFile(null);
    setInputPath(event.target.value);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setInputPath(`upload://${file.name}`);
      uploadFile(file);
    }
  };

  // Filtered Issues list
  const filteredIssues = useMemo(() => {
    if (!currentScan?.issues) return [];
    const q = searchQuery.trim().toLowerCase();

    return currentScan.issues.filter((issue) => {
      if (severityFilter !== 'all' && issue.severity !== severityFilter) return false;
      if (categoryFilter !== 'all' && issue.category !== categoryFilter) return false;
      if (!q) return true;

      const haystack = [
        issue.rule_id,
        issue.rule_name,
        issue.file_path,
        issue.description,
        issue.recommendationExplanation,
        issue.recommendationFix,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [currentScan, searchQuery, severityFilter, categoryFilter]);

  // Export handlers
  const handleDownloadMarkdown = () => {
    if (!rawScan) return;
    const content = buildMarkdownReport(rawScan);
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LeakageLens_Audit_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    if (!rawScan) return;
    const content = buildJsonReport(rawScan);
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LeakageLens_Audit_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="auditor-workspace page-stack">
      {/* 1. Scanner Command Hero */}
      <Card className="auditor-hero-card">
        <div className="auditor-hero-header">
          <div className="auditor-hero-title">
            <span className="auditor-hero-icon">
              <ShieldAlert size={22} />
            </span>
            <div>
              <span className="eyebrow">Static Analysis Engine</span>
              <h2>ML Pipeline Data Leakage & Anti-Pattern Auditor</h2>
              <p>Scan machine learning pipelines for data leakage, unseeded splits, hardcoded paths, and training metric errors.</p>
            </div>
          </div>

          <div className="preset-quick-chips">
            <span className="preset-chips-label">Presets:</span>
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.path}
                type="button"
                className={`preset-chip ${inputPath === preset.path ? 'preset-chip--active' : ''}`}
                onClick={() => handlePresetSelect(preset.path)}
                disabled={isScanning}
              >
                <span>{preset.label}</span>
                {preset.badge && <span className="preset-badge">{preset.badge}</span>}
              </button>
            ))}
          </div>
        </div>

        <form className="scan-input-box" onSubmit={handleScanSubmit}>
          <div className="scan-field-group">
            <FolderOpen size={18} className="field-icon" />
            <input
              type="text"
              value={inputPath}
              onChange={handleInputChange}
              placeholder="Enter server path (e.g. sample_projects) or upload local file"
              disabled={isScanning}
            />
          </div>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            icon={<UploadCloud size={18} />}
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
          >
            Upload File
          </Button>

          <Button type="submit" variant="primary" size="lg" icon={<Play size={18} />} disabled={isScanning || !inputPath.trim()}>
            {isScanning ? 'Auditing Pipeline...' : 'Start Audit'}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".py,.ipynb,.zip"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </form>

        {scanError && (
          <div className="scan-error-banner">
            <AlertTriangle size={18} />
            <span>{scanError}</span>
          </div>
        )}
      </Card>

      {/* 2. Active Scan Dashboard Overview */}
      {currentScan ? (
        <>
          <div className="auditor-metrics-grid">
            {/* Health Score Ring Card */}
            <Card className="health-score-card">
              <div className="health-score-header">
                <span className="eyebrow">Health Grade</span>
                <StatusPill tone={currentScan.score >= 80 ? 'success' : currentScan.score >= 50 ? 'warning' : 'danger'}>
                  {currentScan.healthLabel}
                </StatusPill>
              </div>

              <div className="health-score-body">
                <div className="health-score-ring">
                  <strong>{currentScan.score}</strong>
                  <span>/ 100</span>
                </div>
                <div className="health-score-meta">
                  <p>Risk Level: <strong className={`risk-tag risk-tag--${currentScan.severityTone}`}>{currentScan.riskLevel}</strong></p>
                  <p>Deduction Points: <strong>{currentScan.riskScore}</strong></p>
                  <p>Scanned Target: <code>{currentScan.sourcePath}</code></p>
                </div>
              </div>
            </Card>

            {/* Finding Severity Counts */}
            <Card className="severity-summary-card">
              <SectionHeader icon={<Activity size={16} />} title="Audit Findings Breakdown" />
              <div className="severity-pills-row">
                <div className="severity-pill-stat severity-pill-stat--critical">
                  <span className="count">{currentScan.counts?.critical || 0}</span>
                  <span className="label">Critical</span>
                </div>
                <div className="severity-pill-stat severity-pill-stat--major">
                  <span className="count">{currentScan.counts?.major || 0}</span>
                  <span className="label">Major</span>
                </div>
                <div className="severity-pill-stat severity-pill-stat--minor">
                  <span className="count">{currentScan.counts?.minor || 0}</span>
                  <span className="label">Minor</span>
                </div>
                <div className="severity-pill-stat severity-pill-stat--total">
                  <span className="count">{currentScan.totalIssues}</span>
                  <span className="label">Total Issues</span>
                </div>
              </div>
            </Card>

            {/* ML Classifier Insights Card */}
            <Card className="ml-insights-card">
              <SectionHeader icon={<Cpu size={16} />} title="ML Code Leakage Model Insights" />
              <div className="ml-model-meta">
                <div className="ml-model-score">
                  <span className="ml-score-number">{currentScan.mlInsights?.ml_risk_score ?? 0}%</span>
                  <span className="ml-score-label">ML Leakage Risk</span>
                </div>
                <StatusPill tone={currentScan.mlInsights?.ml_risk_score >= 70 ? 'danger' : currentScan.mlInsights?.ml_risk_score >= 35 ? 'warning' : 'success'}>
                  {currentScan.mlInsights?.confidence_label?.replace(/_/g, ' ') || 'CLEAN PIPELINE'}
                </StatusPill>
              </div>
              {currentScan.mlInsights?.feature_importances?.length > 0 && (
                <div className="ml-feature-list">
                  <span className="ml-feature-title">Key Learned Features:</span>
                  <div className="ml-feature-chips">
                    {currentScan.mlInsights.feature_importances.map((feat, i) => (
                      <span key={i} className="ml-feature-chip">
                        {feat.feature}: <strong>{feat.importance}%</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Export & Quick Reports */}
            <Card className="export-actions-card">
              <SectionHeader icon={<FileText size={16} />} title="Audit Reports Export" />
              <p className="muted-copy">Download structured compliance reports derived from current AST findings.</p>
              <div className="export-btn-group">
                <Button variant="secondary" icon={<Download size={16} />} onClick={handleDownloadMarkdown}>
                  Download Markdown (.md)
                </Button>
                <Button variant="ghost" icon={<FileCode size={16} />} onClick={handleDownloadJson}>
                  Download JSON (.json)
                </Button>
              </div>
            </Card>
          </div>

          {/* 3. Findings Filter Bar & Findings List */}
          <div className="auditor-findings-section">
            <div className="findings-filter-bar card">
              <div className="filter-search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Filter findings by rule, description, file, or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filter-selects">
                <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
                  <option value="all">All Severities</option>
                  <option value="critical">Critical Only</option>
                  <option value="major">Major Only</option>
                  <option value="minor">Minor Only</option>
                </select>

                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="all">All Categories</option>
                  <option value="leakage">Data Leakage</option>
                  <option value="reproducibility">Reproducibility</option>
                  <option value="evaluation">Evaluation</option>
                  <option value="quality">Code Quality</option>
                </select>
              </div>
            </div>

            {!filteredIssues.length ? (
              <EmptyState title="No matching findings" description="No violations matched your search or category filters." />
            ) : (
              <div className="findings-feed">
                {filteredIssues.map((issue, idx) => (
                  <article key={`${issue.rule_id}-${issue.file_path}-${issue.line_number}-${idx}`} className="finding-card card">
                    <div className="finding-header">
                      <div className="finding-title-group">
                        <Badge tone={issue.severity === 'critical' ? 'danger' : issue.severity === 'major' ? 'warning' : 'info'}>
                          {issue.severity.toUpperCase()}
                        </Badge>
                        <Badge tone="neutral">{issue.rule_id}</Badge>
                        <h3>{issue.rule_name}</h3>
                      </div>

                      <span className="finding-location">
                        <code>{issue.file_path}:{issue.line_number}</code>
                      </span>
                    </div>

                    <p className="finding-description">{issue.description}</p>

                    {issue.context_line && (
                      <div className="finding-context-snippet">
                        <span className="snippet-label">Violating Line {issue.line_number}:</span>
                        <code>{issue.context_line}</code>
                      </div>
                    )}

                    {/* AI Recommendation & Code Fix */}
                    <div className="finding-recommendation-box">
                      <div className="recommendation-header">
                        <span className="recommendation-badge">
                          <Sparkles size={14} /> AI Recommendation & Fix
                        </span>
                        <div className="recommendation-actions">
                          {issue.recommendationFix && <CopyButton value={issue.recommendationFix} label="Copy Fix Code" />}
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<RefreshCw size={13} />}
                            onClick={() => refreshRecommendation(issue)}
                          >
                            Refresh
                          </Button>
                        </div>
                      </div>

                      <p className="recommendation-text">{issue.recommendationExplanation || issue.description}</p>

                      {(issue.recommendationFix || issue.suggested_fix) && (
                        <CodeBlock>{issue.recommendationFix || issue.suggested_fix}</CodeBlock>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Empty State before any scan */
        <Card className="auditor-welcome-card">
          <div className="welcome-content">
            <ShieldCheck size={48} className="welcome-icon" />
            <h3>No Active Audit Results</h3>
            <p>Click one of the quick preset targets above or enter a project path to begin auditing.</p>
            <Button variant="primary" icon={<Play size={16} />} onClick={() => handlePresetSelect('sample_projects/leaky_pipeline_benchmark.py')}>
              Run Synthetic Benchmark Audit
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default AuditorPage;
