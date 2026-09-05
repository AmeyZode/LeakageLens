import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck,
  FileCode, 
  AlertOctagon, 
  AlertTriangle, 
  Activity, 
  Sparkles, 
  CheckCircle2,
  Layers, 
  TrendingDown, 
  Cpu, 
  BarChart3, 
  ArrowUpRight,
  ArrowRight,
  Filter,
  Zap,
  Lock,
  Code2,
  RefreshCw,
  Gauge
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart, 
  Area 
} from 'recharts';

export const DashboardTab = ({ scanResult, onNavigateScanner, onNavigateAuditor }) => {
  const [filterSeverity, setFilterSeverity] = useState('all');

  const score = scanResult?.score ?? 100;
  const counts = scanResult?.counts || { critical: 0, major: 0, minor: 0 };
  const issues = scanResult?.issues || [];
  const filesScanned = scanResult?.files_scanned || (scanResult?.filename ? 1 : 0);
  const mlInsights = scanResult?.ml_insights || { 
    ml_risk_score: 46.7, 
    confidence_label: "SUSPICIOUS_PIPELINE",
    overoptimism_delta: 24.8,
    estimated_production_accuracy: 62.4,
    apparent_training_accuracy: 87.2,
    feature_importances: [
      { feature: 'scaler.fit_transform(full)', importance: 42.5 },
      { feature: 'missing_random_state', importance: 28.0 },
      { feature: 'target_proxy_imputation', importance: 19.5 }
    ]
  };
  const astMetrics = scanResult?.ast_metrics || {
    total_ast_nodes: 418,
    function_definitions: 7,
    variable_assignments: 32,
    pipeline_transformations: 12,
    cyclomatic_complexity: 14
  };

  // Severity Distribution Data for Pie Chart
  const pieData = [
    { name: 'Critical', value: counts.critical, color: '#f43f5e' },
    { name: 'Major', value: counts.major, color: '#f59e0b' },
    { name: 'Minor', value: counts.minor, color: '#38bdf8' },
  ].filter(d => d.value > 0);

  // Group issues by category for Bar Chart
  const categoryCounts = issues.reduce((acc, issue) => {
    const name = issue.rule_name || 'General Rule';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(categoryCounts).map(([name, count]) => ({
    name: name.length > 18 ? name.substring(0, 18) + '...' : name,
    fullName: name,
    count,
  }));

  // Generalization Gap / Overoptimism trajectory data
  const trendData = [
    { stage: 'Train Split', apparent: 94.2, truePerf: 64.0 },
    { stage: 'CV Fold 1', apparent: 91.8, truePerf: 63.5 },
    { stage: 'CV Fold 2', apparent: 89.4, truePerf: 62.8 },
    { stage: 'Hold-out Test', apparent: 87.2, truePerf: 62.4 },
    { stage: 'Production', apparent: 87.2, truePerf: 62.4 },
  ];

  // Filtered issues for the prioritized findings feed
  const filteredIssues = issues.filter(i => {
    if (filterSeverity === 'all') return true;
    return i.severity === filterSeverity;
  });

  // Dynamic Grade Calculation
  const getGrade = (val) => {
    if (val >= 90) return { grade: 'A+', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Production Ready' };
    if (val >= 75) return { grade: 'B', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30', label: 'Minor Advisory' };
    if (val >= 50) return { grade: 'C', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Moderate Leakage Risk' };
    return { grade: 'F', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', label: 'Severe Contamination' };
  };

  const gradeInfo = getGrade(score);

  // Best practice compliance check
  const complianceRules = [
    {
      id: 'partitioning',
      title: 'Data Partitioning Boundary',
      desc: 'No transformations fitted globally prior to train/test split',
      passed: !issues.some(i => i.rule_id === 'L001' || i.rule_id === 'L002'),
      category: 'Data Separation'
    },
    {
      id: 'target',
      title: 'Target Feature Decoupling',
      desc: 'Ground-truth target proxies isolated from feature matrices',
      passed: !issues.some(i => i.rule_id === 'L004'),
      category: 'Target Integrity'
    },
    {
      id: 'temporal',
      title: 'Temporal Lookahead Isolation',
      desc: 'Time-series sequences preserve chronological ordering',
      passed: !issues.some(i => i.rule_id === 'L003' || i.rule_id === 'L005'),
      category: 'Sequence Safety'
    },
    {
      id: 'stochastic',
      title: 'Stochastic Determinism',
      desc: 'Explicit random seeds configured across all model splits',
      passed: !issues.some(i => i.rule_id === 'R001' || i.rule_id === 'R002'),
      category: 'Reproducibility'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HERO: Pipeline Posture & Integrity Scorecard */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/95 to-indigo-950/40 p-6 shadow-2xl backdrop-blur-xl">
        {/* Subtle Ambient Radial Glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-indigo-500/40 bg-indigo-500/10 text-indigo-300 font-mono flex items-center gap-1.5 py-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Static AST Audit Active
              </Badge>
              <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${gradeInfo.border} ${gradeInfo.bg} ${gradeInfo.color} flex items-center gap-1.5`}>
                <span>Grade {gradeInfo.grade}</span>
                <span>•</span>
                <span>{gradeInfo.label}</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              ML Pipeline Integrity & Reliability Dashboard
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Static dataflow verification protecting your ML pipelines against train/test contamination, data snooping, target leakage, and overoptimistic evaluation metrics.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button onClick={onNavigateScanner} size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 font-medium cursor-pointer">
                <Sparkles className="w-4 h-4" />
                Upload & Inspect Pipeline
              </Button>
              <Button onClick={onNavigateAuditor} variant="outline" size="sm" className="gap-2 border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 cursor-pointer">
                <Code2 className="w-4 h-4 text-indigo-400" />
                Open Code Auditor & DAG ({issues.length} Findings)
              </Button>
            </div>
          </div>

          {/* Glowing Circular Health Index Meter */}
          <div className="flex items-center gap-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 shadow-inner shrink-0 self-center lg:self-auto">
            <div className="relative flex items-center justify-center">
              {/* Circular SVG Gauge */}
              <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className={score >= 80 ? 'stroke-emerald-400' : score >= 50 ? 'stroke-amber-400' : 'stroke-rose-500'}
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`text-3xl font-black tracking-tight font-mono ${gradeInfo.color}`}>
                  {score}
                </span>
                <span className="text-[10px] text-slate-400 font-mono -mt-1">/ 100</span>
              </div>
            </div>

            <div className="space-y-1.5 pr-2">
              <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider">Pipeline Health</span>
              <div className="text-[11px] text-slate-400 font-mono">
                <span className="text-rose-400 font-semibold">{counts.critical}</span> Critical • <span className="text-amber-400 font-semibold">{counts.major}</span> Major
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {issues.length === 0 ? '✓ Zero vulnerabilities' : `${issues.length} flaws require remediation`}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. STAT METRIC CARDS (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Files Inspected */}
        <Card className="bg-slate-900/70 border-slate-800/80 hover:border-indigo-500/40 transition-all group">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-400">Files Inspected</p>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">{filesScanned}</h3>
              <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                <span>Python & Jupyter</span>
              </p>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 group-hover:scale-105 transition-transform">
              <FileCode className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Critical Leaks */}
        <Card className="bg-slate-900/70 border-slate-800/80 hover:border-rose-500/40 transition-all group">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-400">Critical Data Leaks</p>
              <h3 className="text-2xl font-extrabold text-rose-400 tracking-tight">{counts.critical}</h3>
              <p className="text-[11px] text-rose-400/80 font-mono">
                Pre-split fit & target proxies
              </p>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20 group-hover:scale-105 transition-transform">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Major Violations */}
        <Card className="bg-slate-900/70 border-slate-800/80 hover:border-amber-500/40 transition-all group">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-400">Major Pipeline Flaws</p>
              <h3 className="text-2xl font-extrabold text-amber-400 tracking-tight">{counts.major}</h3>
              <p className="text-[11px] text-amber-400/80 font-mono">
                Temporal & seed violations
              </p>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: AST Nodes */}
        <Card className="bg-slate-900/70 border-slate-800/80 hover:border-sky-500/40 transition-all group">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-400">AST Nodes Inspected</p>
              <h3 className="text-2xl font-extrabold text-sky-400 tracking-tight">{astMetrics.total_ast_nodes}</h3>
              <p className="text-[11px] text-sky-400/80 font-mono">
                {astMetrics.cyclomatic_complexity} Cyclomatic Score
              </p>
            </div>
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* 3. ML OVEROPTIMISM & GENERALIZATION GAP INTELLIGENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Generalization Gap Analyzer (7 cols) */}
        <Card className="lg:col-span-7 bg-slate-900/80 border-slate-800 flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <CardTitle className="text-sm text-slate-200">ML Overoptimism & Generalization Gap Estimator</CardTitle>
              </div>
              <Badge variant={mlInsights.ml_risk_score >= 50 ? "critical" : "success"} className="text-[10px]">
                {mlInsights.confidence_label}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Quantifies artificial metric inflation caused by data leakage across validation boundaries
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-5">
            {/* Accuracy Comparison Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Apparent Validation Score</span>
                  <span className="font-mono font-bold text-indigo-300 text-sm">
                    {mlInsights.apparent_training_accuracy}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full" 
                    style={{ width: `${Math.min(100, mlInsights.apparent_training_accuracy)}%` }} 
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">Reported in training/validation</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">True Production Generalization</span>
                  <span className="font-mono font-bold text-rose-400 text-sm">
                    {mlInsights.estimated_production_accuracy}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full" 
                    style={{ width: `${Math.min(100, mlInsights.estimated_production_accuracy)}%` }} 
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">Expected upon live deployment</span>
              </div>
            </div>

            {/* Gap Highlight Callout */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-rose-950/30 via-slate-950 to-indigo-950/30 border border-rose-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 font-mono text-xs font-bold shrink-0">
                  +{mlInsights.overoptimism_delta}% Δ
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Estimated Overoptimism Gap</span>
                  <span className="text-[11px] text-slate-400">
                    Model will experience an estimated <strong className="text-rose-300">~{mlInsights.overoptimism_delta}% performance degradation</strong> in unlabelled production.
                  </span>
                </div>
              </div>
            </div>

            {/* Dominant Contamination Drivers */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-medium text-slate-300 block">Key Contamination Vectors Identified by ML Classifier:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(mlInsights.feature_importances || []).slice(0, 3).map((feat, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between text-xs">
                    <span className="text-slate-400 text-[11px] truncate font-mono">{feat.feature}</span>
                    <span className="text-indigo-400 font-mono font-bold text-xs mt-1">
                      {feat.importance}% weight
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Right: Generalization Degradation Curve (5 cols) */}
        <Card className="lg:col-span-5 bg-slate-900/80 border-slate-800">
          <CardHeader className="pb-2 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-200">Validation Degradation Trajectory</CardTitle>
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
            <CardDescription className="text-xs">
              Apparent vs. True performance across partition stages
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="apparentColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="trueColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="stage" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[40, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="apparent" name="Apparent Acc %" stroke="#6366f1" fillOpacity={1} fill="url(#apparentColor)" strokeWidth={2} />
                  <Area type="monotone" dataKey="truePerf" name="True Acc %" stroke="#f43f5e" fillOpacity={1} fill="url(#trueColor)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-slate-300">Apparent Score</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-300">True Production Acc</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* 4. VISUAL ANALYTICS HUB (Severity Donut & Rule Distribution Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Severity Distribution Donut (4 cols) */}
        <Card className="lg:col-span-4 bg-slate-900/80 border-slate-800">
          <CardHeader className="pb-2 border-b border-slate-800">
            <CardTitle className="text-sm text-slate-200">Severity Distribution</CardTitle>
            <CardDescription className="text-xs">Detected pipeline flaws categorized by impact level</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {pieData.length > 0 ? (
              <div className="h-52 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={78}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-52 flex flex-col items-center justify-center text-slate-500 text-xs space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400/60" />
                <span>Zero flaws detected. Perfect pipeline!</span>
              </div>
            )}
            
            <div className="flex flex-wrap justify-center gap-3 mt-1 pt-2 border-t border-slate-800">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-300 text-[11px] font-medium">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Issue Category Breakdown Bar (8 cols) */}
        <Card className="lg:col-span-8 bg-slate-900/80 border-slate-800">
          <CardHeader className="pb-2 border-b border-slate-800">
            <CardTitle className="text-sm text-slate-200">Flaws by AST Detection Rule Registry</CardTitle>
            <CardDescription className="text-xs">Frequency of rule violations flagged across inspected scripts</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {barData.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                    <XAxis type="number" stroke="#64748b" fontSize={10} />
                    <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={140} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                      formatter={(val, name, props) => [val, props.payload.fullName]}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-slate-500 text-xs space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400/60" />
                <span>All static rule checks passed cleanly.</span>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* 5. PRIORITIZED VULNERABILITY FINDINGS FEED */}
      <Card className="bg-slate-900/80 border-slate-800 overflow-hidden">
        <CardHeader className="bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-indigo-400" />
              <CardTitle className="text-sm text-white">Prioritized Vulnerability Findings Feed</CardTitle>
            </div>
            <CardDescription className="text-xs mt-0.5">
              Live actionable issues detected in the current code analysis
            </CardDescription>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                filterSeverity === 'all' 
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm' 
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              All ({issues.length})
            </button>
            <button
              onClick={() => setFilterSeverity('critical')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                filterSeverity === 'critical' 
                  ? 'bg-rose-600 text-white font-semibold shadow-sm' 
                  : 'bg-slate-900 text-rose-400 hover:bg-rose-950/40'
              }`}
            >
              Critical ({counts.critical})
            </button>
            <button
              onClick={() => setFilterSeverity('major')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                filterSeverity === 'major' 
                  ? 'bg-amber-600 text-white font-semibold shadow-sm' 
                  : 'bg-slate-900 text-amber-400 hover:bg-amber-950/40'
              }`}
            >
              Major ({counts.major})
            </button>
            <button
              onClick={() => setFilterSeverity('minor')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                filterSeverity === 'minor' 
                  ? 'bg-sky-600 text-white font-semibold shadow-sm' 
                  : 'bg-slate-900 text-sky-400 hover:bg-sky-950/40'
              }`}
            >
              Minor ({counts.minor})
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-slate-800/80">
          {filteredIssues.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-80" />
              <p className="text-sm font-semibold text-slate-200">No issues found in this category</p>
              <p className="text-xs text-slate-500">Pipeline components satisfy all safety constraints.</p>
            </div>
          ) : (
            filteredIssues.slice(0, 5).map((issue, idx) => (
              <div 
                key={idx} 
                className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={issue.severity === 'critical' ? 'critical' : issue.severity === 'major' ? 'major' : 'minor'}>
                      {issue.severity.toUpperCase()}
                    </Badge>
                    <span className="text-xs font-semibold text-white truncate">
                      [{issue.rule_id}] {issue.rule_name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {issue.file_path} : Line {issue.line_number}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-1 leading-relaxed">
                    {issue.description}
                  </p>

                  {issue.context_line && (
                    <div className="font-mono text-[11px] bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 text-rose-300 truncate inline-block max-w-full">
                      <code>{issue.context_line}</code>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={onNavigateAuditor} 
                  variant="outline" 
                  size="sm" 
                  className="shrink-0 gap-1 text-xs border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/40 self-start sm:self-center cursor-pointer"
                >
                  <span>Remediate in Auditor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 6. PIPELINE SECURITY & COMPLIANCE CHECKLIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {complianceRules.map((rule) => (
          <Card 
            key={rule.id} 
            className={`bg-slate-900/70 border transition-all ${
              rule.passed 
                ? 'border-emerald-500/30 hover:border-emerald-500/60' 
                : 'border-rose-500/30 hover:border-rose-500/60'
            }`}
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  {rule.category}
                </span>
                {rule.passed ? (
                  <Badge variant="success" className="text-[10px] gap-1 py-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Passed
                  </Badge>
                ) : (
                  <Badge variant="critical" className="text-[10px] gap-1 py-0.5">
                    <AlertTriangle className="w-3 h-3" />
                    Failed
                  </Badge>
                )}
              </div>

              <h4 className="text-xs font-bold text-slate-200">
                {rule.title}
              </h4>

              <p className="text-[11px] text-slate-400 leading-snug">
                {rule.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
};
