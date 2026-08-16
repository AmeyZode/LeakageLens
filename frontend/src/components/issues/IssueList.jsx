import React, { useMemo, useState } from 'react';
import { FileSearch } from 'lucide-react';
import EmptyState from '../common/EmptyState.jsx';
import IssueCard from './IssueCard.jsx';
import IssueFilters from './IssueFilters.jsx';

function issueMatches(issue, query) {
  const haystack = [
    issue.rule_id,
    issue.rule_name,
    issue.file_path,
    issue.description,
    issue.context_line,
    issue.recommendationExplanation,
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function IssueList({ issues = [], selectedIssueId, onSelectIssue, compact = false, maxItems, actionsForIssue }) {
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState('all');
  const [category, setCategory] = useState('all');

  const filteredIssues = useMemo(() => {
    return issues
      .filter((issue) => severity === 'all' || issue.severity === severity)
      .filter((issue) => category === 'all' || issue.category === category)
      .filter((issue) => !query.trim() || issueMatches(issue, query.trim()))
      .slice(0, typeof maxItems === 'number' ? maxItems : undefined);
  }, [category, issues, maxItems, query, severity]);

  if (!issues.length) {
    return (
      <EmptyState
        icon={<FileSearch size={24} />}
        title="No issues available"
        description="Run a scan to populate issue details."
      />
    );
  }

  return (
    <div className={`issue-list ${compact ? 'issue-list-compact' : ''}`}>
      {!compact && (
        <IssueFilters
          query={query}
          setQuery={setQuery}
          severity={severity}
          setSeverity={setSeverity}
          category={category}
          setCategory={setCategory}
        />
      )}
      <div className="issue-list-stack">
        {filteredIssues.map((issue, index) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            defaultOpen={!compact && index === 0}
            onSelect={onSelectIssue}
            selected={selectedIssueId === issue.id}
            actions={actionsForIssue?.(issue)}
          />
        ))}
      </div>
      {!filteredIssues.length && (
        <EmptyState title="No matching issues" description="Adjust the current search or filter selection." />
      )}
    </div>
  );
}

export default IssueList;
