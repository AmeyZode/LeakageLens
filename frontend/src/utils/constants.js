export const STORAGE_KEYS = {
  token: 'leakagelens_token',
  user: 'leakagelens_user',
  theme: 'leakagelens_theme',
  settings: 'leakagelens_settings',
  latestScan: 'leakagelens_latest_scan',
  sidebarCollapsed: 'leakagelens_sidebar_collapsed',
};

export const DEFAULT_SCAN_PATH = 'sample_projects';

export const SCAN_STAGES = [
  { id: 'idle', label: 'Ready', progress: 0 },
  { id: 'queued', label: 'Queued', progress: 12 },
  { id: 'validating', label: 'Validating path', progress: 26 },
  { id: 'scanning', label: 'Running analyzer', progress: 58 },
  { id: 'recommendations', label: 'Generating recommendations', progress: 82 },
  { id: 'complete', label: 'Complete', progress: 100 },
  { id: 'failed', label: 'Failed', progress: 100 },
];

export const PROVIDERS = [
  { value: 'grok', label: 'Grok (xAI) — Inbuilt Backend AI', supported: true, inbuilt: true },
  { value: 'fallback', label: 'Fallback templates', supported: true, inbuilt: true },
  { value: 'openai', label: 'OpenAI (Custom Key)', supported: true, inbuilt: false },
  { value: 'ollama', label: 'Ollama URL', supported: false, inbuilt: false },
];
