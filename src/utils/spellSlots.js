// Standard 5e Full Caster Spell Slots Table (Level 1 - 20)
const FULL_CASTER_TABLE = {
  1: { 1: 2 },
  2: { 1: 3 },
  3: { 1: 4, 2: 2 },
  4: { 1: 4, 2: 3 },
  5: { 1: 4, 2: 3, 3: 2 },
  6: { 1: 4, 2: 3, 3: 3 },
  7: { 1: 4, 2: 3, 3: 3, 4: 1 },
  8: { 1: 4, 2: 3, 3: 3, 4: 2 },
  9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
  11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
  12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
  13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
  14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
  15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
  16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
  17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
  18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },
  19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
  20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 },
};

// Half Caster Progression (Paladin, Ranger)
const HALF_CASTER_TABLE = {
  1: {},
  2: { 1: 2 },
  3: { 1: 3 },
  4: { 1: 3 },
  5: { 1: 4, 2: 2 },
  6: { 1: 4, 2: 2 },
  7: { 1: 4, 2: 3 },
  8: { 1: 4, 2: 3 },
  9: { 1: 4, 2: 3, 3: 2 },
  10: { 1: 4, 2: 3, 3: 2 },
  11: { 1: 4, 2: 3, 3: 3 },
  12: { 1: 4, 2: 3, 3: 3 },
  13: { 1: 4, 2: 3, 3: 3, 4: 1 },
  14: { 1: 4, 2: 3, 3: 3, 4: 1 },
  15: { 1: 4, 2: 3, 3: 3, 4: 2 },
  16: { 1: 4, 2: 3, 3: 3, 4: 2 },
  17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
  20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
};

// Warlock Pact Magic Progression
const WARLOCK_TABLE = {
  1: { 1: 1 },
  2: { 1: 2 },
  3: { 2: 2 },
  4: { 2: 2 },
  5: { 3: 2 },
  6: { 3: 2 },
  7: { 4: 2 },
  8: { 4: 2 },
  9: { 5: 2 },
  10: { 5: 2 },
  11: { 5: 3 },
  12: { 5: 3 },
  13: { 5: 3 },
  14: { 5: 3 },
  15: { 5: 3 },
  16: { 5: 3 },
  17: { 5: 4 },
  18: { 5: 4 },
  19: { 5: 4 },
  20: { 5: 4 },
};

export const FULL_CASTERS = new Set(['Wizard', 'Cleric', 'Druid', 'Sorcerer', 'Bard']);
export const HALF_CASTERS = new Set(['Paladin', 'Ranger']);

/**
 * Calculates default max spell slots per level for a given class and character level (1-20).
 * Returns Record<number, number> e.g. { 1: 4, 2: 3, 3: 2 }
 */
export function calculateDefaultSlots(className, level) {
  const lvl = Math.min(20, Math.max(1, Number(level) || 1));
  const normClass = className ? className.trim() : '';

  if (FULL_CASTERS.has(normClass)) {
    return { ...FULL_CASTER_TABLE[lvl] };
  }

  if (HALF_CASTERS.has(normClass)) {
    return { ...HALF_CASTER_TABLE[lvl] };
  }

  if (normClass === 'Warlock') {
    return { ...WARLOCK_TABLE[lvl] };
  }

  if (normClass === 'Artificer') {
    // Artificer gets spells at level 1: Math.ceil(level / 2) as effective caster level
    const effLvl = Math.max(1, Math.ceil(lvl / 2));
    return { ...HALF_CASTER_TABLE[effLvl * 2] || HALF_CASTER_TABLE[2] };
  }

  return {};
}

/**
 * Calculates standard 5e max prepared spells for prepared casters.
 * Cleric / Druid: Level + Mod (default mod assumption: +3). Minimum 1.
 * Wizard: Level + Int Mod (default mod: +3). Minimum 1.
 * Paladin: Math.floor(Level / 2) + Cha Mod (default mod: +3). Minimum 1.
 * Artificer: Math.max(1, Math.floor(Level / 2)) + Int Mod (default mod: +3). Minimum 1.
 * Non-prepared casters (Sorcerer, Bard, Warlock, Ranger) or martials return null (known spells / all known prepared).
 */
export function calculateDefaultMaxPrepared(className, level, abilityMod = 3) {
  const lvl = Math.min(20, Math.max(1, Number(level) || 1));
  const normClass = className ? className.trim() : '';

  if (normClass === 'Cleric' || normClass === 'Druid' || normClass === 'Wizard') {
    return Math.max(1, lvl + abilityMod);
  }

  if (normClass === 'Paladin') {
    return Math.max(1, Math.floor(lvl / 2) + abilityMod);
  }

  if (normClass === 'Artificer') {
    return Math.max(1, Math.floor(lvl / 2) + abilityMod);
  }

  return null;
}

/**
 * Resolves effective maximum prepared spells for a character.
 */
export function getEffectiveMaxPrepared(character) {
  if (!character) return null;
  if (typeof character.customMaxPrepared === 'number') {
    return character.customMaxPrepared;
  }
  return calculateDefaultMaxPrepared(character.className, character.level);
}

/**
 * Resolves effective maximum slots by merging defaults with user custom slot overrides.
 */
export function getEffectiveMaxSlots(className, level, customSlots = {}) {
  const defaults = calculateDefaultSlots(className, level);
  const result = { ...defaults };

  for (const [lvlKey, maxVal] of Object.entries(customSlots)) {
    const numLevel = Number(lvlKey);
    const numMax = Number(maxVal);
    if (numMax > 0) {
      result[numLevel] = numMax;
    } else if (numMax === 0) {
      delete result[numLevel];
    }
  }

  return result;
}
