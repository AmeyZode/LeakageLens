import { useMemo } from 'react';

export function useDerivedScanMetrics(scan) {
  return useMemo(() => {
    if (!scan) {
      return {
        hasScan: false,
        severityData: [],
        categoryData: [],
        topIssues: [],
        recommendations: [],
      };
    }

    const severityData = [
      { name: 'Critical', value: scan.counts.critical, key: 'critical' },
      { name: 'Major', value: scan.counts.major, key: 'major' },
      { name: 'Minor', value: scan.counts.minor, key: 'minor' },
    ].filter((item) => item.value > 0);

    const categoryData = [
      { name: 'Data Leakage', value: scan.categoryCounts.leakage || 0, key: 'leakage' },
      { name: 'Reproducibility', value: scan.categoryCounts.reproducibility || 0, key: 'reproducibility' },
      { name: 'Evaluation', value: scan.categoryCounts.evaluation || 0, key: 'evaluation' },
      { name: 'Code Quality', value: scan.categoryCounts.quality || 0, key: 'quality' },
    ].filter((item) => item.value > 0);

    const recommendations = scan.issues
      .filter((issue) => issue.recommendationExplanation || issue.recommendationFix)
      .slice(0, 6);

    return {
      hasScan: true,
      severityData,
      categoryData,
      topIssues: scan.issues.slice(0, 5),
      recommendations,
    };
  }, [scan]);
}
