import React from 'react';

function ProgressBar({ value = 0, label, animated = false }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="progress-group" aria-label={label}>
      <div className={`progress-track ${animated ? 'progress-track-animated' : ''}`}>
        <span style={{ width: `${clamped}%` }} />
      </div>
      {label && <small>{label}</small>}
    </div>
  );
}

export default ProgressBar;
