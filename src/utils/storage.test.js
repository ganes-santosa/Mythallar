import { describe, it, expect, beforeEach } from 'vitest';
import { loadCharacterProfiles, saveCharacterProfiles, createDefaultProfile, STORAGE_KEY } from './storage';

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
  });

  it('returns a new default profile when localStorage is empty', () => {
    const data = loadCharacterProfiles();
    expect(data.profiles.length).toBe(1);
    expect(data.activeId).toBe(data.profiles[0].id);
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
    expect(data.profiles.length).toBe(1);
    expect(data.activeId).toBe(data.profiles[0].id);
  });
});
