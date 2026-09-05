import { getFileName } from './formatters.js';
import { getRuleCategory } from './ruleCatalog.js';
import { normalizeSeverity, sortIssuesBySeverity } from './severity.js';

function normalizeCounts(counts = {}, issues = []) {
  const derived = { critical: 0, major: 0, minor: 0 };

  issues.forEach((issue) => {
    const severity = normalizeSeverity(issue.severity);
    derived[severity] += 1;
  });

  return {
    critical: Number(counts.critical ?? derived.critical) || 0,
    major: Number(counts.major ?? derived.major) || 0,
    minor: Number(counts.minor ?? derived.minor) || 0,
  };
}

export function deriveRiskLevel(score, counts = {}) {
  if ((counts.critical || 0) > 0 || score < 50) return 'High';
  if ((counts.major || 0) >= 4 || score < 80) return 'Medium';
  return 'Low';
}

export function deriveHealthLabel(score) {
  if (score >= 85) return 'Healthy';
  if (score >= 60) return 'Watchlist';
  if (score >= 35) return 'At risk';
  return 'Critical';
}

export function normalizeIssue(issue = {}, index = 0) {
  const severity = normalizeSeverity(issue.severity);
  const category = getRuleCategory(issue.rule_id);
  const aiRecommendation = issue.ai_recommendation || {};
  const recommendationFix = aiRecommendation.fix || issue.suggested_fix || '';

  return {
    ...issue,
    id: `${issue.rule_id || 'RULE'}-${issue.file_path || 'file'}-${issue.line_number || 0}-${index}`,
    severity,
    category,
    fileName: getFileName(issue.file_path),
    ai_recommendation: aiRecommendation,
    recommendationExplanation: aiRecommendation.explanation || '',
    recommendationFix,
  };
}

export function normalizeScanResponse(raw = {}, sourcePath = '') {
  const rawIssues = Array.isArray(raw.issues) ? raw.issues : [];
  const issues = sortIssuesBySeverity(rawIssues.map(normalizeIssue));
  const counts = normalizeCounts(raw.counts, issues);
  const score = Number(raw.score ?? 0) || 0;
  const filesScanned = new Set(issues.map((issue) => issue.file_path).filter(Boolean)).size;
  const categoryCounts = issues.reduce(
    (acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    },
    { leakage: 0, reproducibility: 0, evaluation: 0, quality: 0 },
  );

  return {
    raw,
    sourcePath,
    score,
    riskScore: Math.max(0, 100 - score),
    riskLevel: deriveRiskLevel(score, counts),
    healthLabel: deriveHealthLabel(score),
    counts,
    categoryCounts,
    totalIssues: issues.length,
    filesScanned,
    issues,
    mlInsights: raw.ml_insights || { ml_risk_score: 0.0, confidence_label: 'CLEAN_PIPELINE', feature_importances: [] },
    scannedAt: new Date().toISOString(),
  };
}

export function buildHistoryPayload(scan) {
  return {
    projectName: scan.sourcePath || 'workspace',
    score: scan.score,
    criticalCount: scan.counts.critical,
    majorCount: scan.counts.major,
    minorCount: scan.counts.minor,
  };
}

export function emptyScan() {
  return normalizeScanResponse({ score: 100, counts: { critical: 0, major: 0, minor: 0 }, issues: [] });
}
