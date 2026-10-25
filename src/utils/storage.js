export const STORAGE_KEY = 'dnd_spellbook_data';

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
  };
}

/**
 * Safely loads character profiles and active profile ID from localStorage.
 */
export function loadCharacterProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaultChar = createDefaultProfile('Mordenkainen', 'Wizard');
      const initialData = {
        profiles: [defaultChar],
        activeId: defaultChar.id,
      };
      saveCharacterProfiles(initialData);
      return initialData;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.profiles) || parsed.profiles.length === 0) {
      const defaultChar = createDefaultProfile('Mordenkainen', 'Wizard');
      return {
        profiles: [defaultChar],
        activeId: defaultChar.id,
      };
    }

    const activeId = parsed.activeId && parsed.profiles.some(p => p.id === parsed.activeId)
      ? parsed.activeId
      : parsed.profiles[0].id;

    return {
      profiles: parsed.profiles,
      activeId,
    };
  } catch (err) {
    console.warn('Failed to parse character storage data, falling back to default profile', err);
    const defaultChar = createDefaultProfile('Mordenkainen', 'Wizard');
    return {
      profiles: [defaultChar],
      activeId: defaultChar.id,
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
