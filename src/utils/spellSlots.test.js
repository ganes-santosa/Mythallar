import { describe, it, expect } from 'vitest';
import {
  calculateDefaultSlots,
  calculateMulticlassSpellSlots,
  getEffectiveMaxPreparedInfo,
  getEffectiveMaxKnownInfo,
  getTotalCharacterLevel,
} from './spellSlots';

describe('calculateDefaultSlots', () => {
  it('calculates full caster progression (Wizard)', () => {
    expect(calculateDefaultSlots('Wizard', 1)).toEqual({ 1: 2 });
    expect(calculateDefaultSlots('Wizard', 5)).toEqual({ 1: 4, 2: 3, 3: 2 });
    expect(calculateDefaultSlots('Cleric', 9)).toEqual({ 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 });
  });

  it('calculates half caster progression (Paladin, Ranger)', () => {
    expect(calculateDefaultSlots('Paladin', 1)).toEqual({});
    expect(calculateDefaultSlots('Paladin', 2)).toEqual({ 1: 2 });
    expect(calculateDefaultSlots('Ranger', 5)).toEqual({ 1: 4, 2: 2 });
  });

  it('calculates warlock pact magic progression', () => {
    expect(calculateDefaultSlots('Warlock', 1)).toEqual({ 1: 1 });
    expect(calculateDefaultSlots('Warlock', 2)).toEqual({ 1: 2 });
    expect(calculateDefaultSlots('Warlock', 3)).toEqual({ 2: 2 });
    expect(calculateDefaultSlots('Warlock', 5)).toEqual({ 3: 2 });
    expect(calculateDefaultSlots('Warlock', 9)).toEqual({ 5: 2 });
    expect(calculateDefaultSlots('Warlock', 11)).toEqual({ 5: 3 });
  });

  it('handles non-casters gracefully', () => {
    expect(calculateDefaultSlots('Fighter', 3)).toEqual({});
    expect(calculateDefaultSlots('Barbarian', 5)).toEqual({});
  });
});

describe('Multiclass Spell Slots Calculation', () => {
  it('calculates shared multiclass slots accurately (Wizard 4 + Paladin 2 = Caster Lvl 5)', () => {
    const character = {
      classes: [
        { className: 'Wizard', level: 4 },
        { className: 'Paladin', level: 2 },
      ],
    };
    const res = calculateMulticlassSpellSlots(character);
    expect(res.casterLevel).toBe(5);
    // 5th level full caster slots: 4x 1st, 3x 2nd, 2x 3rd
    expect(res.sharedSlots).toEqual({ 1: 4, 2: 3, 3: 2 });
    expect(res.sources).toEqual([
      { className: 'Wizard', level: 4, contribution: 4, type: 'Full Caster' },
      { className: 'Paladin', level: 2, contribution: 1, type: 'Half Caster' },
    ]);
    expect(res.pactSlots).toEqual({});
  });

  it('separates Warlock pact magic slots from multiclass spell slots', () => {
    const character = {
      classes: [
        { className: 'Sorcerer', level: 3 },
        { className: 'Warlock', level: 2 },
      ],
    };
    const res = calculateMulticlassSpellSlots(character);
    expect(res.casterLevel).toBe(3);
    // Sorcerer 3 slots: 4x 1st, 2x 2nd
    expect(res.sharedSlots).toEqual({ 1: 4, 2: 2 });
    // Warlock 2 pact magic slots: 2x 1st
    expect(res.pactSlots).toEqual({ 1: 2 });
    expect(res.pactSource).toEqual({
      className: 'Warlock',
      level: 2,
      slots: { 1: 2 },
    });
  });

  it('calculates total character level correctly', () => {
    const character = {
      classes: [
        { className: 'Wizard', level: 4 },
        { className: 'Bard', level: 2 },
      ],
    };
    expect(getTotalCharacterLevel(character)).toBe(6);
  });

  it('calculates per-class prepared spell limits and formulas', () => {
    const character = {
      classes: [
        { className: 'Wizard', level: 4 },
        { className: 'Cleric', level: 2 },
      ],
    };
    const info = getEffectiveMaxPreparedInfo(character);
    // Wizard 4 (4 + 3 = 7), Cleric 2 (2 + 3 = 5) -> Total: 12
    expect(info.total).toBe(12);
    expect(info.breakdown).toHaveLength(2);
    expect(info.breakdown[0]).toEqual({
      className: 'Wizard',
      level: 4,
      amount: 7,
      formula: 'Wizard: Level 4 + 3 INT',
    });
    expect(info.breakdown[1]).toEqual({
      className: 'Cleric',
      level: 2,
      amount: 5,
      formula: 'Cleric: Level 2 + 3 WIS',
    });
  });

  it('calculates per-class known spell limits for Bard, Sorcerer, Ranger, and Warlock', () => {
    const bard5 = { className: 'Bard', level: 5 };
    const bardInfo = getEffectiveMaxKnownInfo(bard5);
    expect(bardInfo.total).toBe(8);
    expect(bardInfo.hasKnownCaster).toBe(true);
    expect(bardInfo.breakdown).toEqual([
      { className: 'Bard', level: 5, amount: 8, formula: 'Bard: Level 5' },
    ]);

    const multiKnown = {
      classes: [
        { className: 'Bard', level: 3 }, // 6
        { className: 'Warlock', level: 2 }, // 3
      ],
    };
    expect(getEffectiveMaxKnownInfo(multiKnown).total).toBe(9);

    const pureWizard = { className: 'Wizard', level: 5 };
    expect(getEffectiveMaxKnownInfo(pureWizard)).toEqual({
      total: null,
      breakdown: [],
      isCustom: false,
      hasKnownCaster: false,
    });
  });
});
