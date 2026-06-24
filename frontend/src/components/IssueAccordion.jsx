import React, { useState } from 'react';
import { ChevronRight, FileCode2, LineChart, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const SEVERITY_MAP = {
  critical: { label: 'CRITICAL', className: 'severity-critical' },
  high: { label: 'HIGH', className: 'severity-high' },
  major: { label: 'MEDIUM', className: 'severity-medium' },
  medium: { label: 'MEDIUM', className: 'severity-medium' },
  minor: { label: 'LOW', className: 'severity-low' },
  low: { label: 'LOW', className: 'severity-low' },
};

function normalizeSeverity(severity) {
  return SEVERITY_MAP[(severity || '').toLowerCase()] || SEVERITY_MAP.low;
}

function getFileName(filePath) {
  return filePath?.split(/[/\\]/).pop() || filePath || 'unknown';
}

function IssueAccordionItem({ issue, recommendation, defaultOpen, compact }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { label, className } = normalizeSeverity(issue.severity);

  const fixText =
    recommendation?.suggested_fix ||
    issue.suggested_fix ||
    recommendation?.explanation ||
    'No recommendation available.';

  const fileName = getFileName(issue.file_path);

  return (
    <motion.article
      className={`issue-accordion-item${isOpen ? ' open' : ''}${compact ? ' compact' : ''}`}
      layout
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
    >
      <button
        type="button"
        className="issue-accordion-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <span className={`issue-severity-badge ${className}`}>{label}</span>
        <span className="issue-accordion-summary">
          <span className="issue-accordion-name">{issue.rule_name}</span>
          <span className="issue-accordion-meta">
            <span>
              <FileCode2 size={13} aria-hidden="true" />
              {fileName}
            </span>
            <span>
              <LineChart size={13} aria-hidden="true" />
              Line {issue.line_number || '-'}
            </span>
          </span>
        </span>
        <ChevronRight className="issue-accordion-chevron" size={18} aria-hidden="true" />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="issue-accordion-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <dl className="issue-detail-grid">
              <div className="issue-detail-row issue-detail-row--full">
                <dt>Description</dt>
                <dd>{issue.description || 'No description provided.'}</dd>
              </div>

              {issue.context_line && (
                <div className="issue-detail-row issue-detail-row--full">
                  <dt>Code Context</dt>
                  <dd>
                    <pre className="issue-code-context">{issue.context_line}</pre>
                  </dd>
                </div>
              )}

              <div className="issue-detail-row issue-detail-row--full">
                <dt>
                  <Sparkles size={13} aria-hidden="true" />
                  Recommendation
                </dt>
                <dd className="issue-recommendation">{fixText}</dd>
              </div>

              {recommendation?.code_snippet && (
                <div className="issue-detail-row issue-detail-row--full">
                  <dt>Suggested Fix</dt>
                  <dd>
                    <pre className="issue-code-context">{recommendation.code_snippet}</pre>
                  </dd>
                </div>
              )}
            </dl>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function IssueAccordion({ issues = [], recommendations = {}, compact = false, maxItems }) {
  const visibleIssues = typeof maxItems === 'number' ? issues.slice(0, maxItems) : issues;

  if (!visibleIssues.length) {
    return (
      <div className="issue-accordion-empty">
        <p>No issues detected. Run a scan to analyze your ML project.</p>
      </div>
    );
  }

  return (
    <div className={`issue-accordion${compact ? ' issue-accordion--compact' : ''}`}>
      {visibleIssues.map((issue, index) => (
        <IssueAccordionItem
          key={`${issue.rule_id || issue.rule_name}-${issue.file_path}-${issue.line_number}-${index}`}
          issue={issue}
          recommendation={recommendations[issue.rule_id] || recommendations[`${issue.rule_id}-${index}`]}
          defaultOpen={!compact && index === 0}
          compact={compact}
        />
      ))}
    </div>
  );
}

export default IssueAccordion;
