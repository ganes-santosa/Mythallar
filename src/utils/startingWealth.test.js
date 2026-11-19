import { describe, it, expect } from 'vitest';
import {
  getWealthDice2014,
  rollStartingWealth2014,
  parseEquipmentOptions2024,
  parseBackgroundGp2014,
} from './startingWealth';

describe('startingWealth', () => {
  it('maps 2014 classes to their wealth dice', () => {
    expect(getWealthDice2014('Monk')).toEqual({ count: 5, sides: 4, multiplier: 1 });
    expect(getWealthDice2014('Druid')).toEqual({ count: 2, sides: 4, multiplier: 10 });
    expect(getWealthDice2014('Barbarian')).toEqual({ count: 2, sides: 4, multiplier: 10 });
    expect(getWealthDice2014('Sorcerer')).toEqual({ count: 3, sides: 4, multiplier: 10 });
    expect(getWealthDice2014('Wizard')).toEqual({ count: 4, sides: 4, multiplier: 10 });
    expect(getWealthDice2014('Rogue')).toEqual({ count: 4, sides: 4, multiplier: 10 });
    expect(getWealthDice2014('Warlock')).toEqual({ count: 4, sides: 4, multiplier: 10 });
    expect(getWealthDice2014('Fighter')).toEqual({ count: 5, sides: 4, multiplier: 10 });
    expect(getWealthDice2014('Artificer')).toEqual({ count: 5, sides: 4, multiplier: 10 });
  });

  it('rolls 2014 wealth with the multiplier applied', () => {
    const max = rollStartingWealth2014('Fighter', () => 0.999);
    expect(max.total).toBe(200);
    expect(max.rolls).toHaveLength(5);
    expect(rollStartingWealth2014('Monk', () => 0).total).toBe(5);
    expect(rollStartingWealth2014('Druid', () => 0).total).toBe(20);
  });

  it('parses 2024 class equipment options', () => {
    const opts = parseEquipmentOptions2024(
      'Choose A, B, or C: (A) Chain Mail, Greatsword, 8 Javelin, Dungeoneer\'s Pack, and 4 GP; (B) Studded Leather Armor, Longbow, and 11 GP; or (C) 155 GP'
    );
    expect(opts.map((o) => o.key)).toEqual(['A', 'B', 'C']);
    expect(opts[0].gp).toBe(4);
    expect(opts[0].items).toEqual(['Chain Mail', 'Greatsword', '8 Javelin', "Dungeoneer's Pack"]);
    expect(opts[1].gp).toBe(11);
    expect(opts[2].gp).toBe(155);
    expect(opts[2].items).toEqual([]);
  });

  it('parses a 2024 background with 50 GP alternative', () => {
    const opts = parseEquipmentOptions2024(
      'Choose A or B: (A) Calligrapher\'s Supplies, Book, Robe, 8 GP; or (B) 50 GP'
    );
    expect(opts[0].gp).toBe(8);
    expect(opts[0].items).toEqual(["Calligrapher's Supplies", 'Book', 'Robe']);
    expect(opts[1]).toMatchObject({ key: 'B', gp: 50, items: [] });
  });

  it('returns no options for unstructured text', () => {
    expect(parseEquipmentOptions2024('Standard class starting equipment.')).toEqual([]);
  });

  it('parses 2014 background belt pouch gold', () => {
    expect(parseBackgroundGp2014('A holy symbol, and a belt pouch containing 15 gp')).toBe(15);
    expect(parseBackgroundGp2014('Nothing')).toBe(0);
  });
});
