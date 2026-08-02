import React, { useMemo, useState } from 'react';
import { FileCode2, FileText } from 'lucide-react';
import Card from '../components/common/Card.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Tabs from '../components/common/Tabs.jsx';
import IssueList from '../components/issues/IssueList.jsx';
import JsonReportViewer from '../components/reports/JsonReportViewer.jsx';
import MarkdownReportViewer from '../components/reports/MarkdownReportViewer.jsx';
import ReportDownloadActions from '../components/reports/ReportDownloadActions.jsx';
import ReportSummary from '../components/reports/ReportSummary.jsx';
import { useScan } from '../context/ScanContext.jsx';
import { useReportExports } from '../hooks/useReportExports.js';

function ReportsPage({ navigate }) {
  const { currentScan } = useScan();
  const [activeTab, setActiveTab] = useState('markdown');
  const { markdown, json, downloadMarkdown, downloadJson } = useReportExports(currentScan);

  const tabs = useMemo(
    () => [
      { id: 'markdown', label: 'Markdown', icon: <FileText size={15} /> },
      { id: 'json', label: 'JSON', icon: <FileCode2 size={15} /> },
      { id: 'issues', label: 'Issues', icon: null },
    ],
    [],
  );

  if (!currentScan) {
    return (
      <div className="reports-page page-stack">
        <EmptyState
          title="No report available"
          description="Run a scan first, then return here to review Markdown and JSON audit output."
          action={
            <button type="button" className="btn btn-primary" onClick={() => navigate('/scanner')}>
              Go to Scanner
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="reports-page page-stack">
      <ReportSummary scan={currentScan} />
      <ReportDownloadActions onDownloadMarkdown={downloadMarkdown} onDownloadJson={downloadJson} />

      <Card>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        {activeTab === 'markdown' && <MarkdownReportViewer markdown={markdown} />}
        {activeTab === 'json' && <JsonReportViewer json={json} />}
        {activeTab === 'issues' && (
          <IssueList issues={currentScan.issues} compact={false} />
        )}
      </Card>
    </div>
  );
}

export default ReportsPage;
