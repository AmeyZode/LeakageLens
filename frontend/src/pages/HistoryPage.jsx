import React, { useMemo, useState } from 'react';
import { Play, RefreshCw, Trash2 } from 'lucide-react';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Select from '../components/common/Select.jsx';
import SearchInput from '../components/common/SearchInput.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import Badge from '../components/common/Badge.jsx';
import { useHistoryData } from '../context/HistoryContext.jsx';
import { formatDateTime, getScoreTone } from '../utils/formatters.js';

const PAGE_SIZE = 8;
const PENDING_SCAN_KEY = 'leakagelens_pending_scan';

function HistoryPage({ navigate }) {
  const { history, status, error, loadHistory, removeHistoryEntry } = useHistoryData();
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let rows = [...history];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter((row) => row.project_name?.toLowerCase().includes(q));
    }

    if (filter === 'critical') {
      rows = rows.filter((row) => (row.critical_count || 0) > 0);
    } else if (filter === 'stable') {
      rows = rows.filter((row) => (row.critical_count || 0) === 0);
    }

    rows.sort((a, b) => {
      if (sortBy === 'score-asc') return (a.score || 0) - (b.score || 0);
      if (sortBy === 'score-desc') return (b.score || 0) - (a.score || 0);
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      return new Date(b.date) - new Date(a.date);
    });

    return rows;
  }, [filter, history, query, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleReRun = (row) => {
    window.sessionStorage.setItem(PENDING_SCAN_KEY, row.project_name);
    navigate('/scanner');
  };

  const handleOpenReport = () => {
    navigate('/reports');
  };

  const handleDelete = async (row) => {
    await removeHistoryEntry(row.id);
  };

  if (status === 'loading') return <LoadingState label="Loading scan history" />;

  return (
    <div className="history-page page-stack">
      <div className="filter-bar">
        <SearchInput value={query} onChange={(value) => { setQuery(value); setPage(1); }} placeholder="Search projects" />
        <Select
          label="Sort"
          value={sortBy}
          onChange={(value) => { setSortBy(value); setPage(1); }}
          options={[
            { value: 'date-desc', label: 'Newest first' },
            { value: 'date-asc', label: 'Oldest first' },
            { value: 'score-desc', label: 'Highest score' },
            { value: 'score-asc', label: 'Lowest score' },
          ]}
        />
        <Select
          label="Filter"
          value={filter}
          onChange={(value) => { setFilter(value); setPage(1); }}
          options={[
            { value: 'all', label: 'All scans' },
            { value: 'critical', label: 'Has critical' },
            { value: 'stable', label: 'Stable only' },
          ]}
        />
        <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />} onClick={loadHistory}>
          Refresh
        </Button>
      </div>

      {error && <p className="error-copy" role="alert">{error}</p>}

      <Card compact>
        {!pageRows.length ? (
          <EmptyState title="No matching history" description="Adjust search or filters, or run a new scan." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Time</th>
                  <th>Score</th>
                  <th>Severity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr key={row.id || `${row.project_name}-${row.date}`}>
                    <td><strong>{row.project_name}</strong></td>
                    <td>{formatDateTime(row.date)}</td>
                    <td><Badge tone={getScoreTone(row.score)}>{row.score}/100</Badge></td>
                    <td>
                      <div className="severity-mini">
                        <Badge tone="danger">{row.critical_count || 0} C</Badge>
                        <Badge tone="warning">{row.major_count || 0} M</Badge>
                        <Badge tone="info">{row.minor_count || 0} m</Badge>
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenReport(row)}>Report</Button>
                        <Button variant="ghost" size="sm" icon={<Play size={14} />} onClick={() => handleReRun(row)}>Re-run</Button>
                        <Button variant="ghost" size="sm" icon={<Trash2 size={14} />} onClick={() => handleDelete(row)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {filtered.length > PAGE_SIZE && (
        <div className="pagination-bar">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span>Page {page} of {totalPages}</span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
