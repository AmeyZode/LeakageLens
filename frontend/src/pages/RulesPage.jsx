import React from 'react';
import Card from '../components/common/Card.jsx';
import RuleCategorySummary from '../components/rules/RuleCategorySummary.jsx';
import RulesTable from '../components/rules/RulesTable.jsx';

function RulesPage() {
  return (
    <div className="rules-page page-stack">
      <RuleCategorySummary />
      <Card>
        <RulesTable />
      </Card>
    </div>
  );
}

export default RulesPage;
