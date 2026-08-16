export const RULE_CATEGORIES = {
  L: { id: 'leakage', label: 'Data Leakage', accent: 'danger' },
  R: { id: 'reproducibility', label: 'Reproducibility', accent: 'blue' },
  E: { id: 'evaluation', label: 'Evaluation', accent: 'warning' },
  Q: { id: 'quality', label: 'Code Quality', accent: 'success' },
};

export const RULE_CATALOG = [
  {
    id: 'L001',
    name: 'Preprocessing Leakage',
    category: 'leakage',
    severity: 'critical',
    status: 'active',
    description: 'Detects preprocessing fit/transform executed before data splits.',
  },
  {
    id: 'L002',
    name: 'Overlap Leakage',
    category: 'leakage',
    severity: 'critical',
    status: 'placeholder',
    description: 'Reserved for train/test dataset overlap detection.',
  },
  {
    id: 'L003',
    name: 'Temporal Leakage',
    category: 'leakage',
    severity: 'major',
    status: 'placeholder',
    description: 'Reserved for random split detection in time-series pipelines.',
  },
  {
    id: 'L004',
    name: 'Feature Leakage',
    category: 'leakage',
    severity: 'critical',
    status: 'placeholder',
    description: 'Reserved for target-derived features in training inputs.',
  },
  {
    id: 'R001',
    name: 'Missing Random State',
    category: 'reproducibility',
    severity: 'major',
    status: 'active',
    description: 'Detects stochastic operations without fixed random_state or seed arguments.',
  },
  {
    id: 'R002',
    name: 'Missing Global Seed',
    category: 'reproducibility',
    severity: 'major',
    status: 'active',
    description: 'Detects projects without global seed initialization.',
  },
  {
    id: 'R003',
    name: 'Hardcoded Paths',
    category: 'reproducibility',
    severity: 'major',
    status: 'active',
    description: 'Detects hardcoded absolute file system paths.',
  },
  {
    id: 'E001',
    name: 'Evaluation on Train Data',
    category: 'evaluation',
    severity: 'major',
    status: 'active',
    description: 'Detects model evaluation directly on training data.',
  },
  {
    id: 'E002',
    name: 'Missing Validation Split',
    category: 'evaluation',
    severity: 'major',
    status: 'placeholder',
    description: 'Reserved for pipelines trained without validation splits.',
  },
  {
    id: 'E003',
    name: 'Metric Misuse',
    category: 'evaluation',
    severity: 'major',
    status: 'placeholder',
    description: 'Reserved for mismatched regression/classification metrics.',
  },
  {
    id: 'Q001',
    name: 'Unused Imports',
    category: 'quality',
    severity: 'minor',
    status: 'placeholder',
    description: 'Reserved for unused import detection.',
  },
  {
    id: 'Q002',
    name: 'Unused Variables',
    category: 'quality',
    severity: 'minor',
    status: 'placeholder',
    description: 'Reserved for unused variable detection.',
  },
  {
    id: 'Q003',
    name: 'High Complexity',
    category: 'quality',
    severity: 'minor',
    status: 'placeholder',
    description: 'Reserved for high-complexity function detection.',
  },
  {
    id: 'Q004',
    name: 'Missing Docstring',
    category: 'quality',
    severity: 'minor',
    status: 'placeholder',
    description: 'Reserved for missing function docstrings.',
  },
];

export function getRuleCategory(ruleId) {
  const prefix = String(ruleId || '').charAt(0).toUpperCase();
  return RULE_CATEGORIES[prefix]?.id || 'quality';
}

export function getRuleById(ruleId) {
  return RULE_CATALOG.find((rule) => rule.id === ruleId);
}

export function getCategoryLabel(categoryId) {
  return (
    Object.values(RULE_CATEGORIES).find((category) => category.id === categoryId)?.label ||
    'Code Quality'
  );
}
