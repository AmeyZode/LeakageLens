import React from 'react';
import { RULE_CATALOG } from '../../utils/ruleCatalog.js';
import MetricCard from '../common/MetricCard.jsx';
import { CheckCircle2, Clock3, ShieldAlert, SlidersHorizontal } from 'lucide-react';

function RuleCategorySummary() {
  const active = RULE_CATALOG.filter((rule) => rule.status === 'active').length;
  const placeholders = RULE_CATALOG.length - active;
  const critical = RULE_CATALOG.filter((rule) => rule.severity === 'critical').length;

  return (
    <div className="metric-grid">
      <MetricCard title="Rules" value={RULE_CATALOG.length} description="Registered in ALL_RULES" tone="blue" icon={<SlidersHorizontal size={21} />} />
      <MetricCard title="Active" value={active} description="Emit issues today" tone="success" icon={<CheckCircle2 size={21} />} />
      <MetricCard title="Placeholders" value={placeholders} description="Reserved detector classes" tone="warning" icon={<Clock3 size={21} />} />
      <MetricCard title="Critical Rules" value={critical} description="Highest severity coverage" tone="danger" icon={<ShieldAlert size={21} />} />
    </div>
  );
}

export default RuleCategorySummary;
