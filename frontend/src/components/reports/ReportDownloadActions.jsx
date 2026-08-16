import React from 'react';
import { Download } from 'lucide-react';
import Button from '../common/Button.jsx';

function ReportDownloadActions({ onDownloadMarkdown, onDownloadJson }) {
  return (
    <div className="report-actions">
      <Button variant="secondary" icon={<Download size={16} />} onClick={onDownloadMarkdown}>
        Markdown
      </Button>
      <Button variant="secondary" icon={<Download size={16} />} onClick={onDownloadJson}>
        JSON
      </Button>
    </div>
  );
}

export default ReportDownloadActions;
