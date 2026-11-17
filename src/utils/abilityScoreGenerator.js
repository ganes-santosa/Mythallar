/**
 * D&D 5e Ability Score Generator & Ruleset Bonus Calculator.
 */

import { getAbilityModifier } from './dndCalculations';

export const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export const ABILITY_LABELS = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export const POINT_BUY_TOTAL = 27;

export const POINT_BUY_COSTS = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

/**
 * Calculates total point buy points spent for given base scores (8-15).
 */
export function calculatePointBuyCost(scores = {}) {
  let total = 0;
  for (const key of ABILITY_KEYS) {
    const val = scores[key] ?? 8;
    total += POINT_BUY_COSTS[val] ?? 0;
  }
  return total;
}

/**
 * Rolls 4d6 and drops the lowest die.
 */
export function roll4d6DropLowest(rng = Math.random) {
  const rolls = Array.from({ length: 4 }, () => Math.floor(rng() * 6) + 1);
  rolls.sort((a, b) => a - b);
  const dropped = rolls[0];
  const kept = rolls.slice(1);
  const total = kept.reduce((sum, n) => sum + n, 0);
  return { rolls, dropped, kept, total };
}

/**
 * Generates an array of 6 rolled ability scores.
 */
export function generateRollPool(rng = Math.random) {
  return Array.from({ length: 6 }, () => roll4d6DropLowest(rng));
}

/**
 * Calculates final scores and modifiers given base scores and ruleset bonuses.
 *
 * In 2014:
 * - Racial ability score increases applied from selected race/subrace.
 * - Background gives NO ability increases.
 *
 * In 2024:
 * - Background ability score increases applied (+2/+1 or +1/+1/+1 among eligible abilities).
 * - Species gives NO ability increases.
 */
export function calculateFinalAbilities({
  baseScores = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  ruleset = '2024',
  race = null,
  subrace = null,
  background = null,
  bgBonusChoice = {}, // for 2024: { str: 2, dex: 1 } or { str: 1, dex: 1, con: 1 }
  racialChoice = {}, // for 2014 Half-Elf / Variant Human custom +1s
}) {
  const bonuses = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };

  if (ruleset === '2014') {
    // 1. Race bonuses
    if (race?.abilityBonuses) {
      for (const [k, v] of Object.entries(race.abilityBonuses)) {
        if (k in bonuses && typeof v === 'number') bonuses[k] += v;
      }
    }
    // 2. Subrace bonuses
    if (subrace?.abilityBonuses) {
      for (const [k, v] of Object.entries(subrace.abilityBonuses)) {
        if (k in bonuses && typeof v === 'number') bonuses[k] += v;
      }
    }
    // 3. Custom racial choices (Half-Elf +1 to two, Variant Human +1 to two)
    if (racialChoice) {
      for (const [k, v] of Object.entries(racialChoice)) {
        if (k in bonuses && typeof v === 'number') bonuses[k] += v;
      }
    }
  } else if (ruleset === '2024') {
    // Background bonuses only
    if (bgBonusChoice) {
      for (const [k, v] of Object.entries(bgBonusChoice)) {
        if (k in bonuses && typeof v === 'number') bonuses[k] += v;
      }
    }
  }

  const finalScores = {};
  const modifiers = {};

  for (const key of ABILITY_KEYS) {
    const base = Number(baseScores[key]) || 10;
    const bonus = bonuses[key] || 0;
    const finalVal = base + bonus;
    finalScores[key] = finalVal;
    modifiers[key] = getAbilityModifier(finalVal);
  }

  return {
    baseScores: { ...baseScores },
    bonuses,
    finalScores,
    modifiers,
  };
}
