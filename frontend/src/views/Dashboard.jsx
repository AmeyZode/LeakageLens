import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Bot,
  CheckCircle2,
  Code2,
  Database,
  FileCheck2,
  FileText,
  FolderOpen,
  Gauge,
  Network,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import MetricCard from '../components/MetricCard.jsx';
import IssueAccordion from '../components/IssueAccordion.jsx';

export const PLACEHOLDER_SCAN_RESPONSE = {
  score: 92,
  files_scanned: 48,
  counts: {
    critical: 0,
    major: 3,
    minor: 9,
    total: 12,
    leakage: 5,
    evaluation: 3,
    reproducibility: 2,
    quality: 2,
  },
  issues: [
    {
      rule_id: 'PREPROCESSING_LEAKAGE',
      rule_name: 'Data Leakage Detected',
      severity: 'high',
      file_path: 'src/preprocessing.py',
      line_number: 45,
      context_line: 'X_scaled = scaler.fit_transform(X)',
      description: 'Preprocessing is fit on the full feature matrix before the train/test split.',
      suggested_fix: 'Split data first, then fit the scaler only on the training data.',
    },
    {
      rule_id: 'RANDOM_STATE',
      rule_name: 'Missing Random Seed',
      severity: 'medium',
      file_path: 'src/model.py',
      line_number: 22,
      context_line: 'train_test_split(X, y, test_size=0.2)',
      description: 'The split does not define a random_state, making audit results hard to reproduce.',
      suggested_fix: 'Pass a fixed integer to random_state, for example random_state=42.',
    },
    {
      rule_id: 'SPLIT_STRATIFY',
      rule_name: 'Train/Test Split Issue',
      severity: 'low',
      file_path: 'src/data_loader.py',
      line_number: 78,
      context_line: 'train_test_split(X, y, shuffle=True)',
      description: 'The classifier split does not stratify the target labels.',
      suggested_fix: 'Use stratify=y for classification datasets with imbalanced labels.',
    },
    {
      rule_id: 'GLOBAL_SEED',
      rule_name: 'Missing Global Seed',
      severity: 'medium',
      file_path: 'src/train.py',
      line_number: 12,
      context_line: 'import numpy as np',
      description: 'No global seed initialization was detected before training.',
      suggested_fix: 'Initialize Python, NumPy, and framework seeds at the entry point.',
    },
  ],
  recommendations: {
    PREPROCESSING_LEAKAGE: {
      explanation:
        'Fit the scaler only on training data and transform the test data separately.',
      risk: 'The current flow leaks test-set statistics into training and inflates evaluation metrics.',
      suggested_fix: 'Split data first, then fit preprocessing only on X_train.',
      code_snippet: `X_train, X_test = train_test_split(X)
scaler.fit(X_train)
X_train = scaler.transform(X_train)
X_test = scaler.transform(X_test)`,
    },
  },
};

const CATEGORY_COLORS = ['#ff5d5d', '#7c5cff', '#ffae3d', '#22c785'];

const HERO_STEPS = [
  { label: 'Code Scanner', detail: 'Scan project files', icon: ScanSearch, tone: 'blue' },
  { label: 'AST Analysis', detail: 'Parse code structure', icon: Network, tone: 'purple' },
  { label: 'Rule Engine', detail: 'Detect issues', icon: Gauge, tone: 'orange' },
  { label: 'AI Recommendation', detail: 'Suggest fixes', icon: Bot, tone: 'green' },
  { label: 'Smart Report', detail: 'Generate insights', icon: FileCheck2, tone: 'pink' },
];

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut', staggerChildren: 0.08 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
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

function Dashboard() {
  const [scanPath, setScanPath] = useState('');
  const [scanResult, setScanResult] = useState(() =>
    normalizeScanResponse(PLACEHOLDER_SCAN_RESPONSE),
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const uploadRef = useRef(null);
  const inputRef = useRef(null);
  const analyticsRef = useRef(null);

  const handleScan = async () => {
    if (!scanPath.trim()) {
      setScanError('Enter a project path to scan.');
      inputRef.current?.focus();
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

  const focusScanner = () => {
    uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => inputRef.current?.focus(), 320);
  };

  const viewReports = () => {
    analyticsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const { score, filesScanned, counts, issues, recommendations } = scanResult;

  const categoryData = useMemo(
    () => [
      { name: 'Data Leakage', value: counts.leakage },
      { name: 'Evaluation Errors', value: counts.evaluation },
      { name: 'Reproducibility', value: counts.reproducibility },
      { name: 'Code Quality', value: counts.quality },
    ],
    [counts],
  );

  const totalCategoryIssues = categoryData.reduce((sum, item) => sum + item.value, 0);
  const riskLevel = counts.critical > 0 ? 'HIGH' : counts.major > 4 ? 'MEDIUM' : 'LOW';
  const healthLabel = score >= 85 ? 'Excellent' : score >= 70 ? 'Stable' : 'Needs review';
  const primaryRecommendation =
    recommendations.PREPROCESSING_LEAKAGE || Object.values(recommendations)[0] || {};

  return (
    <motion.div
      id="dashboard-top"
      className="dashboard-view"
      variants={pageVariants}
      initial="hidden"
      animate="show"
    >
      <motion.section className="dashboard-hero security-surface" variants={sectionVariants}>
        <div className="hero-copy">
          <span className="hero-kicker">
            <Sparkles size={14} aria-hidden="true" />
            AI-powered ML auditor
          </span>
          <h2>
            Audit Your ML Pipelines Before{' '}
            <span className="gradient-text">Production</span>
          </h2>
          <p>
            Detect data leakage, reproducibility issues, evaluation mistakes and ML anti-patterns
            using AI-powered static analysis.
          </p>

          <div className="hero-actions">
            <button type="button" className="btn btn-primary" onClick={focusScanner}>
              <UploadCloud size={18} aria-hidden="true" />
              Scan Project
            </button>
            <button type="button" className="btn btn-secondary" onClick={viewReports}>
              <FileText size={18} aria-hidden="true" />
              View Reports
            </button>
          </div>

          <div className="hero-trust-row" aria-label="Audit summary">
            <span className="avatar-stack" aria-hidden="true">
              <i>A</i>
              <i>M</i>
              <i>K</i>
              <i>P</i>
            </span>
            <span>Trusted by 1,200+ ML engineers</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Pipeline visualization">
          <div className="pipeline-visual-stack">
            {HERO_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.label}
                  className={`pipeline-node pipeline-node--${step.tone}`}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.08 }}
                >
                  <span className="pipeline-node-icon">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span>
                    <strong>{step.label}</strong>
                    <small>{step.detail}</small>
                  </span>
                  {index < HERO_STEPS.length - 1 && (
                    <ArrowDown className="pipeline-node-arrow" size={16} aria-hidden="true" />
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="shield-illustration" aria-hidden="true">
            <span className="shield-ring ring-one" />
            <span className="shield-ring ring-two" />
            <ShieldCheck size={118} strokeWidth={1.4} />
            <span className="shield-base" />
          </div>
        </div>
      </motion.section>

      {scanError && (
        <motion.div className="dashboard-alert dashboard-alert--error" role="alert" variants={sectionVariants}>
          <AlertTriangle size={16} aria-hidden="true" />
          {scanError}
        </motion.div>
      )}

      <motion.section className="metric-grid" aria-label="Project health metrics" variants={sectionVariants}>
        <MetricCard
          title="Pipeline Health"
          value={`${score}%`}
          description={healthLabel}
          variant="success"
          trend="+12%"
          progress={score}
          icon={<ShieldCheck size={24} />}
        />
        <MetricCard
          title="Issues Detected"
          value={counts.total}
          description="Across 8 categories"
          variant="danger"
          trend="+3"
          trendDirection="down"
          icon={<AlertTriangle size={24} />}
        />
        <MetricCard
          title="Files Scanned"
          value={filesScanned}
          description="Python, Jupyter, YAML"
          variant="blue"
          trend="+8"
          icon={<FolderOpen size={24} />}
        />
        <MetricCard
          title="Risk Level"
          value={riskLevel}
          description={counts.critical ? 'Critical issues found' : 'No critical risks'}
          variant={riskLevel === 'LOW' ? 'success' : 'warning'}
          trend={riskLevel === 'LOW' ? 'Stable' : 'Review'}
          icon={<Gauge size={24} />}
        />
      </motion.section>

      <motion.section
        id="analytics"
        ref={analyticsRef}
        className="analytics-grid"
        variants={sectionVariants}
      >
        <article className="analytics-card category-card">
          <div className="panel-heading">
            <span>
              <Activity size={15} aria-hidden="true" />
              Issues By Category
            </span>
          </div>

          <div className="donut-layout">
            <div className="donut-chart">
              <ResponsiveContainer width="100%" height={215} minWidth={160} minHeight={215}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    innerRadius="58%"
                    outerRadius="82%"
                    paddingAngle={2}
                    startAngle={90}
                    endAngle={-270}
                    isAnimationActive
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      background: '#090d1c',
                      border: '1px solid rgba(124, 92, 255, 0.35)',
                      borderRadius: 8,
                      color: '#f8fbff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <strong>{totalCategoryIssues || counts.total}</strong>
                <span>Total</span>
              </div>
            </div>

            <div className="category-legend">
              {categoryData.map((item, index) => (
                <div key={item.name} className="category-legend-row">
                  <span>
                    <i style={{ backgroundColor: CATEGORY_COLORS[index] }} />
                    {item.name}
                  </span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <button type="button" className="panel-link-btn" onClick={viewReports}>
            View all issues
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </article>

        <article id="recent-issues" className="analytics-card recent-card">
          <div className="panel-heading panel-heading--split">
            <span>
              <Sparkles size={15} aria-hidden="true" />
              Recent Issues
            </span>
            <button type="button" onClick={viewReports}>
              View all
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>
          <IssueAccordion issues={issues} recommendations={recommendations} compact maxItems={3} />
        </article>

        <article id="ai-recommendation" className="analytics-card recommendation-card">
          <div className="panel-heading">
            <span>
              <Sparkles size={15} aria-hidden="true" />
              AI Recommendation
            </span>
          </div>

          <div className="recommendation-panel">
            <span className="recommendation-label">Fix: Data Leakage</span>
            <p>{primaryRecommendation.explanation || 'Split data before fitting preprocessing transforms.'}</p>

            <div className="code-comparison">
              <div>
                <span className="code-label incorrect">Incorrect</span>
                <pre>{`X_scaled = scaler.fit_transform(X)`}</pre>
              </div>
              <div>
                <span className="code-label correct">Correct</span>
                <pre>{`X_train, X_test = train_test_split(X)
scaler.fit(X_train)
X_train = scaler.transform(X_train)
X_test = scaler.transform(X_test)`}</pre>
              </div>
            </div>
          </div>
        </article>
      </motion.section>

      <motion.section
        id="upload-project"
        ref={uploadRef}
        className="upload-card security-surface"
        variants={sectionVariants}
      >
        <div className="upload-icon" aria-hidden="true">
          <UploadCloud size={28} />
        </div>

        <div className="upload-copy">
          <h2>Drop your ML project here</h2>
          <p>Supports Python, Jupyter Notebook, CSV, JSON, YAML</p>
          <div className="scan-path-control">
            <label htmlFor="scan-path">Project path</label>
            <input
              id="scan-path"
              ref={inputRef}
              type="text"
              placeholder="e.g. ./sample_projects or /path/to/ml-project"
              value={scanPath}
              onChange={(event) => setScanPath(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleScan();
              }}
              disabled={isScanning}
            />
          </div>
        </div>

        <button type="button" className="btn btn-primary upload-btn" onClick={handleScan} disabled={isScanning}>
          {isScanning ? (
            <>
              <span className="scan-spinner" aria-hidden="true" />
              Scanning
            </>
          ) : (
            <>
              <Code2 size={18} aria-hidden="true" />
              Upload Project
            </>
          )}
        </button>
      </motion.section>

      <motion.section className="full-issues-panel security-surface" variants={sectionVariants}>
        <div className="panel-heading panel-heading--split">
          <span>
            <Database size={15} aria-hidden="true" />
            Audit Findings
          </span>
          <span className="issue-count-pill">
            <CheckCircle2 size={14} aria-hidden="true" />
            {issues.length} visible
          </span>
        </div>
        <IssueAccordion issues={issues} recommendations={recommendations} />
      </motion.section>
    </motion.div>
  );
}

export default Dashboard;
