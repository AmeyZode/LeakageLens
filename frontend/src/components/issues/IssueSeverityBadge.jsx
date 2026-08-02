import React from 'react';
import Badge from '../common/Badge.jsx';
import { getSeverityMeta } from '../../utils/severity.js';

function IssueSeverityBadge({ severity }) {
  const meta = getSeverityMeta(severity);
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export default IssueSeverityBadge;
