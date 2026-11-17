/**
 * Loads static 5etools builder datasets: classes, species, and backgrounds.
 * Memory cached after first fetch.
 */

let cachedClasses = null;
let cachedSpecies = null;
let cachedBackgrounds = null;
let inflightPromise = null;

function getBaseUrl() {
  return typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : '';
}

export async function loadBuilderData() {
  if (cachedClasses && cachedSpecies && cachedBackgrounds) {
    return {
      classes: cachedClasses,
      species: cachedSpecies,
      backgrounds: cachedBackgrounds,
    };
  }

  if (inflightPromise) return inflightPromise;

  const base = getBaseUrl();

  inflightPromise = Promise.all([
    fetch(`${base}/data/classes.json`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
    fetch(`${base}/data/species.json`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
    fetch(`${base}/data/backgrounds.json`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
  ])
    .then(([classes, species, backgrounds]) => {
      cachedClasses = Array.isArray(classes) ? classes : [];
      cachedSpecies = Array.isArray(species) ? species : [];
      cachedBackgrounds = Array.isArray(backgrounds) ? backgrounds : [];
      return {
        classes: cachedClasses,
        species: cachedSpecies,
        backgrounds: cachedBackgrounds,
      };
    })
    .catch((err) => {
      if (typeof process === 'undefined' || process.env?.NODE_ENV !== 'test') {
        console.warn('Could not load builder data:', err);
      }
      cachedClasses = [];
      cachedSpecies = [];
      cachedBackgrounds = [];
      return {
        classes: [],
        species: [],
        backgrounds: [],
      };
    })
    .finally(() => {
      inflightPromise = null;
    });

  return inflightPromise;
}

export function getCachedClasses(edition = '2024') {
  if (!cachedClasses) return [];
  return cachedClasses.filter((c) => !edition || c.edition === edition);
}

export function getCachedSpecies(edition = '2024') {
  if (!cachedSpecies) return [];
  return cachedSpecies.filter((s) => !edition || s.edition === edition);
}

export function getCachedBackgrounds(edition = '2024') {
  if (!cachedBackgrounds) return [];
  return cachedBackgrounds.filter((b) => !edition || b.edition === edition);
}

export function resetBuilderDataCache() {
  cachedClasses = null;
  cachedSpecies = null;
  cachedBackgrounds = null;
  inflightPromise = null;
}
