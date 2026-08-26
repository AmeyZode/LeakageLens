import React, { useRef, useState } from 'react';
import { FolderOpen, Play, ShieldCheck, UploadCloud } from 'lucide-react';
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

  const PRESETS = [
    { label: 'Synthetic Benchmark', path: 'sample_projects/leaky_pipeline_benchmark.py', badge: 'Recommended' },
    { label: 'All Samples', path: 'sample_projects' },
    { label: 'Preprocessing Leakage', path: 'sample_projects/preprocessing_leakage.py' },
    { label: 'Current Repo Root', path: '.' },
  ];

  return (
    <form className="scan-form card" onSubmit={handleSubmit}>
      <div className="scan-form-copy">
        <span className="scan-form-icon">
          <ShieldCheck size={20} />
        </span>
        <div>
          <span className="eyebrow">Scanner Workspace</span>
          <h2>Audit an ML project for leakage risk</h2>
          <p>Point LeakageLens at a backend-accessible project path, or select one of the quick preset targets below.</p>
        </div>
      </div>

      <div className="preset-chips-container">
        <span className="preset-label">Quick Presets:</span>
        <div className="preset-chips">
          {PRESETS.map((preset) => (
            <button
              key={preset.path}
              type="button"
              className={`preset-chip ${path === preset.path ? 'preset-chip--active' : ''}`}
              onClick={() => {
                setPath(preset.path);
                onScan(preset.path);
              }}
              disabled={isScanning}
            >
              <span>{preset.label}</span>
              {preset.badge && <span className="preset-badge">{preset.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="scan-input-row">
        <div className="field">
          <span>Project path</span>
          <input
            value={path}
            onChange={(event) => setPath(event.target.value)}
            placeholder="sample_projects"
            disabled={isScanning}
          />
        </div>

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
            {isScanning ? 'Scanning...' : 'Start Scan'}
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="visually-hidden"
        multiple
        webkitdirectory=""
        onChange={handleFiles}
      />
    </form>
  );
}

export default ScanPathForm;
