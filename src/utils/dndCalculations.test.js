import { describe, it, expect } from 'vitest';
import {
  getProficiencyBonus,
  getAbilityModifier,
  formatModifier,
  calculateSave,
} from './dndCalculations';

describe('dndCalculations', () => {
  it('calculates proficiency bonus by level', () => {
    expect(getProficiencyBonus(1)).toBe(2);
    expect(getProficiencyBonus(4)).toBe(2);
    expect(getProficiencyBonus(5)).toBe(3);
    expect(getProficiencyBonus(9)).toBe(4);
    expect(getProficiencyBonus(13)).toBe(5);
    expect(getProficiencyBonus(17)).toBe(6);
    expect(getProficiencyBonus(20)).toBe(6);
  });

  it('calculates ability modifiers accurately across standard and extreme scores', () => {
    expect(getAbilityModifier(1)).toBe(-5);
    expect(getAbilityModifier(8)).toBe(-1);
    expect(getAbilityModifier(9)).toBe(-1);
    expect(getAbilityModifier(10)).toBe(0);
    expect(getAbilityModifier(11)).toBe(0);
    expect(getAbilityModifier(12)).toBe(1);
    expect(getAbilityModifier(19)).toBe(4);
    expect(getAbilityModifier(20)).toBe(5);
    expect(getAbilityModifier(30)).toBe(10);
  });

  it('formats modifiers with explicit signs', () => {
    expect(formatModifier(3)).toBe('+3');
    expect(formatModifier(0)).toBe('+0');
    expect(formatModifier(-2)).toBe('-2');
  });

  it('calculates saving throws correctly with and without proficiency', () => {
    expect(calculateSave(10, false, 5)).toBe(0);
    expect(calculateSave(14, false, 5)).toBe(2);
    expect(calculateSave(14, true, 5)).toBe(5); // +2 mod + 3 prof
    expect(calculateSave(20, true, 19)).toBe(11); // +5 mod + 6 prof
    expect(calculateSave(14, true, 5, 9)).toBe(9); // respects manual override
  });
});
