import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
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
      rule_name: 'Data Leakage',
      severity: 'high',
      file_path: 'preprocessing.py',
      line_number: 45,
      context_line: 'X_scaled = scaler.fit_transform(X)',
      description: 'Scaler fitted before train-test split.',
      suggested_fix: 'Fit preprocessing only on training data.',
    },
    {
      rule_id: 'RANDOM_STATE',
      rule_name: 'Missing Random Seed',
      severity: 'medium',
      file_path: 'model.py',
      line_number: 22,
      context_line: 'train_test_split(X, y, test_size=0.2)',
      description: 'The split does not define a random_state, making audit results hard to reproduce.',
      suggested_fix: 'Pass a fixed integer to random_state, for example random_state=42.',
    },
    {
      rule_id: 'EVALUATION_WARNING',
      rule_name: 'Evaluation Warning',
      severity: 'low',
      file_path: 'evaluation.py',
      line_number: 78,
      context_line: 'model.evaluate(X_train, y_train)',
      description: 'Model evaluation performed on training data only.',
      suggested_fix: 'Evaluate model performance only on validation/test set.',
    },
  ],
  recommendations: {
    PREPROCESSING_LEAKAGE: {
      explanation: 'Move preprocessing after dataset split.',
      risk: 'The current flow leaks test-set statistics into training and inflates evaluation metrics.',
      suggested_fix: 'Move preprocessing after dataset split.',
      code_snippet: `scaler.fit(X_train)\nscaler.transform(X_test)`,
    },
  },
};

const CATEGORY_COLORS = ['#ff5d5d', '#7c5cff', '#ffae3d', '#22c785'];

const HERO_VISUAL_STEPS = [
  { label: 'Pipeline Scanner', detail: 'Scan project files', icon: ScanSearch, tone: 'blue' },
  { label: 'AST Analysis', detail: 'Parse structure & nodes', icon: Code2, tone: 'purple' },
  { label: 'Risk Detection', detail: 'Detect leakage patterns', icon: AlertTriangle, tone: 'orange' },
  { label: 'AI Fix Engine', detail: 'Generate corrections', icon: Bot, tone: 'green' },
  { label: 'Audit Report', detail: 'Verify health & export', icon: FileCheck2, tone: 'pink' }
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

function PipelineVisualizer() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % HERO_VISUAL_STEPS.length);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pipeline-visualizer">
      {HERO_VISUAL_STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isActive = idx === activeStep;
        return (
          <div key={step.label} className="pipeline-visualizer-row">
            <motion.div
              className={`pipeline-visual-node node-${step.tone} ${isActive ? 'active' : ''}`}
              animate={{
                scale: isActive ? 1.04 : 1,
                borderColor: isActive ? 'var(--purple)' : 'var(--border)',
                boxShadow: isActive ? 'var(--glow-purple)' : 'none',
                backgroundColor: isActive ? 'var(--panel-strong)' : 'rgba(14, 22, 44, 0.4)'
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="node-icon">
                <Icon size={18} />
              </div>
              <div className="node-info">
                <strong>{step.label}</strong>
                <small>{step.detail}</small>
              </div>
            </motion.div>
            {idx < HERO_VISUAL_STEPS.length - 1 && (
              <div className="pipeline-visual-arrow">
                <ArrowDown size={14} className={isActive ? 'glowing' : ''} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

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

function Dashboard({ userToken, onNavigate, currentPath }) {
  const [scanPath, setScanPath] = useState('');
  const [scanResult, setScanResult] = useState(() =>
    normalizeScanResponse(PLACEHOLDER_SCAN_RESPONSE),
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const { theme } = useTheme();

  const uploadRef = useRef(null);
  const inputRef = useRef(null);
  const analyticsRef = useRef(null);

  // Route-based scrolling handler
  useEffect(() => {
    if (currentPath === '/scanner') {
      uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => inputRef.current?.focus(), 320);
    } else if (currentPath === '/reports') {
      analyticsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (currentPath === '/history' || currentPath === '/rules') {
      document.getElementById('recent-issues')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (currentPath === '/ai-recommendations') {
      document.getElementById('ai-recommendation')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (currentPath === '/dashboard') {
      document.getElementById('dashboard-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPath]);

  // Check pending scans on load
  useEffect(() => {
    const pending = localStorage.getItem('leakagelens_pending_scan');
    if (pending) {
      setScanPath(pending);
      localStorage.removeItem('leakagelens_pending_scan');
      window.setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, []);

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

  const { score, filesScanned, counts, issues, recommendations } = scanResult;

  const categoryData = useMemo(
    () => [
      { name: 'Data Leakage', value: counts.leakage || 5 },
      { name: 'Evaluation Errors', value: counts.evaluation || 3 },
      { name: 'Reproducibility', value: counts.reproducibility || 2 },
      { name: 'Code Quality', value: counts.quality || 2 },
    ],
    [counts],
  );

  const totalCategoryIssues = categoryData.reduce((sum, item) => sum + item.value, 0);
  const riskLevel = counts.critical > 0 ? 'HIGH' : counts.major > 4 ? 'MEDIUM' : 'LOW';
  const healthLabel = score >= 85 ? 'Excellent' : score >= 70 ? 'Stable' : 'Needs review';
  const primaryRecommendation =
    recommendations.PREPROCESSING_LEAKAGE || Object.values(recommendations)[0] || {};

  const tooltipStyle = useMemo(() => {
    return theme === 'light'
      ? {
          background: '#ffffff',
          border: '1px solid rgba(124, 92, 255, 0.25)',
          borderRadius: 8,
          color: '#0f172a',
        }
      : {
          background: '#090d1c',
          border: '1px solid rgba(124, 92, 255, 0.35)',
          borderRadius: 8,
          color: '#f8fbff',
        };
  }, [theme]);

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
            AI Powered ML Auditor
          </span>
          <h2>
            Ship reliable ML pipelines with{' '}
            <span className="gradient-text">security-grade audits</span>
          </h2>
          <p>
            Analyze ML code, detect hidden leakage risks, validate experiments and receive AI-powered fixes.
          </p>

          <div className="hero-actions">
            <button type="button" className="btn btn-primary" onClick={() => onNavigate('/scanner')}>
              <UploadCloud size={18} aria-hidden="true" />
              Start Audit
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => onNavigate('/reports')}>
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
          <PipelineVisualizer />
        </div>
      </motion.section>

      {scanError && (
        <motion.div className="dashboard-alert dashboard-alert--error" role="alert" variants={sectionVariants}>
          <AlertTriangle size={16} aria-hidden="true" />
          {scanError}
        </motion.div>
      )}

      {/* METRICS ROW */}
      <motion.section className="metric-grid" aria-label="Project health metrics" variants={sectionVariants}>
        <MetricCard
          title="Pipeline Health"
          value="92%"
          description={healthLabel}
          variant="success"
          trend="+12%"
          progress={92}
          icon={<ShieldCheck size={24} />}
        />
        <MetricCard
          title="Issues Found"
          value="12"
          description="Across 8 categories"
          variant="danger"
          trend="+3"
          trendDirection="down"
          icon={<AlertTriangle size={24} />}
        />
        <MetricCard
          title="Files Scanned"
          value="48"
          description="Python, Jupyter, YAML"
          variant="blue"
          trend="+8"
          icon={<FolderOpen size={24} />}
        />
        <MetricCard
          title="Risk Level"
          value="LOW"
          description="No critical risks"
          variant="success"
          trend="Stable"
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
                  <Tooltip cursor={false} contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <strong>{totalCategoryIssues}</strong>
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

          <button type="button" className="panel-link-btn" onClick={() => onNavigate('/reports')}>
            View all issues
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </article>

        <article id="recent-issues" className="analytics-card recent-card">
          <div className="panel-heading panel-heading--split">
            <span>
              <Sparkles size={15} aria-hidden="true" />
              Recent Findings
            </span>
            <button type="button" onClick={() => onNavigate('/history')}>
              View all
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>
          <IssueAccordion issues={issues} recommendations={recommendations} compact maxItems={3} />
        </article>

        {/* AI RECOMMENDATION PANEL */}
        <article id="ai-recommendation" className="analytics-card recommendation-card">
          <div className="panel-heading">
            <span>
              <Bot size={15} aria-hidden="true" />
              AI Recommendation
            </span>
          </div>

          <div className="recommendation-panel">
            <div className="rec-info-item">
              <span className="rec-info-label">Detected:</span>
              <span className="rec-info-val text-red">Data Leakage</span>
            </div>
            
            <div className="rec-info-item">
              <span className="rec-info-label">Suggested Fix:</span>
              <span className="rec-info-val text-green">Move preprocessing after dataset split.</span>
            </div>

            <div className="code-comparison">
              <div>
                <span className="code-label incorrect">WRONG</span>
                <pre>{`scaler.fit_transform(X)`}</pre>
              </div>
              <div>
                <span className="code-label correct">CORRECT</span>
                <pre>{`scaler.fit(X_train)\nscaler.transform(X_test)`}</pre>
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
