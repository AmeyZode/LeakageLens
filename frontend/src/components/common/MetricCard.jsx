import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Card from './Card.jsx';

function MetricCard({
  title,
  value,
  description,
  icon,
  tone = 'neutral',
  trend,
  trendDirection = 'up',
}) {
  const TrendIcon = trendDirection === 'down' ? ArrowDownRight : ArrowUpRight;

  return (
    <Card className={`metric-card metric-card-${tone}`}>
      <div className="metric-card-top">
        <span className="metric-card-icon">{icon}</span>
        <span className="metric-card-title">{title}</span>
      </div>
      <div className="metric-card-value-row">
        <strong>{value}</strong>
        {trend && (
          <span className={`metric-trend metric-trend-${trendDirection}`}>
            <TrendIcon size={13} />
            {trend}
          </span>
        )}
      </div>
      {description && <p>{description}</p>}
    </Card>
  );
}

export default MetricCard;
