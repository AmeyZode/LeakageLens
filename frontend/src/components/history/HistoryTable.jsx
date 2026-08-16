import React from 'react';
import { ExternalLink, History } from 'lucide-react';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';
import EmptyState from '../common/EmptyState.jsx';
import LoadingState from '../common/LoadingState.jsx';
import { formatDateTime, getScoreTone } from '../../utils/formatters.js';

function HistoryTable({ history = [], status = 'idle', onOpenReport, compact = false }) {
  if (status === 'loading') return <LoadingState label="Loading scan history" />;

  if (!history.length) {
    return (
      <EmptyState
        icon={<History size={24} />}
        title="No scan history"
        description="Completed scans are saved through the backend history endpoint."
      />
    );
  }

  const visibleRows = compact ? history.slice(0, 5) : history;

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Time</th>
            <th>Score</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Report</th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row) => (
            <tr key={row.id || `${row.project_name}-${row.date}`}>
              <td>
                <strong>{row.project_name}</strong>
              </td>
              <td>{formatDateTime(row.date)}</td>
              <td>
                <Badge tone={getScoreTone(row.score)}>{row.score}/100</Badge>
              </td>
              <td>
                <div className="severity-mini">
                  <Badge tone="danger">{row.critical_count || 0} C</Badge>
                  <Badge tone="warning">{row.major_count || 0} M</Badge>
                  <Badge tone="info">{row.minor_count || 0} m</Badge>
                </div>
              </td>
              <td>
                <Badge tone={(row.critical_count || 0) > 0 ? 'danger' : 'success'}>
                  {(row.critical_count || 0) > 0 ? 'Action needed' : 'Stable'}
                </Badge>
              </td>
              <td>
                <Button variant="ghost" size="sm" icon={<ExternalLink size={14} />} onClick={() => onOpenReport?.(row)}>
                  Open
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HistoryTable;
