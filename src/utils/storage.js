export const STORAGE_KEY = 'dnd_spellbook_data';
export const HOMEBREW_SPELLS_KEY = 'dnd_homebrew_spells';
export const LEGACY_CUSTOM_SPELLS_KEY = 'dnd_custom_spells';
export const SETTINGS_KEY = 'dnd_spellbook_settings';

/**
 * Loads general app settings from localStorage.
 */
export function loadAppSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { skipCopying: false };
    const parsed = JSON.parse(raw);
    return {
      skipCopying: Boolean(parsed?.skipCopying),
    };
  } catch {
    return { skipCopying: false };
  }
}

/**
 * Persists general app settings to localStorage.
 */
export function saveAppSettings(settings) {
  try {
    if (!settings || typeof settings !== 'object') return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving app settings to localStorage', err);
  }
}

/**
 * Loads homebrew user spells from localStorage (with fallback to old custom key).
 */
export function loadHomebrewSpells() {
  try {
    const raw = localStorage.getItem(HOMEBREW_SPELLS_KEY) || localStorage.getItem(LEGACY_CUSTOM_SPELLS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to parse homebrew spells', err);
    return [];
  }
}

/**
 * Persists homebrew user spells to localStorage.
 */
export function saveHomebrewSpells(spells) {
  try {
    if (!Array.isArray(spells)) return;
    localStorage.setItem(HOMEBREW_SPELLS_KEY, JSON.stringify(spells));
  } catch (err) {
    console.error('Error saving homebrew spells', err);
  }
}

/**
 * Creates default modular Character Sheet data.
 */
export function createDefaultSheet(className = 'Wizard') {
  const defaultProficientSaves = {
    Wizard: ['int', 'wis'],
    Sorcerer: ['con', 'cha'],
    Warlock: ['wis', 'cha'],
    Cleric: ['wis', 'cha'],
    Druid: ['int', 'wis'],
    Bard: ['dex', 'cha'],
    Paladin: ['wis', 'cha'],
    Ranger: ['str', 'dex'],
    Fighter: ['str', 'con'],
    Barbarian: ['str', 'con'],
    Rogue: ['dex', 'int'],
    Monk: ['str', 'dex'],
  }[className] || ['int', 'wis'];

  return {
    vitals: {
      hpCurrent: 10,
      hpMax: 10,
      hpTemp: 0,
      ac: 10,
      acFormula: '',
      conditions: {
        exhaustion: 0,
        inspiration: false,
        heroicInspiration: false,
      },
    },
    abilities: {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10,
      saveProficiencies: defaultProficientSaves,
      overrides: {},
    },
    trackedResources: [],
    featuresNotes: '',
    items: [],
    maxAttunement: 3,
  };
}

/**
 * Creates a blank default character profile.
 */
export function createDefaultProfile(name = 'New Adventurer', className = 'Wizard') {
  return {
    id: `char_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    className,
    level: 1,
    customSlots: {},
    slotsUsed: {},
    spells: [], // array of { id: string, prepared: boolean }
    sheet: createDefaultSheet(className),
  };
}

/**
 * Safely loads character profiles and active profile ID from localStorage.
 */
export function loadCharacterProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        profiles: [],
        activeId: null,
      };
    }

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.profiles)) {
      return {
        profiles: [],
        activeId: null,
      };
    }

    const profiles = parsed.profiles.map(p => {
      if (!p || typeof p !== 'object') return p;
      if (!p.sheet) {
        return {
          ...p,
          sheet: createDefaultSheet(p.className || 'Wizard'),
        };
      }
      return p;
    });

    const activeId = parsed.activeId && profiles.some(p => p.id === parsed.activeId)
      ? parsed.activeId
      : (profiles[0]?.id || null);

    return {
      profiles,
      activeId,
    };
  } catch (err) {
    console.warn('Failed to parse character storage data, returning empty profiles', err);
    return {
      profiles: [],
      activeId: null,
    };
  }
}

/**
 * Persists character profiles and active ID into localStorage.
 */
export function saveCharacterProfiles(data) {
  try {
    if (!data || !Array.isArray(data.profiles)) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving character profiles to localStorage', err);
  }
}
