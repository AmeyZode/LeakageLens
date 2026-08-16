import React from 'react';

function SectionHeader({ icon, title, description, action }) {
  return (
    <div className="section-header">
      <div>
        <h2>
          {icon}
          {title}
        </h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export default SectionHeader;
