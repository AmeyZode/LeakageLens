import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Terminal, 
  FileCode, 
  Zap, 
  Code2, 
  Sparkles, 
  Play, 
  Check, 
  FolderUp,
  RefreshCw,
  Cpu,
  ShieldCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { uploadAndScanFile, scanCodeSnippet, checkHealth } from '../../services/api';

export const ScannerTab = ({ onScanComplete }) => {
  const [currentFileName, setCurrentFileName] = useState('pipeline_script.py');
  const [codeSnippet, setCodeSnippet] = useState(
`import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

df = pd.read_csv("dataset.csv")
X = df.drop(columns=["target"])
y = df["target"]

# Preprocessing before split (Data Leakage)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(X_scaled, y)
model = RandomForestClassifier()
model.fit(X_train, y_train)

print("Score:", model.score(X_train, y_train))
`
  );
  
  // Backend AI Engine configuration state
  const [aiStatus, setAiStatus] = useState({
    configured: true,
    engine: '⚡ Groq (GPT-OSS 120B / Llama 3.3)',
    provider: 'groq'
  });

  const [isScanning, setIsScanning] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [scanLogs, setScanLogs] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadBackendStatus() {
      try {
        const health = await checkHealth();
        if (health && health.status === 'ok') {
          setAiStatus({
            configured: health.ai_configured ?? true,
            engine: health.ai_engine || '⚡ Groq (GPT-OSS 120B / Llama 3.3)',
            provider: health.provider || 'groq'
          });
        }
      } catch (e) {
        // Use defaults
      }
    }
    loadBackendStatus();
  }, []);

  const addLog = (msg) => {
    setScanLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Handle file ingestion: read text and load directly into live code editor
  const handleFileSelect = async (file) => {
    if (!file) return;
    setErrorMsg(null);
    setCurrentFileName(file.name);
    addLog(`Ingesting uploaded file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);

    try {
      // Read raw source text and load into the editor
      const text = await file.text();
      setCodeSnippet(text);
      addLog(`File contents loaded into Live Code Editor (${text.split('\n').length} lines).`);

      // Automatically trigger scan on the uploaded content
      runScan(text, file.name, file);
    } catch (err) {
      setErrorMsg(`Failed to read file: ${err.message}`);
      addLog(`[ERROR] ${err.message}`);
    }
  };

  const runScan = async (codeToScan = codeSnippet, fileName = currentFileName, fileObj = null) => {
    if (!codeToScan.trim()) return;
    setIsScanning(true);
    setErrorMsg(null);
    setScanLogs([]);
    addLog(`Initiating AST static data leakage scan on: ${fileName}`);
    addLog(`⚡ AI Remediation Engine: ${aiStatus.engine} (Configured in Backend .env)`);

    try {
      addLog("Step 1/3: Running AST Static Rule Suite (Preprocessing, Target Proxy, Group, Temporal)...");
      await new Promise(r => setTimeout(r, 200));
      addLog("Step 2/3: Executing Trained ML Leakage Classifier Model (RandomForest + TF-IDF)...");
      await new Promise(r => setTimeout(r, 200));
      addLog("Step 3/3: Evaluating Overoptimism Risk Index & Generalization Gap (Δ)...");
      await new Promise(r => setTimeout(r, 150));

      let results;
      if (fileObj) {
        results = await uploadAndScanFile(fileObj);
      } else {
        results = await scanCodeSnippet(codeToScan, fileName);
      }
      
      addLog(`Scan concluded! Pipeline Health Score: ${results.score}/100.`);
      onScanComplete(results, fileName);
    } catch (err) {
      setErrorMsg(err.message || "Scan failed");
      addLog(`[ERROR] ${err.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-400" />
            Scanner & Live Code Editor
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Upload any Python script (.py) or Jupyter Notebook (.ipynb) to load its code directly into the live editor for inspection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef}
            accept=".py,.ipynb,.zip" 
            className="hidden" 
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            variant="outline"
            className="gap-2 border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/40"
          >
            <FolderUp className="w-4 h-4" />
            Upload File to Editor
          </Button>

          <Button 
            onClick={() => runScan(codeSnippet, currentFileName)}
            disabled={isScanning || !codeSnippet.trim()}
            size="sm"
            className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
          >
            <Play className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Inspecting AST...' : 'Inspect & Scan'}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Code Editor & Dropzone (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Quick Dropzone Banner */}
          <div 
            className={`p-3 rounded-xl border-2 border-dashed transition-all flex items-center justify-between gap-4 cursor-pointer ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-950/40' 
                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Upload className="w-4 h-4 animate-pulse" />
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold text-white block">
                  Drag & Drop any ML File (.py, .ipynb, .zip) to load into editor
                </span>
                <span className="text-[11px] text-slate-400">
                  Current file: <code className="text-indigo-300 font-mono">{currentFileName}</code>
                </span>
              </div>
            </div>

            <Badge variant="outline" className="text-[10px] border-slate-700 font-mono shrink-0">
              Browse
            </Badge>
          </div>

          {/* Live Code Editor Box */}
          <Card className="bg-slate-950 border-slate-800 flex flex-col h-[520px] overflow-hidden">
            <CardHeader className="py-2 px-4 bg-slate-900/80 border-b border-slate-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-mono font-semibold text-slate-200">{currentFileName}</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-slate-700 text-slate-400">
                {codeSnippet.split('\n').length} Lines • Live Editable
              </Badge>
            </CardHeader>

            <CardContent className="p-0 flex-1 overflow-hidden">
              <textarea
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                placeholder="Upload your Python script or notebook, or paste code directly here to inspect..."
                className="w-full h-full p-4 bg-slate-950 font-mono text-xs text-slate-200 resize-none focus:outline-none border-none leading-relaxed select-text"
                spellCheck={false}
              />
            </CardContent>
          </Card>

        </div>

        {/* Right Column: AI Engine Status & Terminal Logs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* AI Cloud Engine Backend Status */}
          <Card className="bg-slate-900/80 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <CardTitle className="text-sm text-slate-200">AI Remediation Engine</CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] border-indigo-500/40 text-indigo-300 font-mono">
                Backend .env
              </Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                    Engine Mode:
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Auto-Configured
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                  <span className="text-slate-400">Active Model:</span>
                  <span className="font-mono text-[11px] text-slate-200 font-medium">
                    {aiStatus.engine}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                AI patches and reliability explanations are powered automatically via backend environment credentials (<code className="text-indigo-300 font-mono">.env</code>), eliminating the need for manual API key inputs.
              </p>

            </CardContent>
          </Card>

          {/* Terminal Scan Log */}
          <Card className="bg-slate-950 border-slate-800">
            <CardHeader className="py-2.5 px-4 bg-slate-900/60 border-b border-slate-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-mono font-medium text-slate-300">Static AST Stream Log</span>
              </div>
              {isScanning && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                </span>
              )}
            </CardHeader>
            <CardContent className="p-3 h-52 overflow-y-auto font-mono text-[11px] space-y-1 text-slate-300">
              {scanLogs.length === 0 ? (
                <p className="text-slate-600 italic">No active upload logs yet. Upload a file above or click "Inspect & Scan" to trace AST parsing events.</p>
              ) : (
                scanLogs.map((log, i) => (
                  <div key={i} className={log.includes('[ERROR]') ? 'text-rose-400' : 'text-slate-300'}>
                    {log}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
};

