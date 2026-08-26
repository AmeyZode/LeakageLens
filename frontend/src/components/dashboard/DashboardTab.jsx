import React from 'react';
import { 
  ShieldAlert, 
  FileCode, 
  AlertOctagon, 
  AlertTriangle, 
  Activity, 
  Sparkles, 
  CheckCircle2,
  BookOpen,
  Layers,
  TrendingDown,
  Cpu,
  BarChart3,
  Network,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { LITERATURE_COMPARISON } from '../../utils/sampleData';
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

export const DashboardTab = ({ scanResult, onNavigateScanner, onNavigateAuditor, onNavigateSimulator }) => {
  const score = scanResult?.score ?? 100;
  const counts = scanResult?.counts || { critical: 0, major: 0, minor: 0 };
  const issues = scanResult?.issues || [];
  const filesScanned = scanResult?.files_scanned || 0;
  const mlInsights = scanResult?.ml_insights || { 
    ml_risk_score: 46.7, 
    confidence_label: "SUSPICIOUS_PIPELINE",
    overoptimism_delta: 24.8,
    estimated_production_accuracy: 62.4,
    apparent_training_accuracy: 87.2
  };
  const astMetrics = scanResult?.ast_metrics || {
    total_ast_nodes: 418,
    function_definitions: 7,
    variable_assignments: 32,
    pipeline_transformations: 12,
    cyclomatic_complexity: 14
  };

  // Severity Distribution Data
  const pieData = [
    { name: 'Critical Leakages', value: counts.critical, color: '#f43f5e' },
    { name: 'Major Violations', value: counts.major, color: '#f59e0b' },
    { name: 'Minor Quality', value: counts.minor, color: '#38bdf8' },
  ].filter(d => d.value > 0);

  // Group issues by category
  const categoryCounts = issues.reduce((acc, issue) => {
    const name = issue.rule_name || 'General';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(categoryCounts).map(([name, count]) => ({
    name: name.length > 14 ? name.substring(0, 14) + '...' : name,
    fullName: name,
    count,
  }));

  // Overoptimism trend data
  const trendData = [
    { name: 'Train Baseline', apparent: 89.4, trueScore: 61.2 },
    { name: 'Fold 1 (Leaked)', apparent: 88.6, trueScore: 62.0 },
    { name: 'Fold 2 (Leaked)', apparent: 87.2, trueScore: 63.4 },
    { name: 'Fold 3 (Leaked)', apparent: 88.0, trueScore: 61.8 },
    { name: 'Deployment', apparent: 87.2, trueScore: 62.4 },
  ];

  const getHealthBadge = (val) => {
    if (val >= 80) return <Badge variant="success" className="text-xs">High Pipeline Trust (Clean)</Badge>;
    if (val >= 50) return <Badge variant="major" className="text-xs">Moderate Vulnerability</Badge>;
    return <Badge variant="critical" className="text-xs">High Leakage Risk (Contaminated)</Badge>;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Health Scorecard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Scorecard (8 cols) */}
        <Card className="lg:col-span-8 bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 border-slate-800">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10">
                    AST Static Code Analysis Active
                  </Badge>
                  {getHealthBadge(score)}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  ML Pipeline Integrity & Reliability Scorecard
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
                  Automated inspection of data leakage, improper train/test partitions, lookahead bias, and reproducibility risks without executing unverified code.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Button onClick={onNavigateScanner} size="sm" className="gap-1.5 shadow-sm">
                    <Sparkles className="w-4 h-4" />
                    Upload & Inspect
                  </Button>
                  <Button onClick={onNavigateAuditor} variant="outline" size="sm" className="gap-1.5">
                    <FileCode className="w-4 h-4" />
                    Auditor & DAG ({issues.length})
                  </Button>
                </div>
              </div>

              {/* Score Gauge Circle */}
              <div className="flex flex-col items-center justify-center p-5 bg-slate-950/70 rounded-2xl border border-slate-800/80 min-w-[150px] shrink-0">
                <div className="relative flex items-center justify-center">
                  <span className={`text-4xl font-extrabold tracking-tight ${
                    score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-500'
                  }`}>
                    {score}
                  </span>
                  <span className="text-xs text-slate-500 font-mono self-end mb-1">/100</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">Health Index</span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">{issues.length} Flaws Flagged</span>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Overoptimism & ML Risk Predictor (4 cols) */}
        <Card className="lg:col-span-4 bg-slate-900/80 border-slate-800">
          <CardHeader className="pb-2 border-b border-slate-800/60">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-200">ML Overoptimism Estimator</CardTitle>
              <Activity className="w-4 h-4 text-indigo-400" />
            </div>
            <CardDescription className="text-xs">Predicted drop upon real-world deployment</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5">
            
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold text-rose-400 font-mono">+{mlInsights.overoptimism_delta || 24.8}%</span>
                <span className="text-[10px] text-slate-400 block">Estimated Inflation Gap ($\Delta$)</span>
              </div>
              <Badge variant={mlInsights.ml_risk_score >= 50 ? "critical" : "success"}>
                {mlInsights.confidence_label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Apparent Train Acc</span>
                <span className="font-mono font-bold text-indigo-300">{mlInsights.apparent_training_accuracy || 87.2}%</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">True Production Acc</span>
                <span className="font-mono font-bold text-rose-400">{mlInsights.estimated_production_accuracy || 62.4}%</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-mono text-slate-400">Dominant Contamination Drivers:</span>
              <div className="space-y-1">
                {(mlInsights.feature_importances || []).slice(0, 3).map((feat, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-slate-300">
                    <span className="truncate max-w-[160px] text-[11px]">{feat.feature}</span>
                    <span className="font-mono text-indigo-400 text-[11px]">{feat.importance}%</span>
                  </div>
                ))}
              </div>
            </div>

          </CardContent>
        </Card>

      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="bg-slate-900/60 border-slate-800/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Files Inspected</p>
              <h3 className="text-2xl font-bold text-white mt-1">{filesScanned}</h3>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">.py & .ipynb formats</p>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl text-indigo-400">
              <FileCode className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Critical Leakages</p>
              <h3 className="text-2xl font-bold text-rose-400 mt-1">{counts.critical}</h3>
              <p className="text-[11px] text-rose-400/80 mt-1 font-mono">Pre-split fit / target leak</p>
            </div>
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/20">
              <AlertOctagon className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Major Violations</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">{counts.major}</h3>
              <p className="text-[11px] text-amber-400/80 mt-1 font-mono">Seed & metric issues</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">AST Nodes Checked</p>
              <h3 className="text-2xl font-bold text-indigo-400 mt-1">{astMetrics.total_ast_nodes}</h3>
              <p className="text-[11px] text-indigo-300/80 mt-1 font-mono">{astMetrics.cyclomatic_complexity} Cyclomatic score</p>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
              <Cpu className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Severity Distribution Donut */}
        <Card className="lg:col-span-4 bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm text-slate-200">Severity Distribution</CardTitle>
            <CardDescription className="text-xs">Detected pipeline flaws categorized by impact level</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="h-56 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-slate-500 text-sm">
                No issues detected. Clean pipeline!
              </div>
            )}
            
            <div className="flex justify-center gap-4 mt-2">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-300 text-[11px] font-medium">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Issue Category Breakdown Bar */}
        <Card className="lg:col-span-8 bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm text-slate-200">Flaws by Detection Rule Registry</CardTitle>
            <CardDescription className="text-xs">Static analysis AST rules evaluated across scripts</CardDescription>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                    <XAxis type="number" stroke="#64748b" fontSize={11} />
                    <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={130} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                      formatter={(val, name, props) => [val, props.payload.fullName]}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-slate-500 text-sm">
                No categorical issues available.
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Research Paper Literature Comparison Table */}
      <Card className="bg-slate-900/80 border-slate-800 overflow-hidden">
        <CardHeader className="bg-slate-950/60 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <CardTitle className="text-base text-white">Literature Review & Benchmark Comparison</CardTitle>
              </div>
              <CardDescription className="text-xs mt-1">
                Comparative analysis of LeakageLens against existing state-of-the-art tools (Pillai College of Engineering paper Section II)
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-indigo-500/30 text-indigo-300">
              Section II Benchmark
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Tool & System</th>
                <th className="py-3 px-4">Analysis Technique</th>
                <th className="py-3 px-4">File Support</th>
                <th className="py-3 px-4">Automated Fixes</th>
                <th className="py-3 px-4">Execution Overhead</th>
                <th className="py-3 px-4">Scope</th>
                <th className="py-3 px-4">Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {LITERATURE_COMPARISON.map((row, idx) => (
                <tr 
                  key={idx} 
                  className={idx === 0 ? 'bg-indigo-950/30 font-medium text-indigo-200 border-l-2 border-l-indigo-500' : 'hover:bg-slate-800/40'}
                >
                  <td className="py-3 px-4 font-semibold text-white flex items-center gap-1.5">
                    {idx === 0 && <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
                    {row.tool}
                  </td>
                  <td className="py-3 px-4">{row.technique}</td>
                  <td className="py-3 px-4 font-mono text-[11px]">{row.pySupport}</td>
                  <td className="py-3 px-4">{row.autoFix}</td>
                  <td className="py-3 px-4">{row.overhead}</td>
                  <td className="py-3 px-4">{row.multiFile}</td>
                  <td className="py-3 px-4 font-mono text-[10px] text-indigo-300">{row.governance || "None"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

    </div>
  );
};
