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

  describe('starting equipment and gold', () => {
    const cls2024 = {
      name: 'Fighter',
      equipmentText:
        'Choose A, B, or C: (A) Chain Mail, Greatsword, and 4 GP; (B) Longbow, Arrows (20), and 11 GP; or (C) 155 GP',
    };
    const bg2024 = {
      name: 'Soldier',
      equipmentText: 'Choose A or B: (A) Spear, 2 Pouch, 14 GP; or (B) 50 GP',
    };
    const cls2014 = { name: 'Fighter', equipmentText: 'Standard class starting equipment or starting wealth.' };
    const bg2014 = { name: 'Soldier', equipmentText: 'An insignia of rank, and a belt pouch containing 10 gp' };

    it('2024: class gear + background gear adds both packages and GP', () => {
      const char = buildLevel1Character({
        ruleset: '2024', selectedClass: cls2024, selectedBackground: bg2024,
        classEquipmentOption: 'A', backgroundEquipmentOption: 'A',
      });
      expect(char.sheet.currency.gp).toBe(18);
      const names = char.sheet.items.map((i) => i.name);
      expect(names).toEqual(expect.arrayContaining(['Chain Mail', 'Greatsword', 'Spear', 'Pouch']));
      expect(char.sheet.items.find((i) => i.name === 'Pouch').quantity).toBe(2);
    });

    it('2024: gold for both is 205 GP with no items', () => {
      const char = buildLevel1Character({
        ruleset: '2024', selectedClass: cls2024, selectedBackground: bg2024,
        classEquipmentOption: 'C', backgroundEquipmentOption: 'B',
      });
      expect(char.sheet.currency.gp).toBe(205);
      expect(char.sheet.items).toHaveLength(0);
    });

    it('2024: mixes class gear with background gold', () => {
      const char = buildLevel1Character({
        ruleset: '2024', selectedClass: cls2024, selectedBackground: bg2024,
        classEquipmentOption: 'B', backgroundEquipmentOption: 'B',
      });
      expect(char.sheet.currency.gp).toBe(61);
      expect(char.sheet.items.map((i) => i.name)).toContain('Longbow');
    });

    it('2014: standard gear grants background gear and its pouch gold', () => {
      const char = buildLevel1Character({
        ruleset: '2014', selectedClass: cls2014, selectedBackground: bg2014, startingWealthMode: 'gear',
      });
      expect(char.sheet.currency.gp).toBe(10);
      expect(char.sheet.items.length).toBeGreaterThan(0);
    });

    it('2014: starting wealth replaces ALL gear and uses rolled gold', () => {
      const char = buildLevel1Character({
        ruleset: '2014', selectedClass: cls2014, selectedBackground: bg2014,
        startingWealthMode: 'wealth', rolledGold: 140,
      });
      expect(char.sheet.currency.gp).toBe(140);
      expect(char.sheet.items).toHaveLength(0);
    });
  });
});
