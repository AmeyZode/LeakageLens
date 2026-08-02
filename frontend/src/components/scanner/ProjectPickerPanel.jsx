import React from 'react';
import { Files } from 'lucide-react';
import Card from '../common/Card.jsx';
import EmptyState from '../common/EmptyState.jsx';
import SectionHeader from '../common/SectionHeader.jsx';
import { getFileName } from '../../utils/formatters.js';

function ProjectPickerPanel({ files = [] }) {
  return (
    <Card>
      <SectionHeader icon={<Files size={16} />} title="Selected Project Preview" />
      {!files.length ? (
        <EmptyState
          title="No local folder selected"
          description="The backend scanner runs from the project path field."
        />
      ) : (
        <div className="file-preview-list">
          {files.slice(0, 8).map((file) => (
            <div key={`${file.name}-${file.size}`}>
              <strong>{getFileName(file.webkitRelativePath || file.name)}</strong>
              <small>{file.webkitRelativePath || file.name}</small>
            </div>
          ))}
          {files.length > 8 && <p>{files.length - 8} additional files selected.</p>}
        </div>
      )}
    </Card>
  );
}

export default ProjectPickerPanel;
