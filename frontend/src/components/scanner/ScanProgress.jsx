import React from 'react';
import { SCAN_STAGES } from '../../utils/constants.js';
import Card from '../common/Card.jsx';
import ProgressBar from '../common/ProgressBar.jsx';

function ScanProgress({ activeStage, isScanning = false }) {
  const progress = activeStage?.progress || 0;

  return (
    <Card className={isScanning ? 'scan-progress-active' : ''}>
      <div className="scan-progress-head">
        <span className="eyebrow">Scan Progress</span>
        <strong>{activeStage?.label || 'Ready'}</strong>
      </div>
      <ProgressBar value={progress} label={`${progress}%`} animated={isScanning} />
      <div className="stage-list">
        {SCAN_STAGES.filter((stage) => !['idle', 'failed'].includes(stage.id)).map((stage) => (
          <span
            key={stage.id}
            className={stage.progress <= progress ? 'complete' : ''}
          >
            {stage.label}
          </span>
        ))}
      </div>
    </Card>
  );
}

export default ScanProgress;
