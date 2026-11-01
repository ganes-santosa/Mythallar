import { describe, it, expect } from 'vitest';
import {
  getProficiencyBonus,
  getAbilityModifier,
  formatModifier,
  calculateSave,
  SKILLS_DEFINITION,
  calculateSkillBonus,
  calculatePassiveScore,
  getClassHitDie,
  rollHitDie,
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

  it('maps D&D classes to their authentic 5e hit dice', () => {
    expect(getClassHitDie('Wizard')).toBe('d6');
    expect(getClassHitDie('Sorcerer')).toBe('d6');
    expect(getClassHitDie('Rogue')).toBe('d8');
    expect(getClassHitDie('Bard')).toBe('d8');
    expect(getClassHitDie('Cleric')).toBe('d8');
    expect(getClassHitDie('Druid')).toBe('d8');
    expect(getClassHitDie('Monk')).toBe('d8');
    expect(getClassHitDie('Warlock')).toBe('d8');
    expect(getClassHitDie('Artificer')).toBe('d8');
    expect(getClassHitDie('Fighter')).toBe('d10');
    expect(getClassHitDie('Paladin')).toBe('d10');
    expect(getClassHitDie('Ranger')).toBe('d10');
    expect(getClassHitDie('Barbarian')).toBe('d12');
    expect(getClassHitDie('UnknownHomebrew')).toBe('d8');
  });

  it('rolls hit die, adding CON modifier with a minimum floor of 1', () => {
    // Deterministic RNG returning 0.5 -> roll = 4 on d8
    const mockRngMid = () => 0.5; // (0.5 * 8) + 1 = 5
    const resultPositiveCon = rollHitDie(8, 14, () => 0.5); // roll 5, con mod +2 -> total 7
    expect(resultPositiveCon.roll).toBe(5);
    expect(resultPositiveCon.conMod).toBe(2);
    expect(resultPositiveCon.total).toBe(7);

    // Negative CON modifier: CON 6 (-2 mod), roll 1 on d6 -> total minimum 1 (not -1)
    const resultNegativeCon = rollHitDie(6, 6, () => 0); // roll 1, con mod -2 -> 1 - 2 = -1 -> floor 1
    expect(resultNegativeCon.roll).toBe(1);
    expect(resultNegativeCon.conMod).toBe(-2);
    expect(resultNegativeCon.total).toBe(1);

    // Die sides can be string 'd10' or number 10
    const resultStringDie = rollHitDie('d10', 10, () => 0.99); // roll 10, con mod 0 -> total 10
    expect(resultStringDie.roll).toBe(10);
    expect(resultStringDie.conMod).toBe(0);
    expect(resultStringDie.total).toBe(10);
  });
});
