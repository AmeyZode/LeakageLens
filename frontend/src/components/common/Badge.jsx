import React from 'react';

function Badge({ children, tone = 'neutral', className = '' }) {
  return <span className={`badge badge-${tone} ${className}`.trim()}>{children}</span>;
}

export default Badge;
