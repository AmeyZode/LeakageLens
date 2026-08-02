import React, { useState } from 'react';
import { CheckCircle2, Save } from 'lucide-react';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Select from '../components/common/Select.jsx';
import Toggle from '../components/common/Toggle.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { PROVIDERS } from '../utils/constants.js';

function SettingsPage() {
  const {
    theme,
    setTheme,
    aiProvider,
    openAiKey,
    ollamaUrl,
    defaultScanPath,
    autoOpenReport,
    compactDensity,
    updateSetting,
  } = useSettings();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-page page-stack">
      <Card>
        <h2 className="settings-section-title">Appearance</h2>
        <Select
          label="Theme"
          value={theme}
          onChange={(value) => setTheme(value)}
          options={[
            { value: 'dark', label: 'Dark' },
            { value: 'light', label: 'Light' },
          ]}
        />
        <Toggle
          label="Compact density"
          description="Tighter spacing across tables and cards."
          checked={compactDensity}
          onChange={(value) => updateSetting('compactDensity', value)}
        />
      </Card>

      <Card>
        <h2 className="settings-section-title">AI Provider</h2>
        <Select
          label="Provider"
          value={aiProvider}
          onChange={(value) => updateSetting('aiProvider', value)}
          options={PROVIDERS.map((provider) => ({
            value: provider.value,
            label: provider.label,
            disabled: !provider.supported,
          }))}
        />
        <label className="field">
          <span>OpenAI API Key</span>
          <input
            type="password"
            value={openAiKey}
            onChange={(event) => updateSetting('openAiKey', event.target.value)}
            placeholder="sk-..."
          />
        </label>
        <label className="field">
          <span>Ollama URL</span>
          <input
            type="url"
            value={ollamaUrl}
            onChange={(event) => updateSetting('ollamaUrl', event.target.value)}
            placeholder="http://localhost:11434"
            disabled={aiProvider !== 'ollama'}
          />
        </label>
      </Card>

      <Card>
        <h2 className="settings-section-title">Scanner Preferences</h2>
        <label className="field">
          <span>Default project path</span>
          <input
            value={defaultScanPath}
            onChange={(event) => updateSetting('defaultScanPath', event.target.value)}
            placeholder="sample_projects"
          />
        </label>
        <Toggle
          label="Auto-open report after scan"
          description="Navigate to Reports when a scan completes."
          checked={autoOpenReport}
          onChange={(value) => updateSetting('autoOpenReport', value)}
        />
      </Card>

      <Card>
        <h2 className="settings-section-title">API</h2>
        <label className="field">
          <span>API URL</span>
          <input
            value={import.meta.env.VITE_API_URL || '(proxy via Vite dev server)'}
            readOnly
            disabled
          />
        </label>
        <p className="muted-copy">
          Configure <code>VITE_API_URL</code> in your environment to point at a remote FastAPI backend.
        </p>
        <Button variant="primary" icon={saved ? <CheckCircle2 size={16} /> : <Save size={16} />} onClick={handleSave}>
          {saved ? 'Saved' : 'Save preferences'}
        </Button>
      </Card>
    </div>
  );
}

export default SettingsPage;
