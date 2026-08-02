import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import IconButton from './IconButton.jsx';

function CopyButton({ value, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value || '');
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <IconButton
      icon={copied ? <Check size={16} /> : <Copy size={16} />}
      label={copied ? 'Copied' : label}
      onClick={handleCopy}
      variant="subtle"
    />
  );
}

export default CopyButton;
