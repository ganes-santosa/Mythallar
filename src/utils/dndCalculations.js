/**
 * D&D 5e calculation helpers.
 */

/**
 * Calculates proficiency bonus from character level (1 to 20).
 * Range: +2 at level 1 up to +6 at level 17-20.
 */
export function getProficiencyBonus(level) {
  const safeLevel = Math.max(1, Math.min(20, Number(level) || 1));
  return Math.floor((safeLevel - 1) / 4) + 2;
}

/**
 * Calculates ability modifier from an ability score.
 * Formula: floor((score - 10) / 2)
 */
export function getAbilityModifier(score) {
  const safeScore = Number(score) ?? 10;
  return Math.floor((safeScore - 10) / 2);
}

/**
 * Aggregates ability score bonuses from a character's feats array.
 */
export function getFeatAbilityBonuses(feats = []) {
  const bonuses = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  if (!Array.isArray(feats)) return bonuses;
  for (const feat of feats) {
    if (feat && typeof feat === 'object' && feat.statModifiers) {
      for (const [k, v] of Object.entries(feat.statModifiers)) {
        if (k in bonuses && typeof v === 'number' && !isNaN(v)) {
          bonuses[k] += v;
        }
      }
    }
  }
  return bonuses;
}

/**
 * Returns effective abilities with scoreBonuses and optional feat bonuses applied.
 */
export function getEffectiveAbilities(abilities = {}, feats = []) {
  const scoreBonuses = abilities.scoreBonuses || {};
  const featBonuses = getFeatAbilityBonuses(feats);
  return {
    ...abilities,
    str: (Number(abilities.str) || 10) + (Number(scoreBonuses.str) || 0) + (featBonuses.str || 0),
    dex: (Number(abilities.dex) || 10) + (Number(scoreBonuses.dex) || 0) + (featBonuses.dex || 0),
    con: (Number(abilities.con) || 10) + (Number(scoreBonuses.con) || 0) + (featBonuses.con || 0),
    int: (Number(abilities.int) || 10) + (Number(scoreBonuses.int) || 0) + (featBonuses.int || 0),
    wis: (Number(abilities.wis) || 10) + (Number(scoreBonuses.wis) || 0) + (featBonuses.wis || 0),
    cha: (Number(abilities.cha) || 10) + (Number(scoreBonuses.cha) || 0) + (featBonuses.cha || 0),
  };
}

/**
 * Formats a modifier number with an explicit sign (e.g. +3, +0, -1).
 */
export function formatModifier(mod) {
  const safeMod = Number(mod) || 0;
  return safeMod >= 0 ? `+${safeMod}` : `${safeMod}`;
}

/**
 * Calculates the total saving throw modifier for an ability.
 * Supports an optional explicit manual override value and misc bonus.
 */
export function calculateSave(score, isProficient, level, override, miscBonus = 0) {
  if (typeof override === 'number' && !isNaN(override)) {
    return override;
  }
  const mod = getAbilityModifier(score);
  const prof = isProficient ? getProficiencyBonus(level) : 0;
  return mod + prof + (Number(miscBonus) || 0);
}

export const SKILLS_DEFINITION = [
  { key: 'acrobatics', label: 'Acrobatics', ability: 'dex' },
  { key: 'animalHandling', label: 'Animal Handling', ability: 'wis' },
  { key: 'arcana', label: 'Arcana', ability: 'int' },
  { key: 'athletics', label: 'Athletics', ability: 'str' },
  { key: 'deception', label: 'Deception', ability: 'cha' },
  { key: 'history', label: 'History', ability: 'int' },
  { key: 'insight', label: 'Insight', ability: 'wis' },
  { key: 'intimidation', label: 'Intimidation', ability: 'cha' },
  { key: 'investigation', label: 'Investigation', ability: 'int' },
  { key: 'medicine', label: 'Medicine', ability: 'wis' },
  { key: 'nature', label: 'Nature', ability: 'int' },
  { key: 'perception', label: 'Perception', ability: 'wis' },
  { key: 'performance', label: 'Performance', ability: 'cha' },
  { key: 'persuasion', label: 'Persuasion', ability: 'cha' },
  { key: 'religion', label: 'Religion', ability: 'int' },
  { key: 'sleightOfHand', label: 'Sleight of Hand', ability: 'dex' },
  { key: 'stealth', label: 'Stealth', ability: 'dex' },
  { key: 'survival', label: 'Survival', ability: 'wis' },
];

export function calculateSkillBonus(score, profType = 'none', level = 1, override, miscBonus = 0) {
  if (typeof override === 'number' && !isNaN(override)) {
    return override;
  }
  const mod = getAbilityModifier(score);
  const prof = getProficiencyBonus(level);
  const mult = profType === 'expertise' ? 2 : profType === 'proficient' ? 1 : 0;
  return mod + prof * mult + (Number(miscBonus) || 0);
}

export function calculatePassiveScore(score, profType = 'none', level = 1, bonus = 0, skillBonus = 0) {
  return 10 + calculateSkillBonus(score, profType, level, undefined, skillBonus) + (Number(bonus) || 0);
}

export const CLASS_HIT_DIE = {
  Wizard: 'd6',
  Sorcerer: 'd6',
  Artificer: 'd8',
  Bard: 'd8',
  Cleric: 'd8',
  Druid: 'd8',
  Monk: 'd8',
  Rogue: 'd8',
  Warlock: 'd8',
  Fighter: 'd10',
  Paladin: 'd10',
  Ranger: 'd10',
  Barbarian: 'd12',
};

/**
 * Returns the authentic 5e hit die string (e.g. 'd8') for a class.
 */
export function getClassHitDie(className) {
  return CLASS_HIT_DIE[className] || 'd8';
}

/**
 * Rolls one hit die, adding CON modifier with a 5e floor of 1.
 */
export function rollHitDie(dieSides, conScore = 10, rng = Math.random) {
  const sides = typeof dieSides === 'string'
    ? parseInt(dieSides.replace(/\D/g, ''), 10) || 8
    : Number(dieSides) || 8;
  const roll = Math.floor(rng() * sides) + 1;
  const conMod = getAbilityModifier(conScore);
  const total = Math.max(1, roll + conMod);
  return { roll, conMod, total };
}

export const CLASS_SPELLCASTING_ABILITY = {
  Wizard: 'int',
  Artificer: 'int',
  Cleric: 'wis',
  Druid: 'wis',
  Ranger: 'wis',
  Bard: 'cha',
  Paladin: 'cha',
  Sorcerer: 'cha',
  Warlock: 'cha',
};

export function getDefaultSpellcastingAbility(className = 'Wizard') {
  return CLASS_SPELLCASTING_ABILITY[className] || 'int';
}

export function calculateSpellDC(score, level = 1, bonus = 0) {
  const mod = getAbilityModifier(score);
  const prof = getProficiencyBonus(level);
  return 8 + prof + mod + (Number(bonus) || 0);
}

export function calculateSpellAttack(score, level = 1, bonus = 0) {
  const mod = getAbilityModifier(score);
  const prof = getProficiencyBonus(level);
  return prof + mod + (Number(bonus) || 0);
}

export const OPTIONAL_SPEED_TYPES = [
  { key: 'fly', label: 'Fly' },
  { key: 'swim', label: 'Swim' },
  { key: 'climb', label: 'Climb' },
  { key: 'burrow', label: 'Burrow' },
];


