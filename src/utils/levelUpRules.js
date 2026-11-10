/**
 * D&D 5e Level-Up Rules and Checklist Generator
 */

import { getCharacterClasses, getTotalCharacterLevel } from './spellSlots';

export const CLASS_HIT_DICE = {
  Wizard: 6,
  Sorcerer: 6,
  Artificer: 8,
  Bard: 8,
  Cleric: 8,
  Druid: 8,
  Monk: 8,
  Rogue: 8,
  Warlock: 8,
  Fighter: 10,
  Paladin: 10,
  Ranger: 10,
  Barbarian: 12,
};

export function getClassHitDie(className) {
  return CLASS_HIT_DICE[className] || 8;
}

export function isAsiLevel(className, classLevel) {
  if (className === 'Fighter') {
    return [4, 6, 8, 12, 14, 16, 19].includes(classLevel);
  }
  if (className === 'Rogue') {
    return [4, 8, 10, 12, 16, 19].includes(classLevel);
  }
  return [4, 8, 12, 16, 19].includes(classLevel);
}

export function getSubclassLevel(className) {
  if (['Cleric', 'Sorcerer', 'Warlock'].includes(className)) return 1;
  if (['Druid', 'Wizard'].includes(className)) return 2;
  return 3;
}

export function getSubclassLabel(className) {
  switch (className) {
    case 'Artificer': return 'Specialist';
    case 'Barbarian': return 'Primal Path';
    case 'Bard': return 'Bard College';
    case 'Cleric': return 'Divine Domain';
    case 'Druid': return 'Druid Circle';
    case 'Fighter': return 'Martial Archetype';
    case 'Monk': return 'Monastic Tradition';
    case 'Paladin': return 'Sacred Oath';
    case 'Ranger': return 'Ranger Archetype';
    case 'Rogue': return 'Roguish Archetype';
    case 'Sorcerer': return 'Sorcerous Origin';
    case 'Warlock': return 'Otherworldly Patron';
    case 'Wizard': return 'Arcane Tradition';
    default: return 'Subclass Archetype';
  }
}

/**
 * Generates an array of actionable checklist tasks for a character gaining or reviewing a level.
 */
export function getLevelUpChecklist({
  className = 'Wizard',
  classLevel = 1,
  totalLevel = 1,
  conMod = 0,
}) {
  const tasks = [];
  const hitDie = getClassHitDie(className);
  const fixedAvg = Math.floor(hitDie / 2) + 1;
  const avgHpGain = Math.max(1, fixedAvg + conMod);
  const modSign = conMod >= 0 ? `+ ${conMod}` : `- ${Math.abs(conMod)}`;

  // 1. Hit Points & Hit Dice
  if (classLevel === 1) {
    tasks.push({
      id: `hp-${className}-${classLevel}`,
      title: 'Hit Points & Hit Dice',
      category: 'Vitals',
      badge: 'Vitals',
      type: 'action',
      description: `Start with 1 Hit Die (1d${hitDie}). Set Base Max HP to ${Math.max(1, hitDie + conMod)} (${hitDie} max die ${modSign}) in Vitals.`,
    });
  } else {
    tasks.push({
      id: `hp-${className}-${classLevel}`,
      title: 'Hit Points & Hit Dice',
      category: 'Vitals',
      badge: 'Vitals',
      type: 'action',
      description: `Gain +1d${hitDie} Hit Die. Add ${avgHpGain} HP (fixed average) or roll 1d${hitDie} ${modSign} to Base Max HP in Vitals.`,
    });
  }

  // 2. Ability Score Improvement / Feat
  if (isAsiLevel(className, classLevel)) {
    tasks.push({
      id: `asi-${className}-${classLevel}`,
      title: 'Ability Score Improvement / Feat',
      category: 'Abilities',
      badge: 'Abilities',
      type: 'action',
      description: 'Increase one ability score by 2, two ability scores by 1, or choose 1 Feat in Abilities.',
    });
  }

  // 3. Subclass Archetype Choice
  if (classLevel === getSubclassLevel(className)) {
    const label = getSubclassLabel(className);
    tasks.push({
      id: `subclass-${className}-${classLevel}`,
      title: `Choose Subclass (${label})`,
      category: 'Notes',
      badge: 'Notes',
      type: 'action',
      description: `Select your ${label} and record its archetype features and proficiencies in Notes.`,
    });
  }

  // 4. Spellcasting & Spellbook Updates
  if (className === 'Wizard') {
    if (classLevel === 1) {
      tasks.push({
        id: `spells-wizard-${classLevel}`,
        title: 'Starting Spellbook & Cantrips',
        category: 'Spells',
        badge: 'Spells',
        type: 'action',
        description: 'Choose 3 Wizard cantrips and add 6 1st-level Wizard spells to your spellbook.',
      });
    } else {
      tasks.push({
        id: `spells-wizard-${classLevel}`,
        title: 'Spellbook Spells',
        category: 'Spells',
        badge: 'Spells',
        type: 'action',
        description: 'Add 2 new Wizard spells of any level you can cast to your spellbook for free.',
      });
    }
  } else if (['Bard', 'Sorcerer', 'Warlock'].includes(className)) {
    if (classLevel === 1) {
      const cantripsCount = className === 'Sorcerer' ? 4 : 2;
      const spellsKnownCount = className === 'Bard' ? 4 : 2;
      tasks.push({
        id: `spells-known-${className}-${classLevel}`,
        title: 'Starting Spells Known & Cantrips',
        category: 'Spells',
        badge: 'Spells',
        type: 'action',
        description: `Choose ${cantripsCount} ${className} cantrips and learn ${spellsKnownCount} 1st-level spells from your class list.`,
      });
    } else {
      tasks.push({
        id: `spells-known-${className}-${classLevel}`,
        title: 'Spells Known',
        category: 'Spells',
        badge: 'Spells',
        type: 'action',
        description: `Learn 1 new ${className} spell from your class list (and optionally swap 1 known spell).`,
      });
    }
  } else if (className === 'Ranger') {
    if (classLevel === 2) {
      tasks.push({
        id: `spells-known-ranger-${classLevel}`,
        title: 'Spellcasting & Fighting Style',
        category: 'Spells',
        badge: 'Spells',
        type: 'action',
        description: 'Learn 2 1st-level Ranger spells and choose a Fighting Style.',
      });
    } else if (classLevel > 2) {
      tasks.push({
        id: `spells-known-ranger-${classLevel}`,
        title: 'Spells Known',
        category: 'Spells',
        badge: 'Spells',
        type: 'action',
        description: 'Learn 1 new Ranger spell from your class list (and optionally swap 1 known spell).',
      });
    }
  } else if (['Cleric', 'Druid'].includes(className)) {
    if (classLevel === 1) {
      const cantripsCount = className === 'Cleric' ? 3 : 2;
      const domainNote = className === 'Cleric' ? ' plus domain spells' : '';
      tasks.push({
        id: `spells-prep-${className}-${classLevel}`,
        title: 'Starting Cantrips & Prepared Spells',
        category: 'Spells',
        badge: 'Spells',
        type: 'action',
        description: `Choose ${cantripsCount} ${className} cantrips. Prepare 1st-level spells equal to 1 + WIS modifier (min 1)${domainNote}.`,
      });
    } else {
      tasks.push({
        id: `spells-prep-${className}-${classLevel}`,
        title: 'Prepared Spells',
        category: 'Spells',
        badge: 'Spells',
        type: 'action',
        description: 'Your maximum number of prepared spells increases (Level + Modifier). Check newly accessible spell tiers.',
      });
    }
  } else if (className === 'Paladin') {
    if (classLevel === 2) {
      tasks.push({
        id: `spells-prep-paladin-${classLevel}`,
        title: 'Spellcasting & Fighting Style',
        category: 'Spells',
        badge: 'Spells',
        type: 'action',
        description: 'Unlock 1st-level spellcasting (prepare Half Level + CHA modifier, min 1) and choose a Fighting Style.',
      });
    } else if (classLevel > 2) {
      tasks.push({
        id: `spells-prep-paladin-${classLevel}`,
        title: 'Prepared Spells',
        category: 'Spells',
        badge: 'Spells',
        type: 'action',
        description: 'Your maximum number of prepared spells increases (Half Level + Modifier). Check newly accessible spell tiers.',
      });
    }
  } else if (className === 'Artificer') {
    if (classLevel === 1) {
      tasks.push({
        id: `spells-prep-artificer-${classLevel}`,
        title: 'Starting Cantrips & Prepared Spells',
        category: 'Spells',
        badge: 'Spells',
        type: 'action',
        description: 'Choose 2 Artificer cantrips. Prepare 1st-level spells equal to half Level (rounded up, min 1) + INT modifier.',
      });
    } else if (classLevel === 2) {
      tasks.push({
        id: `spells-prep-artificer-${classLevel}`,
        title: 'Infuse Items & Prepared Spells',
        category: 'Spells',
        badge: 'Spells',
        type: 'action',
        description: 'Learn 4 Infusions and infuse up to 2 items. Prepared spell capacity increases.',
      });
    } else {
      tasks.push({
        id: `spells-prep-artificer-${classLevel}`,
        title: 'Prepared Spells & Infusions',
        category: 'Spells',
        badge: 'Spells',
        type: 'action',
        description: 'Prepared spell capacity increases. Check known infusions and maximum infused items.',
      });
    }
  }

  // 5. Cantrip Tier Scaling (based on total character level)
  if ([5, 11, 17].includes(totalLevel)) {
    const tier = totalLevel === 5 ? 'Tier 2 (Level 5)' : totalLevel === 11 ? 'Tier 3 (Level 11)' : 'Tier 4 (Level 17)';
    const diceCount = totalLevel === 5 ? '2 dice (e.g. 2d10)' : totalLevel === 11 ? '3 dice (e.g. 3d10)' : '4 dice (e.g. 4d10)';
    tasks.push({
      id: `cantrip-tier-${totalLevel}`,
      title: 'Cantrip Damage Scaling',
      category: 'Passive Rule',
      badge: 'Passive Rule',
      type: 'passive',
      description: `Character reached ${tier}. Damage cantrips scale up to ${diceCount}.`,
    });
  }

  // 6. Class-specific resource pools & prominent traits
  switch (className) {
    case 'Monk':
      if (classLevel === 1) {
        tasks.push({
          id: `monk-martial-unarmored-${classLevel}`,
          title: 'Martial Arts & Unarmored Defense',
          category: 'Combat Trait',
          badge: 'Combat Trait',
          type: 'passive',
          description: 'AC is 10 + DEX modifier + WIS modifier without armor. Unarmed strike deals 1d4 damage.',
        });
      }
      if (classLevel >= 2) {
        tasks.push({
          id: `monk-ki-${classLevel}`,
          title: 'Ki Points',
          category: 'Resources',
          badge: 'Resources',
          type: 'action',
          description: `Max Ki Points increases to ${classLevel}. Update in Resources.`,
        });
      }
      if (classLevel === 5) {
        tasks.push({
          id: `monk-extra-attack-${classLevel}`,
          title: 'Extra Attack & Stunning Strike',
          category: 'Combat Trait',
          badge: 'Combat Trait',
          type: 'passive',
          description: 'You can attack twice when taking the Attack action, and spend 1 Ki to attempt a Stunning Strike.',
        });
      }
      break;

    case 'Paladin':
      if (classLevel === 1) {
        tasks.push({
          id: `paladin-loh-${classLevel}`,
          title: 'Lay on Hands & Divine Sense',
          category: 'Resources',
          badge: 'Resources',
          type: 'action',
          description: 'Gain Lay on Hands pool (5 HP) and 1 + CHA mod uses of Divine Sense per long rest. Set in Resources.',
        });
      } else {
        tasks.push({
          id: `paladin-loh-${classLevel}`,
          title: 'Lay on Hands',
          category: 'Resources',
          badge: 'Resources',
          type: 'action',
          description: `Lay on Hands healing pool increases by +5 (Max ${classLevel * 5} HP). Update in Resources.`,
        });
      }
      if (classLevel === 5) {
        tasks.push({
          id: `paladin-extra-attack-${classLevel}`,
          title: 'Extra Attack',
          category: 'Combat Trait',
          badge: 'Combat Trait',
          type: 'passive',
          description: 'You can attack twice when taking the Attack action on your turn.',
        });
      }
      if (classLevel === 6) {
        tasks.push({
          id: `paladin-aura-${classLevel}`,
          title: 'Aura of Protection',
          category: 'Passive Rule',
          badge: 'Passive Rule',
          type: 'passive',
          description: 'You and friendly creatures within 10 ft gain a bonus to all saving throws equal to your CHA modifier.',
        });
      }
      break;

    case 'Sorcerer':
      if (classLevel >= 2) {
        tasks.push({
          id: `sorc-points-${classLevel}`,
          title: 'Sorcery Points',
          category: 'Resources',
          badge: 'Resources',
          type: 'action',
          description: `Max Sorcery Points increases to ${classLevel}. Update in Resources.`,
        });
      }
      if (classLevel === 3) {
        tasks.push({
          id: `sorc-metamagic-${classLevel}`,
          title: 'Metamagic',
          category: 'Notes',
          badge: 'Notes',
          type: 'action',
          description: 'Choose 2 Metamagic options (e.g. Quickened Spell, Twinned Spell, Subtle Spell).',
        });
      }
      break;

    case 'Rogue':
      if (classLevel === 1) {
        tasks.push({
          id: `rogue-expertise-${classLevel}`,
          title: 'Expertise',
          category: 'Notes',
          badge: 'Notes',
          type: 'action',
          description: 'Double your proficiency bonus for 2 skill proficiencies (or 1 skill and Thieves’ Tools). Record in Notes.',
        });
      }
      if (classLevel % 2 === 1) {
        const sneakDice = Math.ceil(classLevel / 2);
        tasks.push({
          id: `rogue-sneak-${classLevel}`,
          title: 'Sneak Attack',
          category: 'Combat Trait',
          badge: 'Combat Trait',
          type: 'passive',
          description: `Sneak Attack damage increases to ${sneakDice}d6.`,
        });
      }
      if (classLevel === 2) {
        tasks.push({
          id: `rogue-cunning-${classLevel}`,
          title: 'Cunning Action',
          category: 'Combat Trait',
          badge: 'Combat Trait',
          type: 'passive',
          description: 'You can take a bonus action on each turn to Dash, Disengage, or Hide.',
        });
      }
      if (classLevel === 5) {
        tasks.push({
          id: `rogue-uncanny-${classLevel}`,
          title: 'Uncanny Dodge',
          category: 'Combat Trait',
          badge: 'Combat Trait',
          type: 'passive',
          description: 'Use your reaction to halve damage taken from an attacker you can see.',
        });
      }
      if (classLevel === 7) {
        tasks.push({
          id: `rogue-evasion-${classLevel}`,
          title: 'Evasion',
          category: 'Combat Trait',
          badge: 'Combat Trait',
          type: 'passive',
          description: 'DEX saving throws for half damage take zero damage on success and half on failure.',
        });
      }
      break;

    case 'Fighter':
      if (classLevel === 1) {
        tasks.push({
          id: `fighter-wind-${classLevel}`,
          title: 'Fighting Style & Second Wind',
          category: 'Resources',
          badge: 'Resources',
          type: 'action',
          description: 'Choose a Fighting Style. Gain 1 use of Second Wind (heal 1d10 + 1 per short or long rest). Set in Resources.',
        });
      }
      if (classLevel === 2) {
        tasks.push({
          id: `fighter-surge-${classLevel}`,
          title: 'Action Surge',
          category: 'Resources',
          badge: 'Resources',
          type: 'action',
          description: 'Gain 1 use of Action Surge per short or long rest. Update in Resources.',
        });
      }
      if (classLevel === 5) {
        tasks.push({
          id: `fighter-extra-attack-${classLevel}`,
          title: 'Extra Attack',
          category: 'Combat Trait',
          badge: 'Combat Trait',
          type: 'passive',
          description: 'You can attack twice when taking the Attack action on your turn.',
        });
      }
      if (classLevel === 9) {
        tasks.push({
          id: `fighter-indomitable-${classLevel}`,
          title: 'Indomitable',
          category: 'Resources',
          badge: 'Resources',
          type: 'action',
          description: 'Reroll a failed saving throw once per long rest. Update in Resources.',
        });
      }
      break;

    case 'Barbarian':
      if (classLevel === 1) {
        tasks.push({
          id: `barb-rage-${classLevel}`,
          title: 'Rage',
          category: 'Resources',
          badge: 'Resources',
          type: 'action',
          description: 'Gain 2 uses of Rage per long rest (+2 melee damage bonus). Set in Resources.',
        });
        tasks.push({
          id: `barb-unarmored-${classLevel}`,
          title: 'Unarmored Defense',
          category: 'Combat Trait',
          badge: 'Combat Trait',
          type: 'passive',
          description: 'AC is 10 + DEX modifier + CON modifier while not wearing armor.',
        });
      }
      if (classLevel === 2) {
        tasks.push({
          id: `barb-reckless-${classLevel}`,
          title: 'Reckless Attack & Danger Sense',
          category: 'Combat Trait',
          badge: 'Combat Trait',
          type: 'passive',
          description: 'Gain advantage on melee weapon attacks (granting advantage against you), and advantage on DEX saves against visible effects.',
        });
      }
      if (classLevel === 5) {
        tasks.push({
          id: `barb-extra-attack-${classLevel}`,
          title: 'Extra Attack & Fast Movement',
          category: 'Combat Trait',
          badge: 'Combat Trait',
          type: 'passive',
          description: 'Attack twice when taking the Attack action, and base speed increases by +10 ft while not wearing heavy armor.',
        });
      }
      break;

    case 'Bard':
      if (classLevel === 1) {
        tasks.push({
          id: `bard-inspiration-${classLevel}`,
          title: 'Bardic Inspiration',
          category: 'Resources',
          badge: 'Resources',
          type: 'action',
          description: 'Gain uses equal to your CHA modifier (min 1) per long rest (1d6 die). Set in Resources.',
        });
      }
      if (classLevel === 2) {
        tasks.push({
          id: `bard-jack-${classLevel}`,
          title: 'Jack of All Trades & Song of Rest',
          category: 'Passive Rule',
          badge: 'Passive Rule',
          type: 'passive',
          description: 'Add half proficiency bonus to any non-proficient ability check. Song of Rest adds +1d6 healing during a short rest.',
        });
      }
      if (classLevel === 5) {
        tasks.push({
          id: `bard-font-${classLevel}`,
          title: 'Font of Inspiration',
          category: 'Resources',
          badge: 'Resources',
          type: 'action',
          description: 'Bardic Inspiration die increases to 1d8, and uses now reset on both Short and Long Rests.',
        });
      }
      break;

    case 'Cleric':
      if (classLevel === 2) {
        tasks.push({
          id: `cleric-channel-${classLevel}`,
          title: 'Channel Divinity',
          category: 'Resources',
          badge: 'Resources',
          type: 'action',
          description: 'Gain 1 use of Channel Divinity (Turn Undead and your Divine Domain option) per short or long rest.',
        });
      }
      if (classLevel === 5) {
        tasks.push({
          id: `cleric-destroy-${classLevel}`,
          title: 'Destroy Undead',
          category: 'Combat Trait',
          badge: 'Combat Trait',
          type: 'passive',
          description: 'When an undead of CR 1/2 or lower fails its saving throw against Turn Undead, it is instantly destroyed.',
        });
      }
      break;

    case 'Druid':
      if (classLevel === 2) {
        tasks.push({
          id: `druid-wildshape-${classLevel}`,
          title: 'Wild Shape',
          category: 'Resources',
          badge: 'Resources',
          type: 'action',
          description: 'Gain 2 uses of Wild Shape (Max CR 1/4, no flying or swimming speed) per short or long rest.',
        });
      }
      break;

    case 'Warlock':
      if (classLevel === 2) {
        tasks.push({
          id: `warlock-invocations-${classLevel}`,
          title: 'Eldritch Invocations',
          category: 'Notes',
          badge: 'Notes',
          type: 'action',
          description: 'Choose 2 Eldritch Invocations (e.g. Agonizing Blast, Armor of Shadows). Record in Notes.',
        });
      }
      if (classLevel === 3) {
        tasks.push({
          id: `warlock-boon-${classLevel}`,
          title: 'Pact Boon',
          category: 'Notes',
          badge: 'Notes',
          type: 'action',
          description: 'Choose your Pact Boon: Pact of the Blade, Chain, Tome, or Talisman.',
        });
      }
      break;

    default:
      break;
  }

  return tasks;
}

/**
 * Returns any checklist tasks for the character's current level(s) that remain unchecked.
 */
export function getPendingLevelUpTasks(character) {
  if (!character) return [];
  const classes = getCharacterClasses(character);
  const totalLevel = getTotalCharacterLevel(character);
  const conScore = character.abilities?.con ?? 10;
  const conMod = Math.floor((conScore - 10) / 2);
  const checklistState = character.levelUpChecklist || {};

  const pending = [];
  for (const c of classes) {
    const tasks = getLevelUpChecklist({
      className: c.className,
      classLevel: c.level,
      totalLevel,
      conMod,
    });
    for (const task of tasks) {
      if (task.type === 'action' && !checklistState[task.id]) {
        pending.push({ ...task, className: c.className, classLevel: c.level });
      }
    }
  }
  return pending;
}
