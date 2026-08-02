import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';
import Card from '../common/Card.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { getScoreTone } from '../../utils/formatters.js';

function ScanResultSummary({ scan, navigate }) {
  if (!scan) {
    return (
      <Card>
        <EmptyState
          title="No scan result"
          description="A completed scan will summarize health, findings, and report links here."
        />
      </Card>
    );
  }

  return (
    <Card className="scan-summary-card">
      <div className="scan-summary-top">
        <CheckCircle2 size={22} />
        <div>
          <span className="eyebrow">Latest Result</span>
          <h2>{scan.score}/100 · {scan.riskLevel} risk</h2>
          <p>{scan.totalIssues} findings across {scan.filesScanned} files with findings.</p>
        </div>
      </div>
      <div className="severity-summary-row">
        <Badge tone="danger">{scan.counts.critical} critical</Badge>
        <Badge tone="warning">{scan.counts.major} major</Badge>
        <Badge tone="info">{scan.counts.minor} minor</Badge>
        <Badge tone={getScoreTone(scan.score)}>{scan.healthLabel}</Badge>
      </div>
      <Button variant="secondary" icon={<ArrowRight size={16} />} onClick={() => navigate('/reports')}>
        Open Report
      </Button>
    </Card>
  );
}

export default ScanResultSummary;
