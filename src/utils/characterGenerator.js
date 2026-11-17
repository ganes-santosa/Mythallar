/**
 * Assembles a complete, compliant Level 1 character profile
 * from Character Builder selections for either 2014 or 2024 ruleset.
 */

import { getAbilityModifier, getProficiencyBonus } from './dndCalculations';
import { calculateFinalAbilities } from './abilityScoreGenerator';
import { createDefaultSheet } from './storage';

export function buildLevel1Character({
  name = 'New Adventurer',
  ruleset = '2024',
  selectedClass = null,
  selectedSubclass = null,
  selectedSpecies = null,
  selectedSubrace = null,
  selectedBackground = null,
  baseScores = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  bgBonusChoice = {}, // 2024 background ASI
  racialChoice = {}, // 2014 racial custom choice (e.g. Half-Elf)
  chosenSkills = [], // array of skill keys (e.g. 'athletics', 'perception')
  equipmentOption = 'A', // 'A' or 'B'
  selectedSpells = [], // array of spell ids or objects
  details = {},
}) {
  const className = selectedClass?.name || 'Fighter';
  const defaultSheet = createDefaultSheet(className);

  // 1. Calculate Abilities & Modifiers
  const { bonuses, finalScores, modifiers } = calculateFinalAbilities({
    baseScores,
    ruleset,
    race: selectedSpecies,
    subrace: selectedSubrace,
    background: selectedBackground,
    bgBonusChoice,
    racialChoice,
  });

  // 2. Calculate HP
  // Level 1: Max hit die faces + CON modifier (minimum 1).
  // Plus Dwarven Toughness trait if Dwarf (+1 HP).
  const hitDie = selectedClass?.hitDie || 8;
  const conMod = modifiers.con ?? 0;
  const isDwarf = selectedSpecies?.name?.toLowerCase().includes('dwarf') ||
                  selectedSubrace?.name?.toLowerCase().includes('hill dwarf');
  const dwarfBonus = isDwarf ? 1 : 0;
  const baseHpMax = Math.max(1, hitDie + conMod + dwarfBonus);

  // 3. Determine Speed & Darkvision & Size
  const speed = selectedSubrace?.speed || selectedSpecies?.speed || 30;
  const darkvision = selectedSubrace?.darkvision || selectedSpecies?.darkvision || 0;
  const raceName = selectedSubrace?.name || selectedSpecies?.name || '';

  // 4. Saving Throws
  const saveProficiencies = selectedClass?.savingThrows || ['str', 'con'];

  // 5. Skills
  // Combine class skill choices and background skill proficiencies
  const allProficientSkills = new Set([
    ...(chosenSkills || []),
    ...(selectedBackground?.skillProficiencies || []),
  ]);
  const skillsState = { ...defaultSheet.skills };
  for (const skillKey of allProficientSkills) {
    if (skillKey in skillsState) {
      skillsState[skillKey] = 'proficient';
    }
  }

  // 6. Starting Feats
  // In 2024: background grants an Origin Feat!
  const feats = [];
  if (ruleset === '2024' && selectedBackground?.originFeat) {
    feats.push({
      id: `feat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: selectedBackground.originFeat,
      source: 'XPHB',
      typeLine: 'Origin Feat',
      description: `Granted by the ${selectedBackground.name} background.`,
      isOriginFeat: true,
    });
  }

  // 7. Starting Equipment & Currency
  let items = [];
  let startingGold = 0;

  if (equipmentOption === 'B') {
    // Starting gold option
    startingGold = 100;
  } else {
    // Standard equipment: add common items to inventory
    const basicPack = [
      { id: `item_${Date.now()}_1`, name: 'Backpack', category: 'Gear', quantity: 1, weight: 5 },
      { id: `item_${Date.now()}_2`, name: 'Bedroll', category: 'Gear', quantity: 1, weight: 7 },
      { id: `item_${Date.now()}_3`, name: 'Rations (1 day)', category: 'Gear', quantity: 5, weight: 10 },
      { id: `item_${Date.now()}_4`, name: 'Waterskin', category: 'Gear', quantity: 1, weight: 5 },
      { id: `item_${Date.now()}_5`, name: 'Torches', category: 'Gear', quantity: 10, weight: 10 },
    ];
    items = basicPack;
    startingGold = 10;
  }

  // 8. Class & Racial Features Notes
  const featureList = [];
  if (selectedSpecies?.traits) {
    for (const t of selectedSpecies.traits) {
      featureList.push(`• ${t.name}: ${t.description}`);
    }
  }
  if (selectedSubrace?.traits) {
    for (const t of selectedSubrace.traits) {
      featureList.push(`• ${t.name}: ${t.description}`);
    }
  }
  if (selectedClass?.level1Features) {
    for (const f of selectedClass.level1Features) {
      featureList.push(`• ${f.name} (Lvl 1 ${className}): ${f.description}`);
    }
  }
  if (ruleset === '2014' && selectedBackground?.feature) {
    featureList.push(`• Background Feature - ${selectedBackground.feature.name}: ${selectedBackground.feature.description}`);
  }

  const featuresNotes = featureList.join('\n\n');

  // 9. Spells (cantrips & 1st level spells)
  const formattedSpells = (selectedSpells || []).map((s) => ({
    id: typeof s === 'string' ? s : s.id,
    prepared: true,
  }));

  // 10. Spell Slots
  // Full casters get 2 slots at level 1; Warlock gets 1; non-casters get 0
  const slotsUsed = {};

  // 11. Personality Notes
  const notes = [];
  if (details.personalityTraits) {
    notes.push({ id: `note_1`, title: 'Personality Traits', content: details.personalityTraits });
  }
  if (details.ideals) {
    notes.push({ id: `note_2`, title: 'Ideals', content: details.ideals });
  }
  if (details.bonds) {
    notes.push({ id: `note_3`, title: 'Bonds', content: details.bonds });
  }
  if (details.flaws) {
    notes.push({ id: `note_4`, title: 'Flaws', content: details.flaws });
  }

  return {
    id: `char_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || 'New Adventurer',
    className,
    level: 1, // STRICT CONSTRAINT: always Level 1
    classes: [{ className, level: 1 }],
    ruleset,
    customSlots: {},
    slotsUsed,
    spells: formattedSpells,
    sheet: {
      ...defaultSheet,
      identity: {
        race: raceName,
        subclass: (typeof selectedSubclass === 'string' ? selectedSubclass : selectedSubclass?.name) || '',
        background: selectedBackground?.name || '',
        portrait: details.portrait || '',
        lore: details.backstory || '',
        alignment: details.alignment || '',
      },
      vitals: {
        ...defaultSheet.vitals,
        hpCurrent: baseHpMax,
        hpMax: baseHpMax,
        hpMaxBuff: 0,
        hpTemp: 0,
        ac: 10 + (modifiers.dex || 0),
        speed,
        speeds: { walk: speed },
        hitDice: {
          current: 1,
          max: 1,
          die: selectedClass?.hitDieString || 'd8',
          pools: {
            [selectedClass?.hitDieString || 'd8']: {
              current: 1,
              max: 1,
              classNames: [className],
            },
          },
        },
      },
      abilities: {
        str: baseScores.str || 10,
        dex: baseScores.dex || 10,
        con: baseScores.con || 10,
        int: baseScores.int || 10,
        wis: baseScores.wis || 10,
        cha: baseScores.cha || 10,
        saveProficiencies,
        scoreBonuses: bonuses,
        saveBonuses: {},
        overrides: {},
      },
      skills: skillsState,
      senses: {
        ...defaultSheet.senses,
        darkvision,
      },
      proficiencies: {
        armor: selectedClass?.armorProficiencies || [],
        weapons: selectedClass?.weaponProficiencies || [],
        tools: selectedBackground?.toolProficiencies || [],
        languages: ['Common'],
      },
      trackedResources: [],
      featuresNotes,
      feats,
      currency: { cp: 0, sp: 0, ep: 0, gp: startingGold, pp: 0 },
      items,
      notes,
    },
  };
}
