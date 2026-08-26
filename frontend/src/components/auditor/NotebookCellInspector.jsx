import React from 'react';
import { 
  FileCode2, 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Workflow, 
  HelpCircle 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const NotebookCellInspector = () => {
  const notebookCells = [
    {
      cellIndex: 1,
      execCount: 1,
      type: "code",
      hasLeakage: true,
      ruleId: "L001",
      severity: "critical",
      title: "Cell 1: Ingestion & Global MinMaxScaling",
      code: `import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC

df = pd.read_csv('medical_data.csv')
# FLAW: Preprocessing full dataset before splitting cell!
scaler = MinMaxScaler()
df_scaled = scaler.fit_transform(df.drop(columns=['diagnosis']))`,
      diagnostic: "Scaler fit on full medical_data dataframe across entire observation index. Contaminates test statistics."
    },
    {
      cellIndex: 2,
      execCount: 2,
      type: "code",
      hasLeakage: false,
      severity: "major",
      title: "Cell 2: Split & Model Training",
      code: `X_train, X_test, y_train, y_test = train_test_split(df_scaled, df['diagnosis'])
model = SVC()
model.fit(X_train, y_train)
print('Notebook Model Accuracy:', model.score(X_train, y_train))`,
      diagnostic: "Evaluates score on X_train (Evaluation on Training Data [E001]) and missing random_state seed [R001]."
    }
  ];

  return (
    <Card className="bg-slate-950 border-slate-800">
      <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-indigo-400" />
            <CardTitle className="text-sm font-semibold text-white">
              Jupyter Notebook Cell Dependency & State Inspector
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            AST cell-level execution sequence & cross-cell shared variable mutation analysis (LeakageDetector 2.0 extension)
          </CardDescription>
        </div>
        <Badge variant="outline" className="font-mono text-[11px] border-slate-700">
          .ipynb AST Parser
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {notebookCells.map((cell) => (
          <div 
            key={cell.cellIndex}
            className={`rounded-xl border p-4 transition-all duration-200 ${
              cell.hasLeakage 
                ? 'border-rose-800/60 bg-rose-950/20' 
                : 'border-slate-800 bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-indigo-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  In [{cell.execCount}]
                </span>
                <span className="text-xs font-semibold text-white">{cell.title}</span>
              </div>
              <Badge variant={cell.hasLeakage ? 'critical' : 'major'}>
                {cell.hasLeakage ? 'Critical Cell Leak' : 'Validation Warning'}
              </Badge>
            </div>

            <pre className="p-3 rounded-lg bg-black/60 border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto leading-relaxed my-2">
              {cell.code}
            </pre>

            <div className="flex items-start gap-2 pt-2 border-t border-slate-800/60 text-xs">
              <Flame className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${cell.hasLeakage ? 'text-rose-400' : 'text-amber-400'}`} />
              <span className={cell.hasLeakage ? 'text-rose-300' : 'text-slate-400'}>
                <strong>Diagnostic:</strong> {cell.diagnostic}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
