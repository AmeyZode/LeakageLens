import React from 'react';
import { RefreshCw } from 'lucide-react';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';
import CodeBlock from '../common/CodeBlock.jsx';
import CopyButton from '../common/CopyButton.jsx';
import { getCategoryLabel } from '../../utils/ruleCatalog.js';

function RecommendationCard({ issue, onRefresh }) {
  return (
    <article className="recommendation-card">
      <div className="recommendation-card-head">
        <div>
          <Badge tone="neutral">{issue.rule_id}</Badge>
          <h3>{issue.rule_name}</h3>
          <p>{getCategoryLabel(issue.category)} · {issue.file_path}:{issue.line_number}</p>
        </div>
        <Badge tone={issue.severity === 'critical' ? 'danger' : issue.severity === 'major' ? 'warning' : 'info'}>
          {issue.severity}
        </Badge>
      </div>
      <p>{issue.recommendationExplanation || issue.description}</p>
      <div className="recommendation-actions">
        <CopyButton value={issue.recommendationFix} label="Copy fix" />
        <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />} onClick={() => onRefresh?.(issue)}>
          Refresh
        </Button>
      </div>
      <CodeBlock>{issue.recommendationFix || issue.suggested_fix || '# No fix available'}</CodeBlock>
    </article>
  );
}

export default RecommendationCard;
