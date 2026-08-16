import React from 'react';
import { Bot, FileCode2, LineChart, Sparkles } from 'lucide-react';
import CodeBlock from '../common/CodeBlock.jsx';
import CopyButton from '../common/CopyButton.jsx';
import { compactPath } from '../../utils/formatters.js';

function IssueDetails({ issue, actions }) {
  if (!issue) return null;

  return (
    <div className="issue-details">
      <div className="issue-detail-grid">
        <div>
          <span>File</span>
          <strong title={issue.file_path}>
            <FileCode2 size={14} />
            {compactPath(issue.file_path)}
          </strong>
        </div>
        <div>
          <span>Line</span>
          <strong>
            <LineChart size={14} />
            {issue.line_number || '-'}
          </strong>
        </div>
      </div>

      <div className="issue-copy">
        <h4>Description</h4>
        <p>{issue.description || 'No description provided.'}</p>
      </div>

      {issue.context_line && (
        <div>
          <h4>Code Snippet</h4>
          <CodeBlock language="python">{issue.context_line}</CodeBlock>
        </div>
      )}

      <div className="issue-copy">
        <h4>
          <Bot size={15} />
          Explanation
        </h4>
        <p>{issue.recommendationExplanation || 'No AI explanation is attached to this issue.'}</p>
      </div>

      <div>
        <div className="issue-fix-heading">
          <h4>
            <Sparkles size={15} />
            Recommended Fix
          </h4>
          <CopyButton value={issue.recommendationFix || issue.suggested_fix || ''} label="Copy fix" />
        </div>
        <CodeBlock language="python">{issue.recommendationFix || issue.suggested_fix || '# No fix available'}</CodeBlock>
      </div>

      {actions && <div className="issue-actions">{actions}</div>}
    </div>
  );
}

export default IssueDetails;
