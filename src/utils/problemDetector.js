import { PROBLEMS, PROBLEM_KEYWORDS, ALL_PROBLEM_IDS } from '../data/problemDatabase';

/**
 * Parse raw NFC tag payload into a structured problem record.
 *
 * Supported tag formats:
 *   1. Plain problem ID:          "git-conflict"
 *   2. Prefixed:                  "problem:git-conflict"
 *   3. URL scheme:                "coder-nfc://problem/git-conflict?lang=js"
 *   4. JSON:                      {"type":"git-conflict","lang":"javascript"}
 *   5. Free text / error message: "Cannot read properties of null"
 */
export function detectProblem(rawPayload) {
  if (!rawPayload || typeof rawPayload !== 'string') return null;

  const normalized = rawPayload.trim();

  // 1. Try JSON
  const fromJson = tryParseJson(normalized);
  if (fromJson) return fromJson;

  // 2. Try URL scheme
  const fromUrl = tryParseUrl(normalized);
  if (fromUrl) return fromUrl;

  // 3. Try plain / prefixed problem ID
  const fromId = tryParseId(normalized);
  if (fromId) return fromId;

  // 4. Try keyword matching on free text
  const fromKeywords = tryKeywordMatch(normalized);
  if (fromKeywords) return fromKeywords;

  return null;
}

function tryParseJson(text) {
  try {
    const obj = JSON.parse(text);
    const id = obj.type || obj.problem || obj.id;
    if (id && PROBLEMS[id]) {
      return { ...PROBLEMS[id], meta: { lang: obj.lang, context: obj.context } };
    }
  } catch {
    // not JSON
  }
  return null;
}

function tryParseUrl(text) {
  try {
    if (!text.includes('://')) return null;
    const url = new URL(text.startsWith('coder-nfc://') ? text.replace('coder-nfc://', 'https://') : text);
    const segments = url.pathname.split('/').filter(Boolean);
    const id = segments[segments.length - 1];
    if (id && PROBLEMS[id]) {
      const lang = url.searchParams.get('lang');
      const context = url.searchParams.get('context');
      return { ...PROBLEMS[id], meta: { lang, context } };
    }
  } catch {
    // not a parseable URL
  }
  return null;
}

function tryParseId(text) {
  const cleaned = text.replace(/^problem:/i, '').trim().toLowerCase();
  if (PROBLEMS[cleaned]) {
    return { ...PROBLEMS[cleaned], meta: {} };
  }
  return null;
}

function tryKeywordMatch(text) {
  const lower = text.toLowerCase();
  for (const [keyword, problemId] of Object.entries(PROBLEM_KEYWORDS)) {
    if (lower.includes(keyword)) {
      return { ...PROBLEMS[problemId], meta: { matchedKeyword: keyword } };
    }
  }
  return null;
}

/** Return a random problem (used for demo/simulation mode). */
export function randomProblem() {
  const id = ALL_PROBLEM_IDS[Math.floor(Math.random() * ALL_PROBLEM_IDS.length)];
  return { ...PROBLEMS[id], meta: { simulated: true } };
}

/** Format a problem category + severity label. */
export function problemLabel(problem) {
  return `${problem.category} · ${problem.severity}`;
}
