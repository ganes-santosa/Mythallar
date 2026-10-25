import { describe, it, expect } from 'vitest';
import { calculateDefaultSlots } from './spellSlots';

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
