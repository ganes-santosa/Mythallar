let cachedItems = null;
let inflightPromise = null;

/**
 * Loads static 5etools items catalogue on demand.
 * Cached in memory after first fetch.
 * Returns empty array on fetch failure so user can still type custom items freely.
 */
export async function loadItemsCatalogue() {
  if (cachedItems) return cachedItems;
  if (inflightPromise) return inflightPromise;

  const fetchUrl =
    typeof window !== 'undefined' && window.location?.origin
      ? `${window.location.origin}/data/items.json`
      : '/data/items.json';

  inflightPromise = fetch(fetchUrl)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => {
      cachedItems = Array.isArray(data) ? data : [];
      return cachedItems;
    })
    .catch((err) => {
      // Quiet warning in test runner
      if (typeof process === 'undefined' || process.env?.NODE_ENV !== 'test') {
        console.warn('Could not load items catalogue:', err);
      }
      cachedItems = [];
      return cachedItems;
    })
    .finally(() => {
      inflightPromise = null;
    });

  return inflightPromise;
}

/**
 * Synchronous getter for already-cached items.
 */
export function getCachedItemsCatalogue() {
  return cachedItems || [];
}

/**
 * Clears memory cache (useful in tests).
 */
export function resetItemsCatalogueCache() {
  cachedItems = null;
  inflightPromise = null;
}

/**
 * Simple prefix + contains matcher for items.
 * Prioritizes startsWith, then includes, capped at `limit`.
 */
// ponytail: prefix + contains substring matcher covers 99% item searches without heavy fuzzy index; add Fuse.js when user requests typo tolerance.
export function matchItemSuggestions(query, items, limit = 8) {
  if (!query || typeof query !== 'string') return [];
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length < 2) return [];

  const starts = [];
  const contains = [];

  for (const item of items) {
    if (!item?.name) continue;
    const lower = item.name.toLowerCase();
    if (lower === trimmed) {
      starts.unshift(item);
    } else if (lower.startsWith(trimmed)) {
      starts.push(item);
    } else if (lower.includes(trimmed)) {
      contains.push(item);
    }
    if (starts.length >= limit) break;
  }

  return [...starts, ...contains].slice(0, limit);
}
