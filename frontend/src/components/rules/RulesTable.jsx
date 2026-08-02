import React from 'react';
import Badge from '../common/Badge.jsx';
import { getCategoryLabel, RULE_CATALOG } from '../../utils/ruleCatalog.js';

function RulesTable() {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Rule</th>
            <th>Category</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {RULE_CATALOG.map((rule) => (
            <tr key={rule.id}>
              <td>
                <strong>{rule.id}</strong>
                <small>{rule.name}</small>
              </td>
              <td>{getCategoryLabel(rule.category)}</td>
              <td>
                <Badge tone={rule.severity === 'critical' ? 'danger' : rule.severity === 'major' ? 'warning' : 'info'}>
                  {rule.severity}
                </Badge>
              </td>
              <td>
                <Badge tone={rule.status === 'active' ? 'success' : 'neutral'}>
                  {rule.status === 'active' ? 'Active' : 'Placeholder'}
                </Badge>
              </td>
              <td>{rule.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RulesTable;
