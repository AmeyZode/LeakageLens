import React from 'react';
import { Terminal } from 'lucide-react';
import Card from '../common/Card.jsx';
import SectionHeader from '../common/SectionHeader.jsx';
import { formatDateTime } from '../../utils/formatters.js';

function ScanLogs({ logs = [] }) {
  return (
    <Card className="scan-log-card">
      <SectionHeader icon={<Terminal size={16} />} title="Live Logs" />
      <div className="scan-log">
        {logs.length ? (
          logs.map((log) => (
            <div key={log.id} className={`scan-log-row scan-log-${log.type}`}>
              <span>{formatDateTime(log.timestamp)}</span>
              <code>{log.message}</code>
            </div>
          ))
        ) : (
          <div className="scan-log-row">
            <span>Ready</span>
            <code>Waiting for scan request.</code>
          </div>
        )}
      </div>
    </Card>
  );
}

export default ScanLogs;
