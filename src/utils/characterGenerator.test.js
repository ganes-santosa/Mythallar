import { describe, it, expect } from 'vitest';
import { buildLevel1Character } from './characterGenerator';

describe('characterGenerator', () => {
  it('generates a complete Level 1 Fighter under 2014 rules', () => {
    const char = buildLevel1Character({
      name: 'Bruenor Battlehammer',
      ruleset: '2014',
      selectedClass: {
        name: 'Fighter',
        hitDie: 10,
        hitDieString: 'd10',
        savingThrows: ['str', 'con'],
        armorProficiencies: ['light', 'medium', 'heavy', 'shield'],
        weaponProficiencies: ['simple', 'martial'],
        level1Features: [{ name: 'Fighting Style', description: 'Archery or Defense' }],
      },
      selectedSpecies: {
        name: 'Dwarf',
        speed: 25,
        darkvision: 60,
        abilityBonuses: { con: 2 },
      },
      selectedSubrace: {
        name: 'Mountain Dwarf',
        abilityBonuses: { str: 2 },
        speed: 25,
        darkvision: 60,
      },
      selectedBackground: {
        name: 'Soldier',
        skillProficiencies: ['athletics', 'intimidation'],
        feature: { name: 'Military Rank', description: 'Soldiers recognize your authority' },
      },
      baseScores: { str: 15, dex: 12, con: 14, int: 10, wis: 13, cha: 8 },
      chosenSkills: ['perception', 'survival'],
    });

    expect(char.level).toBe(1);
    expect(char.name).toBe('Bruenor Battlehammer');
    expect(char.ruleset).toBe('2014');
    expect(char.className).toBe('Fighter');

    // Abilities: Base 15 STR + 2 Mountain Dwarf = 17 (+3 mod)
    // Base 14 CON + 2 Dwarf = 16 (+3 mod)
    expect(char.sheet.abilities.str).toBe(15);
    expect(char.sheet.abilities.scoreBonuses.str).toBe(2);
    expect(char.sheet.abilities.con).toBe(14);
    expect(char.sheet.abilities.scoreBonuses.con).toBe(2);

    // HP: Fighter d10 (10) + CON mod (+3) + Dwarf (+1) = 14
    expect(char.sheet.vitals.hpMax).toBe(14);
    expect(char.sheet.vitals.hpCurrent).toBe(14);
    expect(char.sheet.vitals.hitDice.die).toBe('d10');

    // Speed & Senses
    expect(char.sheet.vitals.speed).toBe(25);
    expect(char.sheet.senses.darkvision).toBe(60);

    // Skills
    expect(char.sheet.skills.athletics).toBe('proficient');
    expect(char.sheet.skills.intimidation).toBe('proficient');
    expect(char.sheet.skills.perception).toBe('proficient');
    expect(char.sheet.skills.survival).toBe('proficient');
    expect(char.sheet.skills.arcana).toBe('none');

    // 2014: no Origin Feat
    expect(char.sheet.feats).toHaveLength(0);

    // Notes include Military Rank feature
    expect(char.sheet.featuresNotes).toContain('Military Rank');
  });

  it('generates a complete Level 1 Wizard under 2024 rules', () => {
    const char = buildLevel1Character({
      name: 'Elminster Aumar',
      ruleset: '2024',
      selectedClass: {
        name: 'Wizard',
        hitDie: 6,
        hitDieString: 'd6',
        savingThrows: ['int', 'wis'],
        level1Features: [{ name: 'Spellcasting', description: 'Cast wizard spells' }],
      },
      selectedSpecies: {
        name: 'Human',
        speed: 30,
        darkvision: 0,
      },
      selectedBackground: {
        name: 'Sage',
        eligibleAbilities: ['con', 'int', 'wis'],
        originFeat: 'Magic Initiate (Wizard)',
        skillProficiencies: ['arcana', 'history'],
      },
      baseScores: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
      bgBonusChoice: { int: 2, con: 1 }, // 2024 +2 INT / +1 CON
      chosenSkills: ['investigation', 'insight'],
      selectedSpells: ['firebolt', 'mage-armor', 'shield'],
    });

    expect(char.level).toBe(1);
    expect(char.ruleset).toBe('2024');
    expect(char.className).toBe('Wizard');

    // Abilities: Base 15 INT + 2 = 17 (+3 mod)
    // Base 13 CON + 1 = 14 (+2 mod)
    expect(char.sheet.abilities.scoreBonuses.int).toBe(2);
    expect(char.sheet.abilities.scoreBonuses.con).toBe(1);

    // HP: Wizard d6 (6) + CON mod (+2) = 8
    expect(char.sheet.vitals.hpMax).toBe(8);
    expect(char.sheet.vitals.hpCurrent).toBe(8);

    // 2024: Grants Origin Feat from background
    expect(char.sheet.feats).toHaveLength(1);
    expect(char.sheet.feats[0].name).toBe('Magic Initiate (Wizard)');
    expect(char.sheet.feats[0].isOriginFeat).toBe(true);

    // Spells
    expect(char.spells).toHaveLength(3);
    expect(char.spells.map((s) => s.id)).toEqual(['firebolt', 'mage-armor', 'shield']);
  });
});
