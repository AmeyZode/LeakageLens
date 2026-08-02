import React from 'react';

function Card({ as: Component = 'section', className = '', children, compact = false, ...props }) {
  return (
    <Component className={`card ${compact ? 'card-compact' : ''} ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}

export default Card;
