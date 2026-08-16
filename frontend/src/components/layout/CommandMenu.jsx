import React, { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useUI } from '../../context/UIContext.jsx';
import { NAV_ROUTES } from '../../routes/routeConfig.js';

function CommandMenu({ navigate }) {
  const { commandMenuOpen, setCommandMenuOpen } = useUI();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandMenuOpen((value) => !value);
      }
      if (event.key === 'Escape') setCommandMenuOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandMenuOpen]);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return NAV_ROUTES.filter((route) => {
      if (!normalized) return true;
      return `${route.label} ${route.title} ${route.subtitle}`.toLowerCase().includes(normalized);
    });
  }, [query]);

  if (!commandMenuOpen) return null;

  const handleSelect = (path) => {
    navigate(path);
    setCommandMenuOpen(false);
    setQuery('');
  };

  return (
    <div className="modal-backdrop" onMouseDown={() => setCommandMenuOpen(false)}>
      <div className="command-menu" onMouseDown={(event) => event.stopPropagation()}>
        <div className="command-input">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pages and workflows"
            autoFocus
          />
          <button type="button" onClick={() => setCommandMenuOpen(false)} aria-label="Close search">
            <X size={16} />
          </button>
        </div>
        <div className="command-results">
          {results.map((route) => (
            <button key={route.path} type="button" onClick={() => handleSelect(route.path)}>
              <strong>{route.label}</strong>
              <span>{route.subtitle}</span>
            </button>
          ))}
          {!results.length && <p>No matching pages.</p>}
        </div>
      </div>
    </div>
  );
}

export default CommandMenu;
