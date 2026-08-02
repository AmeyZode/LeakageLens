import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import EmptyState from '../common/EmptyState.jsx';
import { ShieldCheck } from 'lucide-react';

const COLORS = {
  critical: '#ff5d5d',
  major: '#ffae3d',
  minor: '#2997ff',
  leakage: '#ff5d5d',
  reproducibility: '#2997ff',
  evaluation: '#ffae3d',
  quality: '#22c785',
};

function SeverityDonutChart({ data = [], centerLabel = 'Issues' }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (!total) {
    return (
      <EmptyState
        icon={<ShieldCheck size={24} />}
        title="No findings"
        description="Severity distribution appears after a scan returns issues."
      />
    );
  }

  return (
    <div className="donut-layout">
      <div className="donut-wrap">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
            >
              {data.map((item) => (
                <Cell key={item.key || item.name} fill={COLORS[item.key] || '#7c5cff'} />
              ))}
            </Pie>
            <Tooltip
              cursor={false}
              contentStyle={{
                background: 'var(--panel-strong)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center">
          <strong>{total}</strong>
          <span>{centerLabel}</span>
        </div>
      </div>
      <div className="legend-list">
        {data.map((item) => (
          <div key={item.key || item.name} className="legend-row">
            <span>
              <i style={{ backgroundColor: COLORS[item.key] || '#7c5cff' }} />
              {item.name}
            </span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SeverityDonutChart;
