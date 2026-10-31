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
 * Formats a modifier number with an explicit sign (e.g. +3, +0, -1).
 */
export function formatModifier(mod) {
  const safeMod = Number(mod) || 0;
  return safeMod >= 0 ? `+${safeMod}` : `${safeMod}`;
}

/**
 * Calculates the total saving throw modifier for an ability.
 * Supports an optional explicit manual override value.
 */
export function calculateSave(score, isProficient, level, override) {
  if (typeof override === 'number' && !isNaN(override)) {
    return override;
  }
  const mod = getAbilityModifier(score);
  const prof = isProficient ? getProficiencyBonus(level) : 0;
  return mod + prof;
}
