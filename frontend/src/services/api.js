const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request(path, options = {}) {
  const { method = 'GET', body, headers = {}, token } = options;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const detail = typeof data === 'object' && data !== null ? data.detail : data;
    throw new Error(detail || `Request failed with status ${response.status}`);
  }

  return data;
}

export function healthCheck() {
  return request('/api/health');
}

export function loginWithGoogleCredential(credential) {
  return request('/api/auth/google', {
    method: 'POST',
    body: { credential },
  });
}

export function scanProject({ path, aiProvider = 'fallback', apiKey = null, token }) {
  return request('/api/scan', {
    method: 'POST',
    token,
    body: {
      path,
      ai_provider: aiProvider,
      api_key: apiKey || null,
    },
  });
}

export function getHistory({ token } = {}) {
  return request('/api/history', { token });
}

export function createHistoryEntry({
  projectName,
  score,
  criticalCount,
  majorCount,
  minorCount,
  token,
}) {
  return request('/api/history', {
    method: 'POST',
    token,
    body: {
      project_name: projectName,
      score,
      critical_count: criticalCount,
      major_count: majorCount,
      minor_count: minorCount,
    },
  });
}

export function getRecommendation({ issue, aiProvider = 'fallback', apiKey = null, token }) {
  return request('/api/recommendation', {
    method: 'POST',
    token,
    body: {
      rule_id: issue.rule_id,
      rule_name: issue.rule_name,
      severity: issue.severity,
      file_path: issue.file_path,
      line_number: issue.line_number || 0,
      context_line: issue.context_line || '',
      description: issue.description || '',
      ai_provider: aiProvider,
      api_key: apiKey || null,
    },
  });
}
