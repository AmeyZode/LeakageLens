export const SEVERITY_ORDER = ['critical', 'major', 'minor'];

export const SEVERITY_META = {
  critical: {
    label: 'Critical',
    shortLabel: 'C',
    tone: 'danger',
    weight: 15,
    description: 'Direct leakage or high-impact reliability risk.',
  },
  major: {
    label: 'Major',
    shortLabel: 'M',
    tone: 'warning',
    weight: 10,
    description: 'Evaluation, reproducibility, or portability issue.',
  },
  minor: {
    label: 'Minor',
    shortLabel: 'm',
    tone: 'info',
    weight: 5,
    description: 'Quality or maintainability concern.',
  },
};

export function normalizeSeverity(severity) {
  const value = String(severity || '').toLowerCase();
  if (value === 'high') return 'critical';
  if (value === 'medium') return 'major';
  if (value === 'low') return 'minor';
  return SEVERITY_META[value] ? value : 'minor';
}

export function getSeverityMeta(severity) {
  return SEVERITY_META[normalizeSeverity(severity)];
}

export function sortIssuesBySeverity(issues = []) {
  return [...issues].sort((a, b) => {
    const severityDelta =
      SEVERITY_ORDER.indexOf(normalizeSeverity(a.severity)) -
      SEVERITY_ORDER.indexOf(normalizeSeverity(b.severity));

    if (severityDelta !== 0) return severityDelta;
    return (a.file_path || '').localeCompare(b.file_path || '');
  });
}
