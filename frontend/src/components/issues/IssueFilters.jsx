import React from 'react';
import SearchInput from '../common/SearchInput.jsx';
import Select from '../common/Select.jsx';

function IssueFilters({ query, setQuery, severity, setSeverity, category, setCategory }) {
  return (
    <div className="filter-bar">
      <SearchInput value={query} onChange={setQuery} placeholder="Search issues" />
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
      <Select
        label="Category"
        value={category}
        onChange={setCategory}
        options={[
          { value: 'all', label: 'All categories' },
          { value: 'leakage', label: 'Data Leakage' },
          { value: 'reproducibility', label: 'Reproducibility' },
          { value: 'evaluation', label: 'Evaluation' },
          { value: 'quality', label: 'Code Quality' },
        ]}
      />
    </div>
  );
}

export default IssueFilters;
