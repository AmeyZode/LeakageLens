import React from 'react';
import Card from '../common/Card.jsx';

function MarkdownReportViewer({ markdown }) {
  return (
    <Card className="report-viewer">
      <pre>{markdown}</pre>
    </Card>
  );
}

export default MarkdownReportViewer;
