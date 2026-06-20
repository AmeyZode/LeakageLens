import React, { useState } from 'react';

const SEVERITY_CLASS = {
  critical: 'severity-critical',
  high: 'severity-high',
  major: 'severity-major',
  minor: 'severity-minor',
};

function normalizeSeverity(severity) {
  const key = (severity || '').toLowerCase();
  if (key === 'critical') return { label: 'CRITICAL', className: SEVERITY_CLASS.critical };
  if (key === 'high' || key === 'major') return { label: 'HIGH', className: SEVERITY_CLASS.high };
  return { label: 'MINOR', className: SEVERITY_CLASS.minor };
}

function IssueAccordionItem({ issue, recommendation, defaultOpen, index }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { label, className } = normalizeSeverity(issue.severity);

  const fixText =
    recommendation?.suggested_fix ||
    issue.suggested_fix ||
    recommendation?.explanation ||
    'No recommendation available.';

  const fileName = issue.file_path?.split(/[/\\]/).pop() || issue.file_path;

  return (
    <div className={`issue-accordion-item${isOpen ? ' open' : ''}`}>
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
            <span>{fileName}</span>
            <span className="issue-accordion-meta-divider">•</span>
            <span>line {issue.line_number}</span>
          </span>
        </span>
        <span className="issue-accordion-chevron" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="issue-accordion-panel">
          <dl className="issue-detail-grid">
            <div className="issue-detail-row">
              <dt>Severity</dt>
              <dd>
                <span className={`issue-severity-badge ${className}`}>{label}</span>
              </dd>
            </div>
            <div className="issue-detail-row">
              <dt>Rule</dt>
              <dd>{issue.rule_name}</dd>
            </div>
            <div className="issue-detail-row">
              <dt>File</dt>
              <dd>
                <code>{fileName}</code>
              </dd>
            </div>
            <div className="issue-detail-row">
              <dt>Line</dt>
              <dd>
                <code>{issue.line_number}</code>
              </dd>
            </div>
            <div className="issue-detail-row issue-detail-row--full">
              <dt>Description</dt>
              <dd>{issue.description}</dd>
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
              <dt>Recommendation</dt>
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
        </div>
      )}
    </div>
  );
}

function IssueAccordion({ issues = [], recommendations = {} }) {
  if (!issues.length) {
    return (
      <div className="issue-accordion-empty">
        <p>No issues detected. Run a scan to analyze your ML project.</p>
      </div>
    );
  }

  return (
    <div className="issue-accordion">
      {issues.map((issue, index) => (
        <IssueAccordionItem
          key={`${issue.rule_id}-${issue.file_path}-${issue.line_number}-${index}`}
          issue={issue}
          recommendation={recommendations[issue.rule_id] || recommendations[`${issue.rule_id}-${index}`]}
          defaultOpen={index === 0}
          index={index}
        />
      ))}
    </div>
  );
}

export default IssueAccordion;
