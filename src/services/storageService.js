import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  API_KEY: '@nfc_coder:api_key',
  HISTORY: '@nfc_coder:history',
  SETTINGS: '@nfc_coder:settings',
};

// ─── API Key ─────────────────────────────────────────────

export async function saveApiKey(key) {
  await AsyncStorage.setItem(KEYS.API_KEY, key.trim());
}

export async function getApiKey() {
  return AsyncStorage.getItem(KEYS.API_KEY);
}

export async function clearApiKey() {
  await AsyncStorage.removeItem(KEYS.API_KEY);
}

// ─── Scan History ─────────────────────────────────────────

export async function saveScan(problem, aiSolution = null) {
  const history = await getHistory();
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    problemId: problem.id,
    title: problem.title,
    icon: problem.icon,
    category: problem.category,
    severity: problem.severity,
    scannedAt: new Date().toISOString(),
    solved: false,
    aiSolution,
    meta: problem.meta ?? {},
  };
  const updated = [entry, ...history].slice(0, 100); // keep last 100
  await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
  return entry;
}

export async function getHistory() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function markSolved(entryId, solved = true) {
  const history = await getHistory();
  const updated = history.map((e) =>
    e.id === entryId ? { ...e, solved, solvedAt: solved ? new Date().toISOString() : null } : e
  );
  await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
}

export async function deleteHistoryEntry(entryId) {
  const history = await getHistory();
  const updated = history.filter((e) => e.id !== entryId);
  await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
}

export async function clearHistory() {
  await AsyncStorage.removeItem(KEYS.HISTORY);
}

// ─── Settings ─────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  hapticFeedback: true,
  autoOpenAi: true,
  theme: 'dark',
  demoMode: false,
};

export async function getSettings() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(partial) {
  const current = await getSettings();
  const updated = { ...current, ...partial };
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
  return updated;
}

// ─── Stats ────────────────────────────────────────────────

export async function getTodayStats() {
  const history = await getHistory();
  const today = new Date().toDateString();
  const todayEntries = history.filter(
    (e) => new Date(e.scannedAt).toDateString() === today
  );
  return {
    scanned: todayEntries.length,
    solved: todayEntries.filter((e) => e.solved).length,
    byCategory: todayEntries.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + 1;
      return acc;
    }, {}),
  };
}
