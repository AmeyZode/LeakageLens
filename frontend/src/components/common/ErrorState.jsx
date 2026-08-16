import React from 'react';
import { AlertTriangle } from 'lucide-react';

function ErrorState({ message, action }) {
  return (
    <div className="error-state" role="alert">
      <AlertTriangle size={18} aria-hidden="true" />
      <span>{message}</span>
      {action}
    </div>
  );
}

export default ErrorState;
