// Standard 5e Full Caster Spell Slots Table (Level 1 - 20)
export const FULL_CASTER_TABLE = {
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
export const HALF_CASTER_TABLE = {
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
export const WARLOCK_TABLE = {
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
 * Normalizes character classes array from character object or fallback.
 */
export function getCharacterClasses(character) {
  if (!character) return [{ className: 'Wizard', level: 1 }];
  if (Array.isArray(character.classes) && character.classes.length > 0) {
    return character.classes.map((c) => ({
      className: c.className || 'Wizard',
      level: Math.max(1, Number(c.level) || 1),
    }));
  }
  return [
    {
      className: character.className || 'Wizard',
      level: Math.max(1, Number(character.level) || 1),
    },
  ];
}

export function isWizardCharacter(character) {
  return getCharacterClasses(character).some((c) => c.className === 'Wizard');
}

/**
 * Calculates total character level across all classes (capped at 20).
 */
export function getTotalCharacterLevel(character) {
  const classes = getCharacterClasses(character);
  const sum = classes.reduce((acc, c) => acc + c.level, 0);
  return Math.min(20, Math.max(1, sum));
}

/**
 * Calculates multiclass spellcasting slots breakdown and effective caster level.
 */
export function calculateMulticlassSpellSlots(character) {
  const classes = getCharacterClasses(character);

  // Check if pure single-class non-multiclass
  if (classes.length === 1) {
    const single = classes[0];
    if (single.className === 'Warlock') {
      return {
        sharedSlots: {},
        casterLevel: 0,
        sources: [],
        pactSlots: { ...WARLOCK_TABLE[single.level] },
        pactSource: { className: 'Warlock', level: single.level, slots: { ...WARLOCK_TABLE[single.level] } },
      };
    }
    const shared = calculateDefaultSlots(single.className, single.level);
    return {
      sharedSlots: shared,
      casterLevel: FULL_CASTERS.has(single.className) ? single.level : HALF_CASTERS.has(single.className) ? Math.floor(single.level / 2) : 0,
      sources: [
        {
          className: single.className,
          level: single.level,
          contribution: single.level,
        },
      ],
      pactSlots: {},
      pactSource: null,
    };
  }

  // Multiclass 5e rules:
  // Full Casters: 1 per level
  // Paladin, Ranger: Math.floor(level / 2)
  // Artificer: Math.ceil(level / 2)
  // Warlock: tracked separately as Pact Magic
  let totalCasterLevel = 0;
  const sources = [];
  let pactSlots = {};
  let pactSource = null;

  for (const c of classes) {
    const { className, level } = c;
    if (FULL_CASTERS.has(className)) {
      totalCasterLevel += level;
      sources.push({ className, level, contribution: level, type: 'Full Caster' });
    } else if (HALF_CASTERS.has(className)) {
      const contrib = Math.floor(level / 2);
      totalCasterLevel += contrib;
      sources.push({ className, level, contribution: contrib, type: 'Half Caster' });
    } else if (className === 'Artificer') {
      const contrib = Math.ceil(level / 2);
      totalCasterLevel += contrib;
      sources.push({ className, level, contribution: contrib, type: 'Artificer' });
    } else if (className === 'Warlock') {
      pactSlots = { ...WARLOCK_TABLE[level] };
      pactSource = { className: 'Warlock', level, slots: pactSlots };
    } else {
      sources.push({ className, level, contribution: 0, type: 'Non-Caster' });
    }
  }

  totalCasterLevel = Math.min(20, totalCasterLevel);
  const sharedSlots = totalCasterLevel > 0 ? { ...(FULL_CASTER_TABLE[totalCasterLevel] || {}) } : {};

  return {
    sharedSlots,
    casterLevel: totalCasterLevel,
    sources,
    pactSlots,
    pactSource,
  };
}

/**
 * Calculates default max spell slots per level for a given class and character level (1-20).
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
    const effLvl = Math.max(1, Math.ceil(lvl / 2));
    return { ...HALF_CASTER_TABLE[effLvl * 2] || HALF_CASTER_TABLE[2] };
  }

  return {};
}

const PREPARED_CASTERS = new Set(['Cleric', 'Druid', 'Wizard', 'Paladin', 'Artificer']);

const KNOWN_SPELLS_TABLE = {
  Bard: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22],
  Sorcerer: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15],
  Warlock: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
  Ranger: [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11],
};

const CANTRIPS_KNOWN_TABLE = {
  Wizard: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  Cleric: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  Druid: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  Bard: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  Warlock: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  Sorcerer: [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
  Artificer: [2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4],
};

/**
 * Calculates standard 5e max prepared spells for prepared casters.
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
 * Calculates standard 5e max known spells for known casters (Bard, Sorcerer, Ranger, Warlock).
 */
export function calculateDefaultMaxKnown(className, level) {
  const lvl = Math.min(20, Math.max(1, Number(level) || 1));
  const normClass = className ? className.trim() : '';
  const table = KNOWN_SPELLS_TABLE[normClass];
  return Array.isArray(table) ? table[lvl - 1] : null;
}

/**
 * Calculates standard 5e max cantrips known for cantrip casters.
 */
export function calculateDefaultMaxCantrips(className, level) {
  const lvl = Math.min(20, Math.max(1, Number(level) || 1));
  const normClass = className ? className.trim() : '';
  const table = CANTRIPS_KNOWN_TABLE[normClass];
  return Array.isArray(table) ? table[lvl - 1] : null;
}

/**
 * Resolves effective maximum prepared spells and per-class breakdown for a character.
 */
export function getEffectiveMaxPreparedInfo(character) {
  if (!character) return { total: null, breakdown: [], isCustom: false, hasPreparedCaster: false };

  const classes = getCharacterClasses(character);
  const hasPreparedCaster = classes.some((c) => PREPARED_CASTERS.has(c.className));

  if (typeof character.customMaxPrepared === 'number') {
    return {
      total: character.customMaxPrepared,
      breakdown: [],
      isCustom: true,
      hasPreparedCaster,
    };
  }

  const breakdown = [];
  let total = 0;

  for (const c of classes) {
    const defaultMod = 3;
    const abilityName =
      c.className === 'Wizard' || c.className === 'Artificer'
        ? 'INT'
        : c.className === 'Cleric' || c.className === 'Druid'
        ? 'WIS'
        : 'CHA';

    const preparedLimit = calculateDefaultMaxPrepared(c.className, c.level, defaultMod);
    if (preparedLimit !== null) {
      total += preparedLimit;
      breakdown.push({
        className: c.className,
        level: c.level,
        amount: preparedLimit,
        formula: `${c.className}: Level ${c.level} + ${defaultMod} ${abilityName}`,
      });
    }
  }

  return {
    total: hasPreparedCaster ? total : null,
    breakdown,
    isCustom: false,
    hasPreparedCaster,
  };
}

/**
 * Resolves effective maximum known spells and per-class breakdown for a character.
 */
export function getEffectiveMaxKnownInfo(character) {
  if (!character) return { total: null, breakdown: [], isCustom: false, hasKnownCaster: false };

  const classes = getCharacterClasses(character);
  const hasKnownCaster = classes.some((c) => Object.prototype.hasOwnProperty.call(KNOWN_SPELLS_TABLE, c.className));

  if (typeof character.customMaxKnown === 'number') {
    return {
      total: character.customMaxKnown,
      breakdown: [],
      isCustom: true,
      hasKnownCaster,
    };
  }

  const breakdown = [];
  let total = 0;

  for (const c of classes) {
    const knownLimit = calculateDefaultMaxKnown(c.className, c.level);
    if (knownLimit !== null) {
      total += knownLimit;
      breakdown.push({
        className: c.className,
        level: c.level,
        amount: knownLimit,
        formula: `${c.className}: Level ${c.level}`,
      });
    }
  }

  return {
    total: hasKnownCaster ? total : null,
    breakdown,
    isCustom: false,
    hasKnownCaster,
  };
}

/**
 * Resolves effective maximum cantrips and per-class breakdown for a character.
 */
export function getEffectiveMaxCantripsInfo(character) {
  if (!character) return { total: null, breakdown: [], isCustom: false, hasCantripCaster: false };

  const classes = getCharacterClasses(character);
  const hasCantripCaster = classes.some((c) => Object.prototype.hasOwnProperty.call(CANTRIPS_KNOWN_TABLE, c.className));

  if (typeof character.customMaxCantrips === 'number') {
    return {
      total: character.customMaxCantrips,
      breakdown: [],
      isCustom: true,
      hasCantripCaster,
    };
  }

  const breakdown = [];
  let total = 0;

  for (const c of classes) {
    const cantripLimit = calculateDefaultMaxCantrips(c.className, c.level);
    if (cantripLimit !== null) {
      total += cantripLimit;
      breakdown.push({
        className: c.className,
        level: c.level,
        amount: cantripLimit,
        formula: `${c.className}: Level ${c.level}`,
      });
    }
  }

  return {
    total: hasCantripCaster ? total : null,
    breakdown,
    isCustom: false,
    hasCantripCaster,
  };
}

export function getEffectiveMaxPrepared(character) {
  const info = getEffectiveMaxPreparedInfo(character);
  return info.total;
}

/**
 * Resolves effective maximum shared slots by merging calculated defaults with user custom slot overrides.
 */
export function getEffectiveMaxSlots(className, level, customSlots = {}, character = null) {
  let defaults = {};

  if (character) {
    const multi = calculateMulticlassSpellSlots(character);
    defaults = multi.sharedSlots;
  } else {
    defaults = calculateDefaultSlots(className, level);
  }

  const result = { ...defaults };

  for (const [lvlKey, maxVal] of Object.entries(customSlots || {})) {
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
