import React from 'react';
import { Search } from 'lucide-react';

function SearchInput({ value, onChange, placeholder = 'Search', className = '' }) {
  return (
    <label className={`search-input ${className}`.trim()}>
      <Search size={16} aria-hidden="true" />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

export default SearchInput;
