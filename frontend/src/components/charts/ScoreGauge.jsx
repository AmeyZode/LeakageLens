import React from 'react';
import { getScoreTone } from '../../utils/formatters.js';

function ScoreGauge({ score = 0, label = 'Health Score' }) {
  const value = Math.max(0, Math.min(100, Math.round(score)));
  const tone = getScoreTone(value);

  return (
    <div className={`score-gauge score-gauge-${tone}`} style={{ '--score': `${value}%` }}>
      <div className="score-gauge-ring">
        <span>{value}</span>
        <small>/100</small>
      </div>
      <strong>{label}</strong>
    </div>
  );
}

export default ScoreGauge;
