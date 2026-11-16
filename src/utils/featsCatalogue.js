let cachedFeats = null;
let inflightPromise = null;

/**
 * Loads static 5etools feats catalogue on demand.
 * Cached in memory after first fetch.
 * Returns empty array on fetch failure so user can still type custom feats freely.
 */
export async function loadFeatsCatalogue() {
  if (cachedFeats) return cachedFeats;
  if (inflightPromise) return inflightPromise;

  const fetchUrl =
    typeof window !== 'undefined' && window.location?.origin
      ? `${window.location.origin}/data/feats.json`
      : '/data/feats.json';

  inflightPromise = fetch(fetchUrl)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => {
      cachedFeats = Array.isArray(data) ? data : [];
      return cachedFeats;
    })
    .catch((err) => {
      if (typeof process === 'undefined' || process.env?.NODE_ENV !== 'test') {
        console.warn('Could not load feats catalogue:', err);
      }
      cachedFeats = [];
      return cachedFeats;
    })
    .finally(() => {
      inflightPromise = null;
    });

  return inflightPromise;
}

/**
 * Synchronous getter for already-cached feats.
 */
export function getCachedFeatsCatalogue() {
  return cachedFeats || [];
}

/**
 * Clears memory cache (useful in tests).
 */
export function resetFeatsCatalogueCache() {
  cachedFeats = null;
  inflightPromise = null;
}

/**
 * Simple prefix + contains matcher for feats.
 * Prioritizes exact match, then startsWith, then includes, capped at `limit`.
 */
// ponytail: prefix + contains substring matcher covers 99% feat searches without heavy fuzzy index; add Fuse.js when user requests typo tolerance.
export function matchFeatSuggestions(query, feats, limit = 8) {
  if (!query || typeof query !== 'string') return [];
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length < 2) return [];

  const starts = [];
  const contains = [];

  for (const feat of feats) {
    if (!feat?.name) continue;
    const lower = feat.name.toLowerCase();
    if (lower === trimmed) {
      starts.unshift(feat);
    } else if (lower.startsWith(trimmed)) {
      starts.push(feat);
    } else if (lower.includes(trimmed)) {
      contains.push(feat);
    }
    if (starts.length >= limit) break;
  }

  return [...starts, ...contains].slice(0, limit);
}

const ALL_STAT_OPTIONS = [
  { value: 'str:1', label: '+1 STR' },
  { value: 'dex:1', label: '+1 DEX' },
  { value: 'con:1', label: '+1 CON' },
  { value: 'int:1', label: '+1 INT' },
  { value: 'wis:1', label: '+1 WIS' },
  { value: 'cha:1', label: '+1 CHA' },
  { value: 'str:2', label: '+2 STR' },
  { value: 'dex:2', label: '+2 DEX' },
  { value: 'con:2', label: '+2 CON' },
  { value: 'int:2', label: '+2 INT' },
  { value: 'wis:2', label: '+2 WIS' },
  { value: 'cha:2', label: '+2 CHA' },
];

/**
 * Parses a feat suggestion or typeLine into allowed stat modifier options and the default selection.
 * When a feat has an ASI in its typeLine (e.g. "+1 INT/WIS/CHA" or "+1 CHA"), defaults to the first allowed option!
 */
export function getFeatStatChoiceConfig(featOrTypeLine) {
  const typeLine =
    typeof featOrTypeLine === 'string'
      ? featOrTypeLine
      : featOrTypeLine?.typeLine || featOrTypeLine?.note?.split('\n')[0] || '';

  if (!typeLine || !typeLine.includes('+')) {
    return {
      hasCatalogAsi: false,
      defaultChoice: 'none',
      options: [{ value: 'none', label: 'None' }, ...ALL_STAT_OPTIONS],
    };
  }

  if (typeLine.includes('+2 Any Ability')) {
    return {
      hasCatalogAsi: true,
      defaultChoice: 'int:2',
      options: [{ value: 'none', label: 'None' }, ...ALL_STAT_OPTIONS],
    };
  }

  if (typeLine.includes('+1 Any Ability')) {
    const plusOneOpts = ALL_STAT_OPTIONS.filter((o) => o.value.endsWith(':1'));
    return {
      hasCatalogAsi: true,
      defaultChoice: plusOneOpts[0].value,
      options: [{ value: 'none', label: 'None' }, ...plusOneOpts],
    };
  }

  const match = typeLine.match(/\+(\d+)\s+([A-Z/]+)/);
  if (match) {
    const amt = Number(match[1]) || 1;
    const stats = match[2]
      .split('/')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => ['str', 'dex', 'con', 'int', 'wis', 'cha'].includes(s));

    if (stats.length > 0) {
      const allowed = stats.map((st) => ({
        value: `${st}:${amt}`,
        label: `+${amt} ${st.toUpperCase()}`,
      }));
      return {
        hasCatalogAsi: true,
        defaultChoice: allowed[0].value,
        options: [{ value: 'none', label: 'None' }, ...allowed],
      };
    }
  }

  return {
    hasCatalogAsi: false,
    defaultChoice: 'none',
    options: [{ value: 'none', label: 'None' }, ...ALL_STAT_OPTIONS],
  };
}

export function statChoiceToModifiers(choiceStr) {
  if (!choiceStr || choiceStr === 'none') return undefined;
  const [stat, amtStr] = choiceStr.split(':');
  const amt = Number(amtStr) || 1;
  if (!['str', 'dex', 'con', 'int', 'wis', 'cha'].includes(stat)) return undefined;
  return { [stat]: amt };
}

export function modifiersToStatChoice(statModifiers) {
  if (!statModifiers || typeof statModifiers !== 'object') return 'none';
  for (const [k, v] of Object.entries(statModifiers)) {
    if (['str', 'dex', 'con', 'int', 'wis', 'cha'].includes(k) && typeof v === 'number' && v > 0) {
      return `${k}:${v}`;
    }
  }
  return 'none';
}

export function formatFeatStatBadge(statModifiers) {
  if (!statModifiers || typeof statModifiers !== 'object') return '';
  const parts = [];
  for (const [k, v] of Object.entries(statModifiers)) {
    if (['str', 'dex', 'con', 'int', 'wis', 'cha'].includes(k) && typeof v === 'number' && v !== 0) {
      parts.push(`${v > 0 ? `+${v}` : v} ${k.toUpperCase()}`);
    }
  }
  return parts.join(', ');
}

