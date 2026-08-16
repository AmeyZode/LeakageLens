import React from 'react';
import CodeBlock from '../common/CodeBlock.jsx';

function JsonReportViewer({ json }) {
  return <CodeBlock language="json">{json}</CodeBlock>;
}

export default JsonReportViewer;
