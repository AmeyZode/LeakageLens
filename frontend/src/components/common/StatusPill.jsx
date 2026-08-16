import React from 'react';

function StatusPill({ children, tone = 'neutral', icon }) {
  return (
    <span className={`status-pill status-pill-${tone}`}>
      {icon}
      {children}
    </span>
  );
}

export default StatusPill;
