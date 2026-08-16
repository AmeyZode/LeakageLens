import React from 'react';
import { AlertTriangle, CheckCircle2, RadioTower } from 'lucide-react';
import { useScan } from '../../context/ScanContext.jsx';
import { formatDateTime } from '../../utils/formatters.js';

function NotificationsMenu({ onClose }) {
  const { currentScan, scanStatus, scanError } = useScan();

  const items = [
    currentScan && {
      id: 'scan',
      icon: <CheckCircle2 size={15} />,
      title: `Latest scan: ${currentScan.score}/100`,
      detail: `${currentScan.totalIssues} findings in ${currentScan.sourcePath}`,
      tone: 'success',
    },
    scanStatus === 'failed' && {
      id: 'error',
      icon: <AlertTriangle size={15} />,
      title: 'Scan failed',
      detail: scanError,
      tone: 'danger',
    },
    {
      id: 'api',
      icon: <RadioTower size={15} />,
      title: 'FastAPI integration',
      detail: `Workspace updated ${formatDateTime(currentScan?.scannedAt)}`,
      tone: 'info',
    },
  ].filter(Boolean);

  return (
    <div className="dropdown notifications-menu">
      <div className="dropdown-heading">
        <strong>Notifications</strong>
        <button type="button" onClick={onClose}>Close</button>
      </div>
      {items.map((item) => (
        <div key={item.id} className={`notification-row notification-${item.tone}`}>
          {item.icon}
          <span>
            <strong>{item.title}</strong>
            <small>{item.detail}</small>
          </span>
        </div>
      ))}
    </div>
  );
}

export default NotificationsMenu;
