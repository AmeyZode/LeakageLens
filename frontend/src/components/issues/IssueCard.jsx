import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import IssueDetails from './IssueDetails.jsx';
import IssueSeverityBadge from './IssueSeverityBadge.jsx';
import { getCategoryLabel } from '../../utils/ruleCatalog.js';

function IssueCard({ issue, defaultOpen = false, actions, onSelect, selected = false }) {
  const [open, setOpen] = useState(defaultOpen);

  const handleToggle = () => {
    setOpen((value) => !value);
    onSelect?.(issue);
  };

  return (
    <article className={`issue-card ${open ? 'open' : ''} ${selected ? 'selected' : ''}`}>
      <button type="button" className="issue-card-trigger" onClick={handleToggle}>
        <IssueSeverityBadge severity={issue.severity} />
        <span className="issue-title-block">
          <strong>{issue.rule_name}</strong>
          <small>
            {issue.rule_id} · {getCategoryLabel(issue.category)} · {issue.fileName}
          </small>
        </span>
        <ChevronRight className="issue-chevron" size={18} />
      </button>
      {open && <IssueDetails issue={issue} actions={actions} />}
    </article>
  );
}

export default IssueCard;
