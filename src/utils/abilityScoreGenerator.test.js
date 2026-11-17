import { describe, it, expect } from 'vitest';
import {
  calculatePointBuyCost,
  roll4d6DropLowest,
  generateRollPool,
  calculateFinalAbilities,
  POINT_BUY_TOTAL,
  STANDARD_ARRAY,
} from './abilityScoreGenerator';

describe('abilityScoreGenerator', () => {
  it('calculates point buy cost according to 5e rules', () => {
    // All 8s = 0 points spent
    expect(calculatePointBuyCost({ str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 })).toBe(0);

    // Standard array 15, 14, 13, 12, 10, 8 costs exactly 27 points
    // 15: 9 pts, 14: 7 pts, 13: 5 pts, 12: 4 pts, 10: 2 pts, 8: 0 pts = 27
    const standardCost = calculatePointBuyCost({
      str: 15,
      dex: 14,
      con: 13,
      int: 12,
      wis: 10,
      cha: 8,
    });
    expect(standardCost).toBe(POINT_BUY_TOTAL);
  });

  it('rolls 4d6 and drops lowest die', () => {
    // Mock rng returning [0.1, 0.5, 0.8, 0.9] -> dice [1, 4, 5, 6] -> drops 1, sum = 15
    let call = 0;
    const rollsSequence = [0.1, 0.5, 0.8, 0.9];
    const mockRng = () => rollsSequence[call++];
    const res = roll4d6DropLowest(mockRng);
    expect(res.dropped).toBe(1);
    expect(res.kept).toEqual([4, 5, 6]);
    expect(res.total).toBe(15);
  });

  it('generates a pool of 6 rolled stats', () => {
    const pool = generateRollPool();
    expect(pool).toHaveLength(6);
    pool.forEach((item) => {
      expect(item.total).toBeGreaterThanOrEqual(3);
      expect(item.total).toBeLessThanOrEqual(18);
    });
  });

  it('applies 2014 racial bonuses and ignores background for ASI', () => {
    const base = { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 };
    const race = { abilityBonuses: { con: 2 } }; // Dwarf
    const subrace = { abilityBonuses: { wis: 1 } }; // Hill Dwarf
    const background = { eligibleAbilities: ['str', 'dex', 'con'] }; // Should be ignored in 2014

    const res = calculateFinalAbilities({
      baseScores: base,
      ruleset: '2014',
      race,
      subrace,
      background,
      bgBonusChoice: { str: 2, dex: 1 }, // Must NOT apply in 2014
    });

    expect(res.bonuses.con).toBe(2);
    expect(res.bonuses.wis).toBe(1);
    expect(res.bonuses.str).toBe(0); // Ignored background bonus

    expect(res.finalScores.con).toBe(15); // 13 + 2
    expect(res.modifiers.con).toBe(2);
    expect(res.finalScores.wis).toBe(11); // 10 + 1
    expect(res.modifiers.wis).toBe(0);
  });

  it('applies 2024 background bonuses and ignores species for ASI', () => {
    const base = { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 };
    const race = { abilityBonuses: { con: 2 } }; // Should be ignored in 2024
    const background = { eligibleAbilities: ['str', 'con', 'wis'] };

    const res = calculateFinalAbilities({
      baseScores: base,
      ruleset: '2024',
      race,
      background,
      bgBonusChoice: { str: 2, con: 1 },
    });

    expect(res.bonuses.str).toBe(2);
    expect(res.bonuses.con).toBe(1);
    expect(res.bonuses.dex).toBe(0);

    expect(res.finalScores.str).toBe(17); // 15 + 2
    expect(res.modifiers.str).toBe(3);
    expect(res.finalScores.con).toBe(14); // 13 + 1
    expect(res.modifiers.con).toBe(2);
  });
});
