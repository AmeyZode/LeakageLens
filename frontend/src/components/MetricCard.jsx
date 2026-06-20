import React from 'react';

const VARIANTS = {
  default: 'metric-card--default',
  score: 'metric-card--score',
  critical: 'metric-card--critical',
  success: 'metric-card--success',
};

function MetricCard({ title, value, subtitle, variant = 'default', icon }) {
  return (
    <div className={`metric-card ${VARIANTS[variant] || VARIANTS.default}`}>
      <div className="metric-card-header">
        <span className="metric-card-title">{title}</span>
        {icon && (
          <span className="metric-card-icon" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      <div className="metric-card-content">
        <p className="metric-card-value">{value}</p>
        {subtitle && <p className="metric-card-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}

export default MetricCard;
