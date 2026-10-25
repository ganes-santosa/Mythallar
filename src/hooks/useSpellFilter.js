import { useMemo } from 'react';

/**
 * Pure filter function used by the hook and testable directly.
 */
export function filterSpells(spells = [], filters = {}) {
  const { search, level, school, className, concentration, ritual, compV, compS, compM } = filters;
  const searchLower = (search || '').trim().toLowerCase();

  return spells.filter((spell) => {
    // 1. Text Search (matches name, entries, school)
    if (searchLower) {
      const matchName = spell.name?.toLowerCase().includes(searchLower);
      const matchSchool = spell.school?.toLowerCase().includes(searchLower);
      const matchEntries = spell.entries?.some((e) => e.toLowerCase().includes(searchLower));
      if (!matchName && !matchSchool && !matchEntries) {
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
      if (spell.school?.toLowerCase() !== school.toLowerCase()) {
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
