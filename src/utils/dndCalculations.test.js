import { describe, it, expect } from 'vitest';
import {
  getProficiencyBonus,
  getAbilityModifier,
  getEffectiveAbilities,
  formatModifier,
  calculateSave,
  SKILLS_DEFINITION,
  calculateSkillBonus,
  calculatePassiveScore,
  getClassHitDie,
  rollHitDie,
  getDefaultSpellcastingAbility,
  calculateSpellDC,
  calculateSpellAttack,
  OPTIONAL_SPEED_TYPES,
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

  it('calculates effective abilities by adding scoreBonuses to raw scores', () => {
    const raw = {
      str: 10,
      dex: 14,
      con: 12,
      int: 18,
      wis: 8,
      cha: 10,
      scoreBonuses: {
        int: 2, // 18 + 2 = 20
        dex: -1, // 14 - 1 = 13
        con: 1, // 12 + 1 = 13
      },
    };
    const effective = getEffectiveAbilities(raw);
    expect(effective.int).toBe(20);
    expect(effective.dex).toBe(13);
    expect(effective.con).toBe(13);
    expect(effective.str).toBe(10);
    expect(effective.wis).toBe(8);
    expect(effective.cha).toBe(10);
  });

  it('formats modifiers with explicit signs', () => {
    expect(formatModifier(3)).toBe('+3');
    expect(formatModifier(0)).toBe('+0');
    expect(formatModifier(-2)).toBe('-2');
  });

  it('calculates saving throws correctly with and without proficiency and misc bonus', () => {
    expect(calculateSave(10, false, 5)).toBe(0);
    expect(calculateSave(14, false, 5)).toBe(2);
    expect(calculateSave(14, true, 5)).toBe(5); // +2 mod + 3 prof
    expect(calculateSave(14, true, 5, undefined, 2)).toBe(7); // +2 mod + 3 prof + 2 misc
    expect(calculateSave(10, false, 1, undefined, -1)).toBe(-1); // 0 mod + 0 prof - 1 misc
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

  it('calculates skill bonus for none, proficient, and expertise and misc bonus', () => {
    // Score 18 (+4 mod) at level 5 (+3 prof)
    expect(calculateSkillBonus(18, 'none', 5)).toBe(4);
    expect(calculateSkillBonus(18, 'proficient', 5)).toBe(7);
    expect(calculateSkillBonus(18, 'expertise', 5)).toBe(10);
    expect(calculateSkillBonus(18, 'proficient', 5, undefined, 2)).toBe(9); // +4 mod + 3 prof + 2 misc
    expect(calculateSkillBonus(10, 'none', 1, undefined, -1)).toBe(-1); // 0 mod + 0 prof - 1 misc
    expect(calculateSkillBonus(18, 'none', 5, 99)).toBe(99); // override
  });

  it('calculates passive score correctly based on skill bonus and misc bonus', () => {
    expect(calculatePassiveScore(14, 'proficient', 5)).toBe(15); // 10 + 2 mod + 3 prof
    expect(calculatePassiveScore(14, 'expertise', 5)).toBe(18); // 10 + 2 mod + 6 prof
    expect(calculatePassiveScore(14, 'none', 5, 5)).toBe(17); // 10 + 2 mod + 5 bonus
    expect(calculatePassiveScore(14, 'proficient', 5, 0, 1)).toBe(16); // 10 + (2 mod + 3 prof + 1 skill misc)
  });

  it('calculates spell attack and spell save DC accurately with defaults and overrides', () => {
    // Score 16 (+3 mod), Level 5 (+3 prof) -> DC = 8 + 3 + 3 = 14, Attack = +6
    expect(calculateSpellDC(16, 5)).toBe(14);
    expect(calculateSpellAttack(16, 5)).toBe(6);

    // Score 20 (+5 mod), Level 17 (+6 prof) -> DC = 8 + 6 + 5 = 19, Attack = +11
    expect(calculateSpellDC(20, 17)).toBe(19);
    expect(calculateSpellAttack(20, 17)).toBe(11);

    // With bonus
    expect(calculateSpellDC(16, 5, 1)).toBe(15);
    expect(calculateSpellAttack(16, 5, 2)).toBe(8);

    // Default spellcasting abilities for classes
    expect(getDefaultSpellcastingAbility('Wizard')).toBe('int');
    expect(getDefaultSpellcastingAbility('Cleric')).toBe('wis');
    expect(getDefaultSpellcastingAbility('Sorcerer')).toBe('cha');
    expect(getDefaultSpellcastingAbility('UnknownClass')).toBe('int');
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
