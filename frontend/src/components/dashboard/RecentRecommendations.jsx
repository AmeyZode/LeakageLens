import React from 'react';
import { Bot } from 'lucide-react';
import Card from '../common/Card.jsx';
import EmptyState from '../common/EmptyState.jsx';
import SectionHeader from '../common/SectionHeader.jsx';
import CopyButton from '../common/CopyButton.jsx';

function RecentRecommendations({ recommendations = [] }) {
  return (
    <Card>
      <SectionHeader icon={<Bot size={16} />} title="Recent Recommendations" />
      {!recommendations.length ? (
        <EmptyState title="No recommendations yet" description="AI recommendations are attached to scan issues." />
      ) : (
        <div className="recommendation-mini-list">
          {recommendations.slice(0, 4).map((issue) => (
            <article key={issue.id} className="recommendation-mini">
              <span>{issue.rule_id}</span>
              <strong>{issue.rule_name}</strong>
              <p>{issue.recommendationExplanation}</p>
              <CopyButton value={issue.recommendationFix} label="Copy fix" />
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}

export default RecentRecommendations;
