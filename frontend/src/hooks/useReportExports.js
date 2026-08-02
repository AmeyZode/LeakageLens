import { useMemo } from 'react';
import { buildJsonReport, buildMarkdownReport } from '../utils/reportBuilders.js';

function downloadTextFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function useReportExports(scan) {
  const markdown = useMemo(() => buildMarkdownReport(scan), [scan]);
  const json = useMemo(() => buildJsonReport(scan), [scan]);

  return {
    markdown,
    json,
    downloadMarkdown: () => downloadTextFile('leakagelens-report.md', markdown, 'text/markdown'),
    downloadJson: () => downloadTextFile('leakagelens-report.json', json, 'application/json'),
  };
}
