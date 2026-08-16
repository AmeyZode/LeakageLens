import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Card from '../common/Card.jsx';
import SectionHeader from '../common/SectionHeader.jsx';
import IssueList from '../issues/IssueList.jsx';

function TopIssuesList({ issues = [], selectedIssueId, onSelectIssue }) {
  return (
    <Card>
      <SectionHeader icon={<AlertTriangle size={16} />} title="Top Issues" />
      <IssueList
        issues={issues}
        compact
        maxItems={5}
        selectedIssueId={selectedIssueId}
        onSelectIssue={onSelectIssue}
      />
    </Card>
  );
}

export default TopIssuesList;
