export function formatDateTime(value) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatScore(score) {
  const value = Number.isFinite(Number(score)) ? Number(score) : 0;
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

export function getScoreTone(score) {
  const value = Number(score) || 0;
  if (value >= 80) return 'success';
  if (value >= 50) return 'warning';
  return 'danger';
}

export function getFileName(filePath) {
  if (!filePath) return 'unknown';
  return String(filePath).split(/[/\\]/).pop() || filePath;
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function compactPath(filePath, maxLength = 42) {
  if (!filePath || filePath.length <= maxLength) return filePath || 'unknown';
  const fileName = getFileName(filePath);
  const prefixLength = Math.max(8, maxLength - fileName.length - 4);
  return `${filePath.slice(0, prefixLength)}...${fileName}`;
}
