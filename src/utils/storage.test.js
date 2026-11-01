import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCharacterProfiles,
  saveCharacterProfiles,
  createDefaultProfile,
  normalizeSpeeds,
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
});
