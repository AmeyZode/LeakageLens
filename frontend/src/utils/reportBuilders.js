import { formatDateTime } from './formatters.js';
import { getCategoryLabel } from './ruleCatalog.js';

function fencedCode(value) {
  return `\`\`\`python\n${value || '# No fix available'}\n\`\`\``;
}

export function buildMarkdownReport(scan) {
  if (!scan) return '# LeakageLens Audit Report\n\nNo scan result is available.';

  const lines = [
    '# LeakageLens Audit Report',
    '',
    `**Project:** ${scan.sourcePath || 'workspace'}`,
    `**Generated:** ${formatDateTime(scan.scannedAt)}`,
    `**Health Score:** ${scan.score}/100`,
    `**Risk Level:** ${scan.riskLevel}`,
    '',
    '## Summary of Issues',
    `- **Critical:** ${scan.counts.critical}`,
    `- **Major:** ${scan.counts.major}`,
    `- **Minor:** ${scan.counts.minor}`,
    `- **Files With Findings:** ${scan.filesScanned}`,
    '',
    '## Category Breakdown',
    `- **Data Leakage:** ${scan.categoryCounts.leakage || 0}`,
    `- **Reproducibility:** ${scan.categoryCounts.reproducibility || 0}`,
    `- **Evaluation:** ${scan.categoryCounts.evaluation || 0}`,
    `- **Code Quality:** ${scan.categoryCounts.quality || 0}`,
    '',
    '## Detailed Issues',
    '',
  ];

  if (!scan.issues.length) {
    lines.push('No issues detected.');
    return lines.join('\n');
  }

  scan.issues.forEach((issue, index) => {
    lines.push(`### ${index + 1}. ${issue.rule_name} (${issue.severity.toUpperCase()})`);
    lines.push(`- **Rule:** ${issue.rule_id}`);
    lines.push(`- **Category:** ${getCategoryLabel(issue.category)}`);
    lines.push(`- **File:** \`${issue.file_path}\``);
    lines.push(`- **Line:** ${issue.line_number || '-'}`);
    lines.push(`- **Description:** ${issue.description || 'No description provided.'}`);
    if (issue.context_line) lines.push(`- **Code Context:** \`${issue.context_line}\``);
    if (issue.suggested_fix) lines.push(`- **Suggested Fix:** ${issue.suggested_fix}`);
    if (issue.recommendationExplanation) {
      lines.push(`- **AI Explanation:** ${issue.recommendationExplanation}`);
    }
    lines.push('');
    lines.push('**AI Fix Recommendation:**');
    lines.push(fencedCode(issue.recommendationFix));
    lines.push('');
  });

  return lines.join('\n');
}

export function buildJsonReport(scan) {
  if (!scan) return JSON.stringify({ error: 'No scan result is available.' }, null, 2);

  return JSON.stringify(
    {
      score: scan.score,
      counts: scan.counts,
      source_path: scan.sourcePath,
      scanned_at: scan.scannedAt,
      derived: {
        risk_score: scan.riskScore,
        risk_level: scan.riskLevel,
        health_label: scan.healthLabel,
        files_with_findings: scan.filesScanned,
        category_counts: scan.categoryCounts,
      },
      issues: scan.issues.map((issue) => ({
        rule_id: issue.rule_id,
        rule_name: issue.rule_name,
        severity: issue.severity,
        category: issue.category,
        file_path: issue.file_path,
        line_number: issue.line_number,
        context_line: issue.context_line,
        description: issue.description,
        suggested_fix: issue.suggested_fix,
        ai_recommendation: issue.ai_recommendation,
      })),
    },
    null,
    2,
  );
}
