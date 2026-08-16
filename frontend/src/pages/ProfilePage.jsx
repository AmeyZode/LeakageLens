import React from 'react';
import { Activity, Gauge, ShieldCheck } from 'lucide-react';
import Card from '../components/common/Card.jsx';
import MetricCard from '../components/common/MetricCard.jsx';
import HistoryTable from '../components/history/HistoryTable.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useHistoryData } from '../context/HistoryContext.jsx';
import { useScan } from '../context/ScanContext.jsx';
import { formatScore } from '../utils/formatters.js';

function ProfilePage({ navigate }) {
  const { user } = useAuth();
  const { currentScan } = useScan();
  const { history, status } = useHistoryData();

  const avgScore = history.length
    ? Math.round(history.reduce((sum, row) => sum + (row.score || 0), 0) / history.length)
    : null;

  return (
    <div className="profile-page page-stack">
      <Card className="profile-hero-card">
        <div className="profile-hero">
          <span className="avatar avatar-lg">{user?.name?.charAt(0) || 'L'}</span>
          <div>
            <h2>{user?.name || 'LeakageLens User'}</h2>
            <p>{user?.email || 'Local workspace session'}</p>
          </div>
        </div>
      </Card>

      <div className="metric-grid">
        <MetricCard title="Scans Run" value={history.length} description="Backend history entries" tone="blue" icon={<Activity size={21} />} />
        <MetricCard
          title="Health Avg"
          value={avgScore != null ? formatScore(avgScore) : '—'}
          description="Across saved scans"
          tone="success"
          icon={<Gauge size={21} />}
        />
        <MetricCard
          title="Latest Scan"
          value={currentScan ? formatScore(currentScan.score) : '—'}
          description={currentScan?.sourcePath || 'No scan yet'}
          tone={currentScan ? 'success' : 'neutral'}
          icon={<ShieldCheck size={21} />}
        />
      </div>

      <Card>
        <HistoryTable history={history} status={status} onOpenReport={() => navigate('/reports')} />
      </Card>
    </div>
  );
}

export default ProfilePage;
