import { describe, it, expect } from 'vitest';
import {
  getClassHitDie,
  isAsiLevel,
  getSubclassLevel,
  getLevelUpChecklist,
  getPendingLevelUpTasks,
} from './levelUpRules';

describe('levelUpRules', () => {
  describe('getClassHitDie', () => {
    it('returns correct hit die per class', () => {
      expect(getClassHitDie('Wizard')).toBe(6);
      expect(getClassHitDie('Sorcerer')).toBe(6);
      expect(getClassHitDie('Rogue')).toBe(8);
      expect(getClassHitDie('Cleric')).toBe(8);
      expect(getClassHitDie('Fighter')).toBe(10);
      expect(getClassHitDie('Paladin')).toBe(10);
      expect(getClassHitDie('Barbarian')).toBe(12);
      expect(getClassHitDie('Unknown')).toBe(8);
    });
  });

  describe('isAsiLevel', () => {
    it('returns true at standard ASI levels for all classes', () => {
      for (const lvl of [4, 8, 12, 16, 19]) {
        expect(isAsiLevel('Wizard', lvl)).toBe(true);
        expect(isAsiLevel('Cleric', lvl)).toBe(true);
      }
      expect(isAsiLevel('Wizard', 6)).toBe(false);
      expect(isAsiLevel('Wizard', 10)).toBe(false);
    });

    it('returns true for Fighter bonus ASIs at levels 6 and 14', () => {
      expect(isAsiLevel('Fighter', 6)).toBe(true);
      expect(isAsiLevel('Fighter', 14)).toBe(true);
      expect(isAsiLevel('Fighter', 5)).toBe(false);
    });

    it('returns true for Rogue bonus ASI at level 10', () => {
      expect(isAsiLevel('Rogue', 10)).toBe(true);
      expect(isAsiLevel('Rogue', 6)).toBe(false);
    });
  });

  describe('getSubclassLevel', () => {
    it('returns level 1 for Cleric, Sorcerer, Warlock', () => {
      expect(getSubclassLevel('Cleric')).toBe(1);
      expect(getSubclassLevel('Sorcerer')).toBe(1);
      expect(getSubclassLevel('Warlock')).toBe(1);
    });

    it('returns level 2 for Druid, Wizard', () => {
      expect(getSubclassLevel('Druid')).toBe(2);
      expect(getSubclassLevel('Wizard')).toBe(2);
    });

    it('returns level 3 for Fighter, Rogue, Paladin, Bard, etc.', () => {
      expect(getSubclassLevel('Fighter')).toBe(3);
      expect(getSubclassLevel('Rogue')).toBe(3);
      expect(getSubclassLevel('Paladin')).toBe(3);
      expect(getSubclassLevel('Bard')).toBe(3);
      expect(getSubclassLevel('Barbarian')).toBe(3);
    });
  });

  describe('getLevelUpChecklist', () => {
    it('generates HP, Spellbook spells, and Cantrip scaling for a Level 5 Wizard', () => {
      const checklist = getLevelUpChecklist({
        className: 'Wizard',
        classLevel: 5,
        totalLevel: 5,
        conMod: 2,
      });

      const titles = checklist.map((t) => t.title);
      expect(titles).toContain('Hit Points & Hit Dice');
      expect(titles).toContain('Spellbook Spells');
      expect(titles).toContain('Cantrip Damage Scaling');

      const hpTask = checklist.find((t) => t.title === 'Hit Points & Hit Dice');
      expect(hpTask.description).toContain('+1d6 Hit Die');
      expect(hpTask.description).toContain('6 HP (fixed average)');
      expect(hpTask.description).toContain('1d6 + 2');

      const spellTask = checklist.find((t) => t.title === 'Spellbook Spells');
      expect(spellTask.description).toContain('2 new Wizard spells');
    });

    it('generates ASI task when hitting level 4', () => {
      const checklist = getLevelUpChecklist({
        className: 'Fighter',
        classLevel: 4,
        totalLevel: 4,
        conMod: 1,
      });

      const asiTask = checklist.find((t) => t.title.includes('Ability Score Improvement'));
      expect(asiTask).toBeDefined();
      expect(asiTask.category).toBe('Abilities');
      expect(asiTask.badge).toBe('Abilities');
    });

    it('generates subclass task at the appropriate level', () => {
      const wizardLvl2 = getLevelUpChecklist({
        className: 'Wizard',
        classLevel: 2,
        totalLevel: 2,
      });
      expect(wizardLvl2.some((t) => t.title.includes('Subclass'))).toBe(true);

      const fighterLvl3 = getLevelUpChecklist({
        className: 'Fighter',
        classLevel: 3,
        totalLevel: 3,
      });
      expect(fighterLvl3.some((t) => t.title.includes('Subclass'))).toBe(true);

      const fighterLvl2 = getLevelUpChecklist({
        className: 'Fighter',
        classLevel: 2,
        totalLevel: 2,
      });
      expect(fighterLvl2.some((t) => t.title.includes('Subclass'))).toBe(false);
    });

    it('generates Monk Ki and Paladin Lay on Hands pools', () => {
      const monk = getLevelUpChecklist({
        className: 'Monk',
        classLevel: 5,
        totalLevel: 5,
      });
      expect(monk.some((t) => t.description.includes('Max Ki Points increases to 5'))).toBe(true);

      const paladin = getLevelUpChecklist({
        className: 'Paladin',
        classLevel: 4,
        totalLevel: 4,
      });
      expect(paladin.some((t) => t.description.includes('Lay on Hands healing pool increases by +5'))).toBe(true);
    });

    it('generates Rogue sneak attack scaling on odd levels', () => {
      const rogue5 = getLevelUpChecklist({
        className: 'Rogue',
        classLevel: 5,
        totalLevel: 5,
      });
      expect(rogue5.some((t) => t.description.includes('3d6'))).toBe(true);

      const rogue4 = getLevelUpChecklist({
        className: 'Rogue',
        classLevel: 4,
        totalLevel: 4,
      });
      expect(rogue4.some((t) => t.title.includes('Sneak Attack'))).toBe(false);
    });

    it('generates accurate 1st-level starting choices for Wizard', () => {
      const wiz1 = getLevelUpChecklist({
        className: 'Wizard',
        classLevel: 1,
        totalLevel: 1,
        conMod: 2,
      });

      const hpTask = wiz1.find((t) => t.id === 'hp-Wizard-1');
      expect(hpTask.description).toContain('Set Base Max HP to 8');
      expect(hpTask.description).toContain('6 max die + 2');

      const spellTask = wiz1.find((t) => t.id === 'spells-wizard-1');
      expect(spellTask.title).toBe('Starting Spellbook & Cantrips');
      expect(spellTask.description).toContain('Choose 3 Wizard cantrips and add 6 1st-level Wizard spells');
    });

    it('generates accurate 1st-level starting choices for Bard, Sorcerer, and Warlock', () => {
      const bard1 = getLevelUpChecklist({ className: 'Bard', classLevel: 1, totalLevel: 1 });
      const bardSpell = bard1.find((t) => t.id === 'spells-known-Bard-1');
      expect(bardSpell.description).toContain('Choose 2 Bard cantrips and learn 4 1st-level spells');
      expect(bard1.some((t) => t.id === 'bard-inspiration-1')).toBe(true);

      const sorc1 = getLevelUpChecklist({ className: 'Sorcerer', classLevel: 1, totalLevel: 1 });
      const sorcSpell = sorc1.find((t) => t.id === 'spells-known-Sorcerer-1');
      expect(sorcSpell.description).toContain('Choose 4 Sorcerer cantrips and learn 2 1st-level spells');
      expect(sorc1.some((t) => t.title.includes('Subclass'))).toBe(true);
    });

    it('does not give Paladins or Rangers spells at 1st level', () => {
      const paladin1 = getLevelUpChecklist({ className: 'Paladin', classLevel: 1, totalLevel: 1 });
      expect(paladin1.some((t) => t.category === 'Spells')).toBe(false);
      expect(paladin1.some((t) => t.title.includes('Lay on Hands & Divine Sense'))).toBe(true);

      const paladin2 = getLevelUpChecklist({ className: 'Paladin', classLevel: 2, totalLevel: 2 });
      expect(paladin2.some((t) => t.category === 'Spells')).toBe(true);

      const ranger1 = getLevelUpChecklist({ className: 'Ranger', classLevel: 1, totalLevel: 1 });
      expect(ranger1.some((t) => t.category === 'Spells')).toBe(false);

      const ranger2 = getLevelUpChecklist({ className: 'Ranger', classLevel: 2, totalLevel: 2 });
      expect(ranger2.some((t) => t.category === 'Spells')).toBe(true);
      expect(ranger2.find((t) => t.id === 'spells-known-ranger-2').description).toContain('Learn 2 1st-level Ranger spells');
    });

    it('generates Barbarian and Fighter 1st-level features', () => {
      const barb1 = getLevelUpChecklist({ className: 'Barbarian', classLevel: 1, totalLevel: 1 });
      expect(barb1.some((t) => t.id === 'barb-rage-1')).toBe(true);
      expect(barb1.some((t) => t.id === 'barb-unarmored-1')).toBe(true);

      const fighter1 = getLevelUpChecklist({ className: 'Fighter', classLevel: 1, totalLevel: 1 });
      expect(fighter1.some((t) => t.id === 'fighter-wind-1')).toBe(true);
    });
  });

  describe('getPendingLevelUpTasks', () => {
    it('returns all tasks when character has no checked items', () => {
      const char = {
        className: 'Wizard',
        level: 2,
        classes: [{ className: 'Wizard', level: 2 }],
        abilities: { con: 12 },
        levelUpChecklist: {},
      };
      const pending = getPendingLevelUpTasks(char);
      expect(pending.length).toBeGreaterThan(0);
      expect(pending.some((t) => t.id === 'hp-Wizard-2')).toBe(true);
      expect(pending.some((t) => t.id === 'spells-wizard-2')).toBe(true);
    });

    it('excludes checked items', () => {
      const char = {
        className: 'Wizard',
        level: 2,
        classes: [{ className: 'Wizard', level: 2 }],
        abilities: { con: 12 },
        levelUpChecklist: {
          'hp-Wizard-2': true,
        },
      };
      const pending = getPendingLevelUpTasks(char);
      expect(pending.some((t) => t.id === 'hp-Wizard-2')).toBe(false);
      expect(pending.some((t) => t.id === 'spells-wizard-2')).toBe(true);
    });

    it('distinguishes action items from passive notices', () => {
      const wizard5 = getLevelUpChecklist({
        className: 'Wizard',
        classLevel: 5,
        totalLevel: 5,
      });

      const cantripTask = wizard5.find((t) => t.id === 'cantrip-tier-5');
      expect(cantripTask.type).toBe('passive');
      expect(cantripTask.badge).toBe('Passive Rule');

      const hpTask = wizard5.find((t) => t.id === 'hp-Wizard-5');
      expect(hpTask.type).toBe('action');
      expect(hpTask.badge).toBe('Vitals');
    });

    it('returns empty array when all items are checked', () => {
      const char = {
        className: 'Wizard',
        level: 1,
        classes: [{ className: 'Wizard', level: 1 }],
        abilities: { con: 10 },
        levelUpChecklist: {
          'hp-Wizard-1': true,
          'spells-wizard-1': true,
        },
      };
      const pending = getPendingLevelUpTasks(char);
      expect(pending.length).toBe(0);
    });

    it('does not treat passive rules as pending tasks', () => {
      const char = {
        className: 'Wizard',
        level: 5,
        classes: [{ className: 'Wizard', level: 5 }],
        abilities: { con: 10 },
        levelUpChecklist: {
          'hp-Wizard-5': true,
          'spells-wizard-5': true,
        },
      };
      // Level 5 has Cantrip Damage Scaling which is passive
      const pending = getPendingLevelUpTasks(char);
      expect(pending.length).toBe(0);
    });
  });
});
