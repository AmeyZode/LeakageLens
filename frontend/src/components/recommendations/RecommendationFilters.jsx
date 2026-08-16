import React from 'react';
import SearchInput from '../common/SearchInput.jsx';
import Select from '../common/Select.jsx';

function RecommendationFilters({ query, setQuery, groupBy, setGroupBy, severity, setSeverity }) {
  return (
    <div className="filter-bar">
      <SearchInput value={query} onChange={setQuery} placeholder="Search recommendations" />
      <Select
        label="Group"
        value={groupBy}
        onChange={setGroupBy}
        options={[
          { value: 'severity', label: 'By severity' },
          { value: 'category', label: 'By category' },
          { value: 'file', label: 'By file' },
        ]}
      />
      <Select
        label="Severity"
        value={severity}
        onChange={setSeverity}
        options={[
          { value: 'all', label: 'All severities' },
          { value: 'critical', label: 'Critical' },
          { value: 'major', label: 'Major' },
          { value: 'minor', label: 'Minor' },
        ]}
      />
    </div>
  );
}

export default RecommendationFilters;
