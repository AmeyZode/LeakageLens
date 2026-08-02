import React from 'react';

function IconButton({ icon, label, className = '', variant = 'ghost', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`icon-btn icon-btn-${variant} ${className}`.trim()}
      aria-label={label}
      title={label}
      {...props}
    >
      {icon}
    </button>
  );
}

export default IconButton;
