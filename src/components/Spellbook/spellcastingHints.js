export const SPELLCASTING_HINTS = {
  Wizard: 'Start with 6 wizard spells at level 1. Gain 2 additional wizard spells each time you gain a wizard level. You can also copy eligible wizard spells into your spellbook. Prepare spells from your spellbook according to your wizard rules.',
  Cleric: 'Gain access to cleric spells as you level. Prepare spells after each long rest according to your cleric level, Wisdom modifier, and edition rules. Change prepared spells when your rules allow.',
  Druid: 'Gain access to druid spells as you level. Prepare spells after each long rest according to your druid level, Wisdom modifier, and edition rules. Change prepared spells when your rules allow.',
  Paladin: 'Gain access to paladin spells as you level. Prepare spells according to your paladin level, Charisma modifier, and edition rules. Change prepared spells when your rules allow.',
  Ranger: 'Gain ranger spells as you level. Choose or replace known ranger spells when your edition and class rules allow. Some ranger features may grant additional spells.',
  Bard: 'Learn bard spells as you level. Your available choices expand as your bard level increases. Replace known bard spells when your edition and class rules allow.',
  Sorcerer: 'Learn sorcerer spells as you level. Your available choices expand as your sorcerer level increases. Replace known sorcerer spells when your edition and class rules allow.',
  Warlock: 'Learn warlock spells as you level. Your available choices expand as your warlock level increases. Replace known warlock spells when your edition and class rules allow. Pact Magic slots recharge according to your warlock rules.',
  Artificer: 'Prepare artificer spells according to your artificer level, Intelligence modifier, and edition rules. Your available spell choices expand as your artificer level increases. Change prepared spells when your rules allow.',
  'Eldritch Knight': 'Learn a limited set of wizard spells through your fighter progression. Spell-school restrictions and replacement rules depend on your edition. Subclass features may grant additional spells.',
  'Arcane Trickster': 'Learn a limited set of wizard spells through your rogue progression. Spell-school restrictions and replacement rules depend on your edition. Subclass features may grant additional spells.',
};

export function getSpellcastingHints(character) {
  const classes = Array.isArray(character?.classes) && character.classes.length
    ? character.classes
    : [{ className: character?.className }];
  return classes.map(({ className }) => ({
    className: className || 'Spellcaster',
    hint: SPELLCASTING_HINTS[className] || 'Gain spells through your class, subclass, feats, or other features. Follow your edition rules for learning, preparing, replacing, and casting them.',
  }));
}
