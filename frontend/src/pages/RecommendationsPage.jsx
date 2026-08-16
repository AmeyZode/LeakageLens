import React, { useMemo, useState } from 'react';
import EmptyState from '../components/common/EmptyState.jsx';
import RecommendationFilters from '../components/recommendations/RecommendationFilters.jsx';
import RecommendationGroup from '../components/recommendations/RecommendationGroup.jsx';
import { useScan } from '../context/ScanContext.jsx';
import { getCategoryLabel } from '../utils/ruleCatalog.js';

function groupIssues(issues, groupBy) {
  if (groupBy === 'category') {
    return issues.reduce((acc, issue) => {
      const key = getCategoryLabel(issue.category);
      acc[key] = acc[key] || [];
      acc[key].push(issue);
      return acc;
    }, {});
  }

  if (groupBy === 'file') {
    return issues.reduce((acc, issue) => {
      const key = issue.file_path || 'Unknown file';
      acc[key] = acc[key] || [];
      acc[key].push(issue);
      return acc;
    }, {});
  }

  return issues.reduce((acc, issue) => {
    const key = issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1);
    acc[key] = acc[key] || [];
    acc[key].push(issue);
    return acc;
  }, {});
}

function RecommendationsPage({ navigate }) {
  const { currentScan, refreshRecommendation } = useScan();
  const [query, setQuery] = useState('');
  const [groupBy, setGroupBy] = useState('severity');
  const [severity, setSeverity] = useState('all');

  const filteredIssues = useMemo(() => {
    if (!currentScan) return [];
    const q = query.trim().toLowerCase();

    return currentScan.issues.filter((issue) => {
      if (severity !== 'all' && issue.severity !== severity) return false;
      if (!q) return true;
      const haystack = [
        issue.rule_id,
        issue.rule_name,
        issue.file_path,
        issue.description,
        issue.recommendationExplanation,
        issue.recommendationFix,
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [currentScan, query, severity]);

  const groups = useMemo(() => groupIssues(filteredIssues, groupBy), [filteredIssues, groupBy]);

  if (!currentScan) {
    return (
      <EmptyState
        title="No recommendations yet"
        description="Run a scan to populate AI recommendations for detected issues."
        action={
          <button type="button" className="btn btn-primary" onClick={() => navigate('/scanner')}>
            Start scan
          </button>
        }
      />
    );
  }

  return (
    <div className="recommendations-page page-stack">
      <RecommendationFilters
        query={query}
        setQuery={setQuery}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        severity={severity}
        setSeverity={setSeverity}
      />

      {!filteredIssues.length ? (
        <EmptyState title="No matching recommendations" description="Try a different search or severity filter." />
      ) : (
        Object.entries(groups).map(([title, issues]) => (
          <RecommendationGroup
            key={title}
            title={title}
            issues={issues}
            onRefresh={refreshRecommendation}
          />
        ))
      )}
    </div>
  );
}

export default RecommendationsPage;
