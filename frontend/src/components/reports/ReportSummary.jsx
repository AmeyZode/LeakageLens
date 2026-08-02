import React from 'react';
import { FileJson, FileText } from 'lucide-react';
import MetricCard from '../common/MetricCard.jsx';

function ReportSummary({ scan }) {
  return (
    <div className="metric-grid">
      <MetricCard title="Health Score" value={`${scan.score}/100`} description={scan.healthLabel} tone="success" icon={<FileText size={21} />} />
      <MetricCard title="Issues" value={scan.totalIssues} description="Total backend findings" tone={scan.totalIssues ? 'danger' : 'success'} icon={<FileJson size={21} />} />
      <MetricCard title="Critical" value={scan.counts.critical} description="15 point deduction each" tone="danger" icon={<FileText size={21} />} />
      <MetricCard title="Major" value={scan.counts.major} description="10 point deduction each" tone="warning" icon={<FileText size={21} />} />
    </div>
  );
}

export default ReportSummary;
