export const STORAGE_KEYS = {
  USERS: 'attendly_users',
  SESSION: 'attendly_session',
  STUDENTS: 'attendly_students',
  ATTENDANCE: 'attendly_attendance',
  TEACHERS: 'attendly_teachers',
  DEPARTMENTS: 'attendly_departments',
  SUBJECTS: 'attendly_subjects',
  CLASSES: 'attendly_classes',
  ACTIVITY: 'attendly_activity',
  SETTINGS: 'attendly_settings',
  NOTIFICATIONS: 'attendly_notifications',
  SEEDED: 'attendly_seeded',
};

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function passwordStrength(password = '') {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  return { score, label: labels[score] || 'Weak', percent: (score / 4) * 100 };
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function downloadBlob(filename, content, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function euclideanDistance(a, b) {
  if (!a || !b || a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

/** Convert face-api distance to confidence percentage (lower distance = higher confidence). */
export function distanceToConfidence(distance, threshold = 0.5) {
  const conf = Math.max(0, Math.min(1, 1 - distance / (threshold * 1.4)));
  return Math.round(conf * 100);
}
