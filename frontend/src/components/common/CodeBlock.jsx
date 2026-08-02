import React from 'react';
import CopyButton from './CopyButton.jsx';

function CodeBlock({ children, language = 'python', className = '' }) {
  const value = typeof children === 'string' ? children : String(children || '');

  return (
    <div className={`code-block ${className}`.trim()}>
      <div className="code-block-toolbar">
        <span>{language}</span>
        <CopyButton value={value} label="Copy code" />
      </div>
      <pre>
        <code>{value}</code>
      </pre>
    </div>
  );
}

export default CodeBlock;
