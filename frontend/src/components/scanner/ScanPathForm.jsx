import React, { useRef, useState } from 'react';
import { FolderOpen, Play, UploadCloud } from 'lucide-react';
import Button from '../common/Button.jsx';

function ScanPathForm({ defaultPath, isScanning, onScan, onPreviewFiles }) {
  const [path, setPath] = useState(defaultPath || '');
  const fileInputRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    onScan(path);
  };

  const handleFiles = (event) => {
    const files = Array.from(event.target.files || []);
    onPreviewFiles(files);
  };

  return (
    <form className="scan-form card" onSubmit={handleSubmit}>
      <div className="field">
        <span>Project path</span>
        <input
          value={path}
          onChange={(event) => setPath(event.target.value)}
          placeholder="sample_projects"
          disabled={isScanning}
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="visually-hidden"
        multiple
        webkitdirectory=""
        onChange={handleFiles}
      />

      <div className="scan-form-actions">
        <Button
          variant="secondary"
          icon={<FolderOpen size={17} />}
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
        >
          Choose Folder
        </Button>
        <Button
          variant="ghost"
          icon={<UploadCloud size={17} />}
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
        >
          Upload Project
        </Button>
        <Button type="submit" icon={<Play size={17} />} disabled={isScanning}>
          {isScanning ? 'Scanning' : 'Start Scan'}
        </Button>
      </div>
    </form>
  );
}

export default ScanPathForm;
