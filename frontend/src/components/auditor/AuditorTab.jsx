import React, { useState, useEffect } from 'react';
import { 
  FileCode, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Copy, 
  Check, 
  Info, 
  Code2, 
  Bug,
  Layers,
  Workflow,
  Download,
  Filter
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { SAMPLE_FILES } from '../../utils/sampleData';
import { fetchAiRecommendation } from '../../services/api';
import { DataflowGraph } from './DataflowGraph';
import { NotebookCellInspector } from './NotebookCellInspector';

export const AuditorTab = ({ scanResult }) => {
  const issues = scanResult?.issues || [];
  
  // Unique file list
  const filePaths = Array.from(new Set([
    ...(scanResult?.filename ? [scanResult.filename] : []),
    ...issues.map(i => i.file_path),
    ...Object.keys(SAMPLE_FILES)
  ]));

  const [selectedFile, setSelectedFile] = useState(scanResult?.filename || filePaths[0] || 'preprocessing_leakage.py');
  const [activeAuditorView, setActiveAuditorView] = useState('code'); // 'code', 'dataflow', 'notebook_cells', 'instances_table'
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeRecommendation, setActiveRecommendation] = useState(null);
  const [copied, setCopied] = useState(false);

  // Sync selected file whenever a new scan finishes
  useEffect(() => {
    if (scanResult?.filename) {
      setSelectedFile(scanResult.filename);
    }
  }, [scanResult?.filename, scanResult?.id]);

  // Issues filtering
  const fileIssues = issues.filter(i => i.file_path === selectedFile || selectedFile === scanResult?.filename);
  const filteredIssues = fileIssues.filter(i => {
    if (severityFilter === 'all') return true;
    return i.severity === severityFilter;
  });

  const issueLineMap = filteredIssues.reduce((acc, issue) => {
    acc[issue.line_number] = issue;
    return acc;
  }, {});

  // Raw source code
  const fileContent = (selectedFile === scanResult?.filename && scanResult?.source_code)
    ? scanResult.source_code
    : (SAMPLE_FILES[selectedFile] || 
       `# Source for ${selectedFile}\n` + fileIssues.map(i => `# Line ${i.line_number}: ${i.context_line}\n# ${i.description}`).join('\n\n'));

  const lines = fileContent.split('\n');

  const handleOpenIssueModal = async (issue) => {
    setSelectedIssue(issue);
    setActiveRecommendation(issue.ai_recommendation || null);
    setIsModalOpen(true);

    if (!issue.ai_recommendation || !issue.ai_recommendation.fix) {
      setAiLoading(true);
      try {
        const rec = await fetchAiRecommendation(issue, issue.context_line);
        setActiveRecommendation(rec);
      } catch (err) {
        console.warn('AI recommendation fetch error:', err);
      } finally {
        setAiLoading(false);
      }
    }
  };

  const handleCopyFix = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityBadge = (sev) => {
    if (sev === 'critical') return <Badge variant="critical">Critical</Badge>;
    if (sev === 'major') return <Badge variant="major">Major</Badge>;
    return <Badge variant="minor">Minor</Badge>;
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-400" />
            Static Code Auditor & Pipeline Diagnostic Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Examine line-by-line AST structures, dataflow boundaries, cell execution dependencies, and AI quick-fixes.
          </p>
        </div>

        {/* View Switcher & File Selector */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Sub-view switcher */}
          <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveAuditorView('code')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeAuditorView === 'code' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Line Inspector
            </button>
            <button
              onClick={() => setActiveAuditorView('dataflow')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeAuditorView === 'dataflow' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dataflow Graph
            </button>
            <button
              onClick={() => setActiveAuditorView('notebook_cells')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeAuditorView === 'notebook_cells' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Notebook Cells
            </button>
            <button
              onClick={() => setActiveAuditorView('instances_table')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeAuditorView === 'instances_table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Instances Table
            </button>
          </div>

          {/* File Selector */}
          <select 
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-mono text-indigo-300 focus:border-indigo-500 focus:outline-none"
          >
            {filePaths.map((fp) => (
              <option key={fp} value={fp}>
                {fp} ({issues.filter(i => i.file_path === fp).length} issues)
              </option>
            ))}
          </select>

        </div>
      </div>

      {/* VIEW 1: DATAFLOW GRAPH */}
      {activeAuditorView === 'dataflow' && (
        <DataflowGraph issues={fileIssues} selectedFile={selectedFile} />
      )}

      {/* VIEW 2: NOTEBOOK CELL INSPECTOR */}
      {activeAuditorView === 'notebook_cells' && (
        <NotebookCellInspector />
      )}

      {/* VIEW 3: INSTANCES TABLE (Paper Format) */}
      {activeAuditorView === 'instances_table' && (
        <Card className="bg-slate-900/80 border-slate-800 overflow-hidden">
          <CardHeader className="bg-slate-950/60 border-b border-slate-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm text-white">Leakage Instances Catalog (Paper Section 1.1)</CardTitle>
              <CardDescription className="text-xs">Formal listing of detected AST leakage instances across project</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Severity Filter:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="rounded-md border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-200"
              >
                <option value="all">All Severities ({fileIssues.length})</option>
                <option value="critical">Critical</option>
                <option value="major">Major</option>
                <option value="minor">Minor</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Rule ID</th>
                  <th className="py-3 px-4">Violation Type</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Code Statement</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredIssues.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">No issues match the selected severity filter.</td>
                  </tr>
                ) : (
                  filteredIssues.map((issue, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">{issue.rule_id}</td>
                      <td className="py-3 px-4 font-medium text-white">{issue.rule_name}</td>
                      <td className="py-3 px-4">{getSeverityBadge(issue.severity)}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{issue.file_path}:L{issue.line_number}</td>
                      <td className="py-3 px-4 font-mono text-slate-300 max-w-xs truncate">{issue.context_line || issue.description}</td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenIssueModal(issue)}
                          className="h-7 text-xs bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white"
                        >
                          View Fix
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* VIEW 4: LINE-BY-LINE CODE INSPECTOR */}
      {activeAuditorView === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Code Line Inspector (7 cols) */}
          <Card className="lg:col-span-7 bg-slate-950 border-slate-800 flex flex-col h-[650px] overflow-hidden">
            <CardHeader className="py-2.5 px-4 bg-slate-900/80 border-b border-slate-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-mono font-semibold text-slate-200">{selectedFile}</span>
              </div>
              <Badge variant="outline" className="text-[10px] border-slate-700 font-mono">
                {lines.length} Lines • {fileIssues.length} Vulnerabilities
              </Badge>
            </CardHeader>

            <CardContent className="p-0 flex-1 overflow-y-auto font-mono text-xs select-text">
              <div className="min-w-max">
                {lines.map((lineText, idx) => {
                  const lineNum = idx + 1;
                  const issueOnLine = issueLineMap[lineNum];

                  let bgClass = 'hover:bg-slate-900/50';
                  if (issueOnLine) {
                    if (issueOnLine.severity === 'critical') bgClass = 'bg-rose-950/40 hover:bg-rose-950/60 border-l-2 border-l-rose-500';
                    else if (issueOnLine.severity === 'major') bgClass = 'bg-amber-950/40 hover:bg-amber-950/60 border-l-2 border-l-amber-500';
                    else bgClass = 'bg-sky-950/40 hover:bg-sky-950/60 border-l-2 border-l-sky-500';
                  }

                  return (
                    <div key={idx} className={`group flex flex-col ${bgClass} transition-colors`}>
                      <div className="flex items-baseline py-1 px-3">
                        <span className="w-10 shrink-0 text-slate-600 text-right pr-4 select-none font-mono text-[11px]">
                          {lineNum}
                        </span>
                        <span className="text-slate-200 whitespace-pre font-mono leading-relaxed">
                          {lineText || ' '}
                        </span>
                      </div>

                      {issueOnLine && (
                        <div className="ml-14 mr-4 mb-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-3 text-xs">
                          <div className="flex items-start gap-2">
                            <Bug className={`w-4 h-4 mt-0.5 shrink-0 ${
                              issueOnLine.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'
                            }`} />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">{issueOnLine.rule_name}</span>
                                <span className="font-mono text-[10px] text-slate-400">({issueOnLine.rule_id})</span>
                                {getSeverityBadge(issueOnLine.severity)}
                              </div>
                              <p className="text-[11px] text-slate-300 mt-1 font-sans">
                                {issueOnLine.description}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleOpenIssueModal(issueOnLine)}
                            className="shrink-0 text-xs gap-1.5 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Fix
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Diagnostic & Fix Summary (5 cols) */}
          <Card className="lg:col-span-5 bg-slate-900/80 border-slate-800 flex flex-col h-[650px]">
            <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm text-slate-200">Pipeline Violations ({filteredIssues.length})</CardTitle>
                <CardDescription className="text-xs">Click any issue to inspect AST diagnostics & code patch</CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs">{selectedFile}</Badge>
            </CardHeader>

            <CardContent className="p-4 flex-1 overflow-y-auto space-y-3">
              {filteredIssues.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
                  <p className="text-sm font-medium text-slate-300">Clean AST Pipeline</p>
                  <p className="text-xs text-slate-500 mt-1">No violations detected for current filter settings.</p>
                </div>
              ) : (
                filteredIssues.map((issue, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleOpenIssueModal(issue)}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-indigo-500/50 hover:bg-slate-900 transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                        <Bug className="w-3.5 h-3.5 text-indigo-400" />
                        {issue.rule_name}
                      </span>
                      {getSeverityBadge(issue.severity)}
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {issue.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
                      <span>Line {issue.line_number}</span>
                      <span className="text-indigo-400 font-semibold group-hover:underline flex items-center gap-1">
                        View Patch &rarr;
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

        </div>
      )}

      {/* AI Fix Recommendation Modal with Side-by-Side Diff */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedIssue ? `${selectedIssue.rule_name} (${selectedIssue.rule_id})` : 'Issue Fix'}
        description={selectedIssue ? `File: ${selectedIssue.file_path} • Line ${selectedIssue.line_number}` : ''}
      >
        {selectedIssue && (
          <div className="space-y-4">
            
            {/* Severity Pill & Description */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">Diagnosis:</span>
                  {activeRecommendation?.engine && (
                    <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-300 font-mono">
                      {activeRecommendation.engine}
                    </Badge>
                  )}
                </div>
                {getSeverityBadge(selectedIssue.severity)}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {selectedIssue.description}
              </p>
            </div>

            {/* Impact Analysis */}
            <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-900/40 space-y-1">
              <span className="text-[11px] font-mono text-indigo-300 font-semibold flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Reliability & Generalization Impact:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {selectedIssue.impact || "Information from test or validation sets leaks into training weights, generating falsely inflated validation metrics."}
              </p>
            </div>

            {/* Side-by-Side Code Diff Snippet */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Code Transformation & Sanitized Patch:
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyFix(selectedIssue.suggested_fix || activeRecommendation?.fix)}
                  className="h-7 px-2.5 text-xs gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied Code' : 'Copy Fixed Code'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Faulty Code */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-rose-400 font-bold block">
                    - CURRENT FAULTY CODE:
                  </span>
                  <pre className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/40 text-rose-200 text-xs font-mono overflow-x-auto h-32 leading-relaxed">
                    {selectedIssue.context_line || '# Context line'}
                  </pre>
                </div>

                {/* Sanitized Code */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                    + CORRECT PRACTICE FIX:
                  </span>
                  <pre className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-emerald-200 text-xs font-mono overflow-x-auto h-32 leading-relaxed">
                    {selectedIssue.suggested_fix || activeRecommendation?.fix || "# Correct practice snippet"}
                  </pre>
                </div>
              </div>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
};
