import { useMemo } from 'react';

/**
 * Pure filter function used by the hook and testable directly.
 */
export function filterSpells(spells = [], filters = {}) {
  const {
    search,
    level,
    school,
    className,
    concentration,
    ritual,
    compV,
    compS,
    compM,
    legacyMode = 'all', // 'all', 'modern', 'legacy'
    source = 'all',
    isHomebrewOnly = false,
  } = filters;
  const searchLower = (search || '').trim().toLowerCase();

  return spells.filter((spell) => {
    // 0. Source Filter
    if (source && source !== 'all') {
      if (spell.source?.toLowerCase() !== source.toLowerCase()) {
        return false;
      }
    }

    // 1. Homebrew Only filter
    if (isHomebrewOnly && spell.source !== 'Homebrew' && spell.source !== 'Custom') {
      return false;
    }

    // 2. Legacy / 2024 Version Filter
    if (legacyMode === 'modern' && spell.isLegacy) {
      return false;
    }
    if (legacyMode === 'legacy' && !spell.isLegacy) {
      return false;
    }

    // 3. Text Search (matches name, entries, school, source)
    if (searchLower) {
      const matchName = spell.name?.toLowerCase().includes(searchLower);
      const matchSchool = spell.school?.toLowerCase().includes(searchLower);
      const matchSource = spell.source?.toLowerCase().includes(searchLower);
      const matchEntries = spell.entries?.some((e) => e.toLowerCase().includes(searchLower));
      if (!matchName && !matchSchool && !matchSource && !matchEntries) {
        return false;
      }
    }

    // 2. Spell Level
    if (level !== undefined && level !== null && level !== 'all' && level !== '') {
      if (spell.level !== Number(level)) {
        return false;
      }
    }

    // 3. School
    if (school && school !== 'all') {
      const schoolMatch = spell.school?.toLowerCase() === school.toLowerCase();
      const specializationMatch = Array.isArray(spell.specializations)
        && spell.specializations.some((item) => item.toLowerCase() === school.toLowerCase());
      if (!schoolMatch && !specializationMatch) {
        return false;
      }
    }

    // 4. Class
    if (className && className !== 'all') {
      if (!Array.isArray(spell.classes) || !spell.classes.some((c) => c.toLowerCase() === className.toLowerCase())) {
        return false;
      }
    }

    // 5. Concentration
    if (concentration === true && !spell.concentration) {
      return false;
    }

    // 6. Ritual
    if (ritual === true && !spell.ritual) {
      return false;
    }

    // 7. Component Filters (V, S, M)
    if (compV === true && !spell.components?.v) {
      return false;
    }
    if (compS === true && !spell.components?.s) {
      return false;
    }
    if (compM === true && !spell.components?.m) {
      return false;
    }

    return true;
  });
}

/**
 * React hook for memoized spell filtering.
 */
export function useSpellFilter(spells, filters) {
  return useMemo(() => filterSpells(spells, filters), [spells, filters]);
}
