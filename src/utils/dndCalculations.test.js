import { describe, it, expect } from 'vitest';
import {
  getProficiencyBonus,
  getAbilityModifier,
  formatModifier,
  calculateSave,
  SKILLS_DEFINITION,
  calculateSkillBonus,
  calculatePassiveScore,
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

  it('defines the 18 standard 5e skills with their key abilities', () => {
    expect(SKILLS_DEFINITION.length).toBe(18);
    const stealth = SKILLS_DEFINITION.find(s => s.key === 'stealth');
    expect(stealth).toEqual({ key: 'stealth', label: 'Stealth', ability: 'dex' });
    const arcana = SKILLS_DEFINITION.find(s => s.key === 'arcana');
    expect(arcana).toEqual({ key: 'arcana', label: 'Arcana', ability: 'int' });
  });

  it('calculates skill bonus for none, proficient, and expertise', () => {
    // Score 18 (+4 mod) at level 5 (+3 prof)
    expect(calculateSkillBonus(18, 'none', 5)).toBe(4);
    expect(calculateSkillBonus(18, 'proficient', 5)).toBe(7);
    expect(calculateSkillBonus(18, 'expertise', 5)).toBe(10);
    expect(calculateSkillBonus(18, 'none', 5, 99)).toBe(99); // override
  });

  it('calculates passive score correctly based on skill bonus', () => {
    expect(calculatePassiveScore(14, 'proficient', 5)).toBe(15); // 10 + 2 mod + 3 prof
    expect(calculatePassiveScore(14, 'expertise', 5)).toBe(18); // 10 + 2 mod + 6 prof
    expect(calculatePassiveScore(14, 'none', 5, 5)).toBe(17); // 10 + 2 mod + 5 bonus
  });
});
