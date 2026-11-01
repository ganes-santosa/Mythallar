import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCharacterProfiles,
  saveCharacterProfiles,
  createDefaultProfile,
  normalizeSpeeds,
  normalizeHitDice,
  recoverHitDiceOnLongRest,
  STORAGE_KEY,
  loadAppSettings,
  saveAppSettings,
  SETTINGS_KEY,
} from './storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('generates a valid default character profile', () => {
    const char = createDefaultProfile('Gandalf');
    expect(char.name).toBe('Gandalf');
    expect(char.className).toBe('Wizard');
    expect(char.level).toBe(1);
    expect(char.spells).toEqual([]);
    expect(char.slotsUsed).toEqual({});
    expect(char.customSlots).toEqual({});
    expect(char.sheet).toBeDefined();
    expect(char.sheet.abilities.int).toBe(10);
    expect(char.sheet.abilities.saveProficiencies).toEqual(['int', 'wis']);
    expect(char.sheet.maxAttunement).toBe(3);
    expect(char.sheet.items).toEqual([]);
    expect(char.sheet.skills.stealth).toBe('none');
    expect(char.sheet.senses.darkvision).toBe(0);
    expect(char.sheet.vitals.speed).toBe(30);
    expect(char.sheet.vitals.deathSaves).toEqual({ successes: 0, failures: 0 });
    expect(char.sheet.vitals.hpMaxBuff).toBe(0);
    expect(char.sheet.proficiencies.languages).toEqual(['Common']);
    expect(char.sheet.identity.race).toBe('');
  });

  it('populates default sheet data when loading legacy profiles lacking sheet property', () => {
    const legacyProfile = {
      id: 'char_legacy',
      name: 'Old Timer',
      className: 'Sorcerer',
      level: 3,
      spells: [],
      slotsUsed: {},
      customSlots: {},
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      profiles: [legacyProfile],
      activeId: 'char_legacy',
    }));

    const loaded = loadCharacterProfiles();
    expect(loaded.profiles[0].sheet).toBeDefined();
    expect(loaded.profiles[0].sheet.abilities.saveProficiencies).toEqual(['con', 'cha']);
    expect(loaded.profiles[0].sheet.vitals.hpCurrent).toBe(10);
  });

  it('returns empty profiles and null activeId when localStorage is empty', () => {
    const data = loadCharacterProfiles();
    expect(data.profiles).toEqual([]);
    expect(data.activeId).toBeNull();
  });

  it('saves and reloads profiles accurately', () => {
    const char = createDefaultProfile('Elminster');
    char.level = 5;
    saveCharacterProfiles({ profiles: [char], activeId: char.id });

    const loaded = loadCharacterProfiles();
    expect(loaded.profiles.length).toBe(1);
    expect(loaded.profiles[0].name).toBe('Elminster');
    expect(loaded.profiles[0].level).toBe(5);
    expect(loaded.activeId).toBe(char.id);
  });

  it('recovers with fallback when localStorage JSON is corrupted', () => {
    localStorage.setItem(STORAGE_KEY, '{invalid-json');
    const data = loadCharacterProfiles();
    expect(data.profiles).toEqual([]);
    expect(data.activeId).toBeNull();
  });

  it('loads and saves app settings including skipCopying option', () => {
    // Default when empty
    expect(loadAppSettings()).toEqual({ skipCopying: false });

    saveAppSettings({ skipCopying: true });
    expect(loadAppSettings()).toEqual({ skipCopying: true });

    // Fallback on invalid JSON
    localStorage.setItem(SETTINGS_KEY, 'invalid-json');
    expect(loadAppSettings()).toEqual({ skipCopying: false });
  });

  it('normalizes legacy vitals.speed into speeds object with walk', () => {
    const legacyVitals = { speed: 30 };
    const normalized = normalizeSpeeds(legacyVitals);
    expect(normalized).toEqual({ walk: 30 });
  });

  it('preserves existing vitals.speeds object with secondary modes', () => {
    const modernVitals = { speeds: { walk: 30, fly: 60 } };
    const normalized = normalizeSpeeds(modernVitals);
    expect(normalized).toEqual({ walk: 30, fly: 60 });
  });

  describe('normalizeHitDice', () => {
    it('normalizes single class character hit dice based on level and class', () => {
      const char = { className: 'Rogue', level: 5 };
      const vitals = {};
      const result = normalizeHitDice(vitals, char);
      expect(result.max).toBe(5);
      expect(result.current).toBe(5);
      expect(result.die).toBe('d8');
      expect(result.pools).toEqual({
        d8: { current: 5, max: 5, classNames: ['Rogue'] },
      });
    });

    it('normalizes multiclass character hit dice with separate pools', () => {
      const char = {
        className: 'Rogue',
        level: 5,
        classes: [
          { className: 'Rogue', level: 3 },
          { className: 'Fighter', level: 2 },
        ],
      };
      const vitals = {};
      const result = normalizeHitDice(vitals, char);
      expect(result.max).toBe(5);
      expect(result.current).toBe(5);
      expect(result.pools.d8).toEqual({ current: 3, max: 3, classNames: ['Rogue'] });
      expect(result.pools.d10).toEqual({ current: 2, max: 2, classNames: ['Fighter'] });
    });

    it('preserves spent hit dice across normalization', () => {
      const char = { className: 'Wizard', level: 4 };
      const vitals = {
        hitDice: {
          current: 2, // 2 spent out of 4
          max: 4,
          die: 'd6',
          pools: {
            d6: { current: 2, max: 4, classNames: ['Wizard'] },
          },
        },
      };
      const result = normalizeHitDice(vitals, char);
      expect(result.max).toBe(4);
      expect(result.current).toBe(2);
      expect(result.pools.d6.current).toBe(2);
      expect(result.pools.d6.max).toBe(4);
    });

    it('normalizes legacy vitals with static max:1 to character level', () => {
      const char = { className: 'Barbarian', level: 6 };
      const legacyVitals = {
        hitDice: { current: 1, max: 1, die: 'd6' }, // legacy default
      };
      const result = normalizeHitDice(legacyVitals, char);
      expect(result.max).toBe(6);
      expect(result.current).toBe(6);
      expect(result.die).toBe('d12');
      expect(result.pools.d12.max).toBe(6);
    });
  });

  describe('recoverHitDiceOnLongRest', () => {
    it('recovers half total level hit dice (minimum 1) on long rest', () => {
      // Level 5 character: Math.max(1, Math.floor(5 / 2)) = 2 dice recovered
      const hitDice = {
        current: 1,
        max: 5,
        die: 'd8',
        pools: {
          d8: { current: 1, max: 5, classNames: ['Rogue'] },
        },
      };
      const result = recoverHitDiceOnLongRest(hitDice, 5);
      expect(result.current).toBe(3);
      expect(result.pools.d8.current).toBe(3);
    });

    it('guarantees minimum 1 die recovered for level 1 character', () => {
      const hitDice = {
        current: 0,
        max: 1,
        die: 'd6',
        pools: {
          d6: { current: 0, max: 1, classNames: ['Wizard'] },
        },
      };
      const result = recoverHitDiceOnLongRest(hitDice, 1);
      expect(result.current).toBe(1);
      expect(result.pools.d6.current).toBe(1);
    });

    it('recovers larger die first for multiclass character', () => {
      // Level 5: Barbarian 3 (d12) / Rogue 2 (d8). 2 dice recovered.
      // Both pools empty: should recover 2 d12s first.
      const hitDice = {
        current: 0,
        max: 5,
        die: 'd12',
        pools: {
          d8: { current: 0, max: 2, classNames: ['Rogue'] },
          d12: { current: 0, max: 3, classNames: ['Barbarian'] },
        },
      };
      const result = recoverHitDiceOnLongRest(hitDice, 5);
      expect(result.current).toBe(2);
      expect(result.pools.d12.current).toBe(2);
      expect(result.pools.d8.current).toBe(0);
    });

    it('does not exceed maximum hit dice capacity', () => {
      const hitDice = {
        current: 4,
        max: 5,
        die: 'd10',
        pools: {
          d10: { current: 4, max: 5, classNames: ['Fighter'] },
        },
      };
      // Can only recover 1 to hit max 5, even if budget is 2
      const result = recoverHitDiceOnLongRest(hitDice, 5);
      expect(result.current).toBe(5);
      expect(result.pools.d10.current).toBe(5);
    });
  });
});
