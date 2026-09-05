export const STORAGE_KEYS = {
  token: 'leakagelens_token',
  user: 'leakagelens_user',
  theme: 'leakagelens_theme',
  settings: 'leakagelens_settings',
  latestScan: 'leakagelens_latest_scan',
  sidebarCollapsed: 'leakagelens_sidebar_collapsed',
  groqApiKey: 'leakagelens_groq_api_key',
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
  { value: 'groq', label: 'Groq AI (Llama 3.3 70B)', supported: true },
  { value: 'fallback', label: 'Fallback templates', supported: true },
  { value: 'openai', label: 'OpenAI (GPT-4o)', supported: true },
  { value: 'ollama', label: 'Ollama URL', supported: false },
];
