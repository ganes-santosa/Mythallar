import { describe, it, expect } from 'vitest';
import { filterSpells } from './useSpellFilter';

const MOCK_SPELLS = [
  {
    id: 'acid-splash',
    name: 'Acid Splash',
    level: 0,
    school: 'Conjuration',
    classes: ['Sorcerer', 'Wizard'],
    concentration: false,
    ritual: false,
    entries: ['You hurl a bubble of acid.'],
  },
  {
    id: 'fireball',
    name: 'Fireball',
    level: 3,
    school: 'Evocation',
    classes: ['Sorcerer', 'Wizard'],
    concentration: false,
    ritual: false,
    entries: ['A bright streak flashes from your finger.'],
  },
  {
    id: 'detect-magic',
    name: 'Detect Magic',
    level: 1,
    school: 'Divination',
    classes: ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Wizard'],
    concentration: true,
    ritual: true,
    entries: ['For the duration, you sense the presence of magic.'],
  },
  {
    id: 'cure-wounds',
    name: 'Cure Wounds',
    level: 1,
    school: 'Evocation',
    classes: ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger'],
    concentration: false,
    ritual: false,
    entries: ['A creature you touch regains hit points.'],
  },
];

describe('filterSpells', () => {
  it('filters by search keyword in name or entries', () => {
    const res = filterSpells(MOCK_SPELLS, { search: 'fire' });
    expect(res.map(s => s.name)).toEqual(['Fireball']);

    const res2 = filterSpells(MOCK_SPELLS, { search: 'bubble' });
    expect(res2.map(s => s.name)).toEqual(['Acid Splash']);
  });

  it('filters by level', () => {
    const res = filterSpells(MOCK_SPELLS, { level: 0 });
    expect(res.map(s => s.name)).toEqual(['Acid Splash']);

    const resLevel1 = filterSpells(MOCK_SPELLS, { level: 1 });
    expect(resLevel1.map(s => s.name)).toEqual(['Detect Magic', 'Cure Wounds']);
  });

  it('filters by class', () => {
    const res = filterSpells(MOCK_SPELLS, { className: 'Druid' });
    expect(res.map(s => s.name)).toEqual(['Detect Magic', 'Cure Wounds']);
  });

  it('filters by school', () => {
    const res = filterSpells(MOCK_SPELLS, { school: 'Divination' });
    expect(res.map(s => s.name)).toEqual(['Detect Magic']);
  });

  it('filters by concentration and ritual', () => {
    const conc = filterSpells(MOCK_SPELLS, { concentration: true });
    expect(conc.map(s => s.name)).toEqual(['Detect Magic']);

    const rit = filterSpells(MOCK_SPELLS, { ritual: true });
    expect(rit.map(s => s.name)).toEqual(['Detect Magic']);
  });

  it('returns all spells when filters are empty or default', () => {
    const res = filterSpells(MOCK_SPELLS, {});
    expect(res.length).toBe(4);
  });
});
