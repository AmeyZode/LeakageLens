import React from 'react';
import RecommendationCard from './RecommendationCard.jsx';

function RecommendationGroup({ title, issues, onRefresh }) {
  return (
    <section className="recommendation-group">
      <h2>{title}</h2>
      <div className="recommendation-grid">
        {issues.map((issue) => (
          <RecommendationCard key={issue.id} issue={issue} onRefresh={onRefresh} />
        ))}
      </div>
    </section>
  );
}

export default RecommendationGroup;
