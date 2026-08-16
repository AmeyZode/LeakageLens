import React from 'react';
import { AlertTriangle, FileCode2, Gauge, ShieldCheck } from 'lucide-react';
import ScoreGauge from '../charts/ScoreGauge.jsx';
import MetricCard from '../common/MetricCard.jsx';

function HealthOverview({ scan }) {
  const score = scan?.score ?? 100;
  const totalIssues = scan?.totalIssues ?? 0;
  const riskScore = scan?.riskScore ?? 0;
  const filesScanned = scan?.filesScanned ?? 0;
  const criticalIssues = scan?.counts.critical ?? 0;
  const majorIssues = scan?.counts.major ?? 0;

  return (
    <section className="health-overview">
      <div className="health-main card">
        <div className="health-gauge-wrap">
          <ScoreGauge score={score} label={scan?.healthLabel || 'No scan'} />
        </div>
        <div className="health-copy">
          <span className="eyebrow">Pipeline Health</span>
          <h2>{scan ? `${scan.riskLevel} risk posture` : 'Ready for first scan'}</h2>
          <p>
            {scan
              ? `${totalIssues} findings were mapped to backend rule output from ${scan.sourcePath}.`
              : 'Start with a backend-accessible project path to populate the dashboard.'}
          </p>
          <div className="health-signal-row" aria-label="Current scan summary">
            <span><strong>{criticalIssues}</strong> critical</span>
            <span><strong>{majorIssues}</strong> major</span>
            <span><strong>{filesScanned}</strong> files</span>
          </div>
        </div>
      </div>
      <div className="metric-grid">
        <MetricCard
          title="Issues"
          value={totalIssues}
          description={`${scan?.counts.critical || 0} critical, ${scan?.counts.major || 0} major`}
          tone={totalIssues ? 'danger' : 'success'}
          icon={<AlertTriangle size={21} />}
        />
        <MetricCard
          title="Risk Score"
          value={riskScore}
          description="Derived as inverse health score"
          tone={riskScore > 50 ? 'danger' : 'warning'}
          icon={<Gauge size={21} />}
        />
        <MetricCard
          title="Files With Findings"
          value={filesScanned}
          description="Derived from issue file paths"
          tone="blue"
          icon={<FileCode2 size={21} />}
        />
        <MetricCard
          title="Scanner"
          value={scan ? 'Complete' : 'Idle'}
          description="FastAPI analyzer contract"
          tone={scan ? 'success' : 'neutral'}
          icon={<ShieldCheck size={21} />}
        />
      </div>
    </section>
  );
}

export default HealthOverview;
