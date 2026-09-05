import React from 'react';
import { 
  Database, 
  Split, 
  Cpu, 
  BarChart2, 
  AlertOctagon, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Flame
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const DataflowGraph = ({ issues = [], selectedFile = 'preprocessing_leakage.py' }) => {
  const hasPreprocessingLeakage = issues.some(i => i.rule_id === 'L001' || i.rule_id === 'L002' || i.rule_id === 'L003');
  const hasTargetLeakage = issues.some(i => i.rule_id === 'L004');
  const hasSeedIssue = issues.some(i => i.rule_id === 'R001' || i.rule_id === 'R002');
  const hasEvalIssue = issues.some(i => i.rule_id === 'E001' || i.rule_id === 'E003');

  const nodes = [
    {
      id: 'ingest',
      label: '1. Ingestion',
      subtext: 'pd.read_csv("dataset.csv")',
      icon: Database,
      status: 'clean',
      statusText: 'Data Ingested',
      color: 'border-slate-700 bg-slate-900 text-slate-200'
    },
    {
      id: 'preprocess',
      label: '2. Preprocessing & Scaling',
      subtext: 'scaler.fit_transform(X)',
      icon: hasPreprocessingLeakage ? Flame : Cpu,
      status: hasPreprocessingLeakage ? 'breach' : 'clean',
      statusText: hasPreprocessingLeakage ? 'CRITICAL LEAKAGE DETECTED' : 'Proper Pipeline Encapsulation',
      color: hasPreprocessingLeakage 
        ? 'border-rose-500/80 bg-rose-950/40 text-rose-300 ring-2 ring-rose-500/30' 
        : 'border-slate-700 bg-slate-900 text-slate-200'
    },
    {
      id: 'split',
      label: '3. Train/Test Partition',
      subtext: 'train_test_split(X, y)',
      icon: Split,
      status: hasSeedIssue ? 'warning' : 'clean',
      statusText: hasSeedIssue ? 'No Random State Seed' : 'Deterministic Seed Active',
      color: hasSeedIssue 
        ? 'border-amber-500/80 bg-amber-950/40 text-amber-300 ring-1 ring-amber-500/30' 
        : 'border-slate-700 bg-slate-900 text-slate-200'
    },
    {
      id: 'model',
      label: '4. Model Optimization',
      subtext: 'RandomForestClassifier.fit()',
      icon: Cpu,
      status: 'clean',
      statusText: 'Model Fit on Contaminated Space',
      color: 'border-slate-700 bg-slate-900 text-slate-200'
    },
    {
      id: 'eval',
      label: '5. Model Evaluation',
      subtext: 'model.score() / MSE',
      icon: hasEvalIssue ? AlertOctagon : BarChart2,
      status: hasEvalIssue ? 'warning' : 'clean',
      statusText: hasEvalIssue ? 'Inflated / Misused Metric' : 'Valid Evaluation Protocol',
      color: hasEvalIssue 
        ? 'border-amber-500/80 bg-amber-950/40 text-amber-300' 
        : 'border-slate-700 bg-slate-900 text-slate-200'
    }
  ];

  return (
    <Card className="bg-slate-950 border-slate-800">
      <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            <CardTitle className="text-sm font-semibold text-white">
              AST Dataflow DAG & Leakage Boundary Visualizer
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Dynamic Directed Acyclic Graph showing information propagation across split boundaries in {selectedFile}
          </CardDescription>
        </div>
        <Badge variant="outline" className="font-mono text-[11px] border-slate-700">
          Section 1.1 AST Topology
        </Badge>
      </CardHeader>

      <CardContent className="p-6">
        {/* Visual Pipeline Nodes */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 relative overflow-x-auto pb-2">
          {nodes.map((node, idx) => {
            const Icon = node.icon;
            const isBreach = node.status === 'breach';
            const isWarning = node.status === 'warning';

            return (
              <React.Fragment key={node.id}>
                {/* Node Box */}
                <div className={`w-full lg:w-48 p-3.5 rounded-xl border flex flex-col justify-between min-h-[130px] transition-all duration-200 shadow-sm ${node.color}`}>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold tracking-tight">
                      {node.label}
                    </span>
                    <Icon className={`w-4 h-4 ${
                      isBreach ? 'text-rose-400 animate-pulse' : isWarning ? 'text-amber-400' : 'text-slate-400'
                    }`} />
                  </div>

                  <code className="text-[10px] font-mono text-slate-300 bg-black/40 px-1.5 py-1 rounded truncate block mb-2">
                    {node.subtext}
                  </code>

                  <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between">
                    <span className={`text-[10px] font-semibold tracking-tight ${
                      isBreach ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {node.statusText}
                    </span>
                  </div>

                </div>

                {/* Arrow Connector */}
                {idx < nodes.length - 1 && (
                  <div className="hidden lg:flex items-center text-slate-600 px-1 shrink-0">
                    <ArrowRight className={`w-4 h-4 ${
                      hasPreprocessingLeakage && idx === 1 ? 'text-rose-500 animate-bounce' : 'text-slate-600'
                    }`} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Dataflow Narrative Diagnosis */}
        <div className="mt-6 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Boundary Analysis Diagnostic:
            </span>
            <span className="font-mono text-[10px] text-slate-400">Formal Verification: ASTM-L001</span>
          </div>

          <p className="text-slate-300 leading-relaxed font-sans">
            {hasPreprocessingLeakage ? (
              <span className="text-rose-300 font-medium">
                🚨 Critical Boundary Violation: Node 2 (<code className="font-mono bg-black/40 px-1 rounded">fit_transform</code>) executed prior to Node 3 (<code className="font-mono bg-black/40 px-1 rounded">train_test_split</code>). Test partition statistics leaked into model training weights, yielding overoptimistic evaluation metrics.
              </span>
            ) : (
              <span className="text-emerald-400">
                ✓ Split boundary is intact. Transformations are isolated to training partition folds.
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
