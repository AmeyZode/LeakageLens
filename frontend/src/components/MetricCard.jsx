import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Info } from 'lucide-react';

const VARIANTS = {
  default: 'metric-card--default',
  score: 'metric-card--score',
  critical: 'metric-card--critical',
  success: 'metric-card--success',
  warning: 'metric-card--warning',
  danger: 'metric-card--danger',
  blue: 'metric-card--blue',
};

function MetricCard({
  title,
  value,
  subtitle,
  description,
  variant = 'default',
  icon,
  trend,
  trendDirection = 'up',
  progress,
}) {
  const detail = description || subtitle;
  const isPositive = trendDirection !== 'down';
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <motion.article
      className={`metric-card ${VARIANTS[variant] || VARIANTS.default}`}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    >
      <div className="metric-card-glow" aria-hidden="true" />
      <div className="metric-card-top">
        <span className="metric-card-icon" aria-hidden="true">
          {icon}
        </span>
        <span className="metric-card-title">
          {title}
          <Info size={13} aria-hidden="true" />
        </span>
      </div>

      <div className="metric-card-main">
        <p className="metric-card-value">{value}</p>
        {trend && (
          <span className={`metric-card-trend ${isPositive ? 'positive' : 'negative'}`}>
            <TrendIcon size={13} aria-hidden="true" />
            {trend}
          </span>
        )}
      </div>

      {detail && <p className="metric-card-description">{detail}</p>}

      {typeof progress === 'number' && (
        <div className="metric-card-progress" aria-hidden="true">
          <span style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }} />
        </div>
      )}
    </motion.article>
  );
}

export default MetricCard;
