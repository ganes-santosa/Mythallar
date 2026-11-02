import { getClassHitDie } from './dndCalculations';

export const STORAGE_KEY = 'dnd_spellbook_data';
export const HOMEBREW_SPELLS_KEY = 'dnd_homebrew_spells';
export const LEGACY_CUSTOM_SPELLS_KEY = 'dnd_custom_spells';
export const SETTINGS_KEY = 'dnd_spellbook_settings';

/**
 * Normalizes vitals movement speeds supporting both legacy numeric speed
 * and structured multi-speed objects (walk, climb, swim, fly, burrow).
 */
export function normalizeSpeeds(vitals = {}) {
  if (vitals && typeof vitals.speeds === 'object' && vitals.speeds !== null) {
    const walkVal = Number(vitals.speeds.walk);
    const result = {
      walk: !isNaN(walkVal) && walkVal >= 0 ? walkVal : 30,
    };
    for (const [key, val] of Object.entries(vitals.speeds)) {
      if (key === 'walk') continue;
      const num = Number(val);
      if (!isNaN(num) && num > 0) {
        result[key] = num;
      }
    }
    return result;
  }
  if (vitals && typeof vitals.speed === 'number' && !isNaN(vitals.speed)) {
    return { walk: Math.max(0, vitals.speed) };
  }
  return { walk: 30 };
}

/**
 * Normalizes hit dice pool based on character class(es) and level(s).
 * Supports multiclass characters with distinct pools per die type.
 */
export function normalizeHitDice(vitals = {}, character = {}) {
  const existingDie = vitals?.hitDice?.die;
  const fallbackClass = character?.className
    || vitals?.hitDice?.classNames?.[0]
    || (existingDie === 'd6' ? 'Wizard' : existingDie === 'd10' ? 'Fighter' : existingDie === 'd12' ? 'Barbarian' : 'Rogue');

  const fallbackLevel = Math.max(1, Number(character?.level) || Number(vitals?.hitDice?.max) || 1);

  const classes = Array.isArray(character?.classes) && character.classes.length > 0
    ? character.classes
    : [{
        className: fallbackClass,
        level: fallbackLevel,
      }];

  const targetPools = {};
  for (const c of classes) {
    const die = getClassHitDie(c.className);
    const lvl = Math.max(1, Number(c.level) || 1);
    if (!targetPools[die]) {
      targetPools[die] = { max: 0, classNames: [] };
    }
    targetPools[die].max += lvl;
    if (c.className && !targetPools[die].classNames.includes(c.className)) {
      targetPools[die].classNames.push(c.className);
    }
  }

  const primaryDie = getClassHitDie(classes[0]?.className || 'Wizard');
  const existing = vitals?.hitDice;
  const existingPools = existing?.pools;

  const resultPools = {};
  let totalMax = 0;
  let totalCurrent = 0;

  if (existingPools && typeof existingPools === 'object') {
    for (const [die, target] of Object.entries(targetPools)) {
      const prev = existingPools[die];
      const prevCurrent = prev?.current !== undefined ? Number(prev.current) : target.max;
      const current = Math.max(0, Math.min(target.max, isNaN(prevCurrent) ? target.max : prevCurrent));
      resultPools[die] = {
        current,
        max: target.max,
        classNames: target.classNames,
      };
      totalMax += target.max;
      totalCurrent += current;
    }
  } else {
    // Legacy single pool or uninitialized
    const isLegacyDefault = existing?.current === 1 && existing?.max === 1 && (Number(character?.level) || 1) > 1;
    let remainingToSpend = 0;
    if (!isLegacyDefault && existing && typeof existing.current === 'number' && typeof existing.max === 'number') {
      remainingToSpend = Math.max(0, existing.max - existing.current);
    }

    for (const [die, target] of Object.entries(targetPools)) {
      const spendFromThis = Math.min(target.max, remainingToSpend);
      remainingToSpend -= spendFromThis;
      const current = target.max - spendFromThis;

      resultPools[die] = {
        current,
        max: target.max,
        classNames: target.classNames,
      };
      totalMax += target.max;
      totalCurrent += current;
    }
  }

  return {
    current: totalCurrent,
    max: totalMax,
    die: primaryDie,
    pools: resultPools,
  };
}

/**
 * Recovers spent hit dice on 5e Long Rest: up to half total level (minimum 1),
 * prioritizing largest dice types first.
 */
export function recoverHitDiceOnLongRest(hitDice = {}, totalLevel = 1) {
  const safeLevel = Math.max(1, Number(totalLevel) || 1);
  let recoveryBudget = Math.max(1, Math.floor(safeLevel / 2));

  const pools = {};
  if (hitDice.pools && typeof hitDice.pools === 'object') {
    for (const [die, pool] of Object.entries(hitDice.pools)) {
      pools[die] = { ...pool };
    }
  } else {
    const die = hitDice.die || 'd8';
    pools[die] = {
      current: hitDice.current ?? 1,
      max: hitDice.max ?? 1,
      classNames: [],
    };
  }

  const sortedDice = Object.keys(pools).sort((a, b) => {
    const sizeA = parseInt(a.replace(/\D/g, ''), 10) || 0;
    const sizeB = parseInt(b.replace(/\D/g, ''), 10) || 0;
    return sizeB - sizeA;
  });

  for (const die of sortedDice) {
    if (recoveryBudget <= 0) break;
    const pool = pools[die];
    const missing = Math.max(0, pool.max - pool.current);
    const toRecover = Math.min(missing, recoveryBudget);
    pool.current += toRecover;
    recoveryBudget -= toRecover;
  }

  let totalCurrent = 0;
  let totalMax = 0;
  for (const p of Object.values(pools)) {
    totalCurrent += p.current;
    totalMax += p.max;
  }

  return {
    ...hitDice,
    current: totalCurrent,
    max: totalMax,
    pools,
  };
}

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

  const defaultHitDie = {
    Wizard: 'd6',
    Sorcerer: 'd6',
    Bard: 'd8',
    Cleric: 'd8',
    Druid: 'd8',
    Monk: 'd8',
    Rogue: 'd8',
    Warlock: 'd8',
    Fighter: 'd10',
    Paladin: 'd10',
    Ranger: 'd10',
    Barbarian: 'd12',
  }[className] || 'd8';

  return {
    identity: {
      race: '',
      subclass: '',
      background: '',
      portrait: '',
      lore: '',
    },
    vitals: {
      hpCurrent: 10,
      hpMax: 10,
      hpMaxBuff: 0,
      hpTemp: 0,
      ac: 10,
      acFormula: '',
      speed: 30,
      speeds: { walk: 30 },
      initiativeOverride: null,
      hitDice: {
        current: 1,
        max: 1,
        die: defaultHitDie,
        pools: {
          [defaultHitDie]: { current: 1, max: 1, classNames: [className] },
        },
      },
      deathSaves: {
        successes: 0,
        failures: 0,
      },
      defenses: [],
      inspiration: 0,
      exhaustion: 0,
      conditions: [],
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
    skills: {
      acrobatics: 'none',
      animalHandling: 'none',
      arcana: 'none',
      athletics: 'none',
      deception: 'none',
      history: 'none',
      insight: 'none',
      intimidation: 'none',
      investigation: 'none',
      medicine: 'none',
      nature: 'none',
      perception: 'none',
      performance: 'none',
      persuasion: 'none',
      religion: 'none',
      sleightOfHand: 'none',
      stealth: 'none',
      survival: 'none',
    },
    senses: {
      darkvision: 0,
      custom: '',
    },
    proficiencies: {
      armor: [],
      weapons: [],
      tools: [],
      languages: ['Common'],
    },
    trackedResources: [],
    featuresNotes: '',
    feats: [],
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
      const defaultSheet = createDefaultSheet(p.className || 'Wizard');
      if (!p.sheet) {
        return {
          ...p,
          sheet: defaultSheet,
        };
      }
      return {
        ...p,
        sheet: {
          ...defaultSheet,
          ...p.sheet,
          vitals: { ...defaultSheet.vitals, ...(p.sheet.vitals || {}) },
          abilities: { ...defaultSheet.abilities, ...(p.sheet.abilities || {}) },
          skills: { ...defaultSheet.skills, ...(p.sheet.skills || {}) },
          senses: { ...defaultSheet.senses, ...(p.sheet.senses || {}) },
          proficiencies: { ...defaultSheet.proficiencies, ...(p.sheet.proficiencies || {}) },
          identity: { ...defaultSheet.identity, ...(p.sheet.identity || {}) },
        },
      };
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
