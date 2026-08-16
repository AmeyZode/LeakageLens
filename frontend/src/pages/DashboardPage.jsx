import React, { useEffect, useState } from 'react';
import { Activity, ArrowRight, FileText, ShieldCheck } from 'lucide-react';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import SectionHeader from '../components/common/SectionHeader.jsx';
import StatusPill from '../components/common/StatusPill.jsx';
import SeverityDonutChart from '../components/charts/SeverityDonutChart.jsx';
import HealthOverview from '../components/dashboard/HealthOverview.jsx';
import RecentRecommendations from '../components/dashboard/RecentRecommendations.jsx';
import TopIssuesList from '../components/dashboard/TopIssuesList.jsx';
import HistoryTable from '../components/history/HistoryTable.jsx';
import ScanResultSummary from '../components/scanner/ScanResultSummary.jsx';
import { useHistoryData } from '../context/HistoryContext.jsx';
import { useScan } from '../context/ScanContext.jsx';
import { useDerivedScanMetrics } from '../hooks/useDerivedScanMetrics.js';
import { healthCheck } from '../services/api.js';
import { formatScore } from '../utils/formatters.js';

function DashboardPage({ navigate }) {
  const { currentScan, selectedIssueId, setSelectedIssueId } = useScan();
  const { history, status: historyStatus } = useHistoryData();
  const { severityData, categoryData, recommendations, topIssues } = useDerivedScanMetrics(currentScan);
  const [apiHealth, setApiHealth] = useState({ status: 'checking' });

  useEffect(() => {
    let cancelled = false;
    healthCheck()
      .then((data) => {
        if (!cancelled) setApiHealth({ status: data?.status || 'ok' });
      })
      .catch(() => {
        if (!cancelled) setApiHealth({ status: 'offline' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="dashboard-page page-stack">
      <div className="dashboard-toolbar">
        <StatusPill tone={apiHealth.status === 'ok' ? 'success' : apiHealth.status === 'checking' ? 'neutral' : 'danger'}>
          Backend {apiHealth.status}
        </StatusPill>
        <Button variant="secondary" size="sm" icon={<ArrowRight size={14} />} onClick={() => navigate('/scanner')}>
          New scan
        </Button>
      </div>

      <HealthOverview scan={currentScan} />

      <div className="dashboard-grid">
        <Card>
          <SectionHeader icon={<Activity size={16} />} title="Severity Distribution" />
          <SeverityDonutChart data={severityData.length ? severityData : categoryData} centerLabel="Findings" />
        </Card>

        <Card>
          <SectionHeader icon={<ShieldCheck size={16} />} title="Pipeline Health" />
          {currentScan ? (
            <div className="pipeline-health-panel">
              <div className="pipeline-health-score">
                <strong>{formatScore(currentScan.score)}</strong>
                <span>{currentScan.healthLabel}</span>
              </div>
              <div className="pipeline-health-meta">
                <p>Risk level: <strong>{currentScan.riskLevel}</strong></p>
                <p>Risk score: <strong>{currentScan.riskScore}</strong></p>
                <p>Source: <code>{currentScan.sourcePath}</code></p>
              </div>
            </div>
          ) : (
            <EmptyState title="No scan yet" description="Run a scan to populate pipeline health metrics." />
          )}
        </Card>

        <TopIssuesList
          issues={topIssues}
          selectedIssueId={selectedIssueId}
          onSelectIssue={setSelectedIssueId}
        />

        <RecentRecommendations recommendations={recommendations} />
      </div>

      <div className="dashboard-grid dashboard-grid--split">
        <Card>
          <SectionHeader icon={<FileText size={16} />} title="Latest Scan" />
          <ScanResultSummary scan={currentScan} navigate={navigate} />
        </Card>

        <Card>
          <SectionHeader icon={<Activity size={16} />} title="Recent Activity" />
          <HistoryTable history={history} status={historyStatus} onOpenReport={() => navigate('/reports')} compact />
        </Card>
      </div>

      <Card>
        <SectionHeader
          icon={<FileText size={16} />}
          title="Recent Reports"
          action={
            <Button variant="ghost" size="sm" icon={<ArrowRight size={14} />} onClick={() => navigate('/reports')}>
              View reports
            </Button>
          }
        />
        {currentScan ? (
          <p className="muted-copy">
            Latest report available for <strong>{currentScan.sourcePath}</strong> with{' '}
            {currentScan.totalIssues} findings. Open the Reports page to view Markdown and JSON exports.
          </p>
        ) : (
          <EmptyState title="No reports yet" description="Complete a scan to generate exportable audit reports." />
        )}
      </Card>
    </div>
  );
}

export default DashboardPage;
