# Hit Dice & Short Rest System Design Spec

## 1. Context & Objective
In D&D 5e, Hit Dice represent a character's vitality pool used to heal during a Short Rest and determine maximum HP. Currently in Mythallar, hit dice are stored as a static `{ current: 1, max: 1, die: 'd6' }` disconnected from character level, class hit die types, and Short Rest actions.

The goal is to implement an authentic, streamlined D&D 5e Hit Dice system:
1. Hit Dice max automatically scales with character level and class die types (`Sorcerer/Wizard: d6`, `Artificer/Bard/Cleric/Druid/Monk/Rogue/Warlock: d8`, `Fighter/Paladin/Ranger: d10`, `Barbarian: d12`), including multiclass support.
2. Hit dice can be rolled or spent directly in the **Combat Stats** card for quick table play.
3. A unified **Short Rest Modal** accessible from BOTH the Short Rest button in `SpellSlotTracker` and the Hit Dice section in `VitalsCard`, providing a seamless rest experience for pure martials, half-casters, and full casters.
4. Seamlessly integrates Wizard **Arcane Recovery** into the Short Rest modal while automatically resetting Warlock **Pact Magic** slots upon completion.
5. **Long Rest** recovers half of the character's total hit dice pool (minimum 1) per 5e rules.

---

## 2. Core Mechanics & Calculations

### 2.1 Class Hit Die Mapping
- `d6`: Wizard, Sorcerer
- `d8`: Bard, Cleric, Druid, Monk, Rogue, Warlock, Artificer
- `d10`: Fighter, Paladin, Ranger
- `d12`: Barbarian

### 2.2 Hit Dice Data Structure & Normalization
Stored in `vitals.hitDice`:
```js
{
  // Backward-compatible totals for existing UI/legacy profiles
  current: 5,
  max: 5,
  die: 'd8',
  // Granular pools per die type (supports multiclassing)
  pools: {
    'd8': { current: 3, max: 3, classNames: ['Rogue'] },
    'd10': { current: 2, max: 2, classNames: ['Fighter'] }
  }
}
```
`normalizeHitDice(vitals, character)`:
- Computes each class's hit die size and max count from `character.classes` (or `character.className` and `character.level`).
- Preserves existing spent state where possible (`current = Math.min(newMax, savedCurrent)`).
- Sums `current` and `max` across all pools.
- Top-level `die` represents primary class die.

### 2.3 Rolling a Hit Die
- Formula: `healAmount = Math.max(1, rollDie(dieSides) + conModifier)`.
- Updates `hpCurrent = Math.min(effectiveMax, hpCurrent + healAmount)`.
- Decrements the rolled pool's `current` by 1.
- Physical roller support: player can also type in their physical die roll result or adjust HP and hit dice counters directly with `[-]`/`[+]`.
- Live feedback: immediate visual toast (e.g. *"Rolled 6 + 2 (CON) = 8 HP restored"*).

### 2.4 Rest Mechanics
- **Short Rest:**
  - Accessible via button in `SpellSlotTracker` or `VitalsCard` Hit Dice section.
  - Opens `ShortRestModal`.
  - Actions mutate state live (die rolls immediately apply healing and decrement pool).
  - If character has Wizard levels and `arcaneRecoveryUsed` is false, embeds Arcane Recovery slot selection inside the modal.
  - Automatically resets Warlock Pact Magic slots upon confirmation.
- **Long Rest:**
  - Restores Current HP to Effective Max HP and resets Temp HP to 0.
  - Restores all spell slots & Pact Magic slots.
  - Resets `arcaneRecoveryUsed` to `false`.
  - Recovers spent hit dice up to `Math.max(1, Math.floor(totalLevel / 2))`, allocated starting with the largest available die pools.

---

## 3. UI & UX Conventions

### 3.1 Combat Stats Card (Inline Hit Dice Tracker)
- **Normal View:**
  - Shows hit dice tracker in Row 2 compact strip.
  - For single-class characters: `Hit Dice: [-] [ Roll d8 ] 4 / 5 [+]`.
  - For multiclass characters: compact row or pills showing each pool (e.g. `d8: [-] [Roll] 2/3 [+] • d10: [-] [Roll] 1/2 [+]`).
  - Buttons `[-]` and `[+]` allow manual adjustments without rolling (crucial for physical dice).
  - Quick action: `Rest` button opens the `ShortRestModal`.
- **Editing Mode (`isEditing: true`):**
  - Allows manual numeric override of current hit dice values.

### 3.2 Short Rest Modal (`src/components/Modal/ShortRestModal.jsx`)
- Title: **Short Rest** (`Sun` icon in amber).
- HP Health Status:
  - Mini health bar + `Current / Effective Max HP` with live updates as dice are spent.
  - CON modifier badge: e.g. `+2 CON Mod`.
- Hit Dice Spending Section:
  - List of character's hit die pools.
  - Each pool features a `Roll 1d[X]` button, with an optional manual roll input box beside it.
  - Disabled if pool is 0 or HP is already full.
- Integrated Arcane Recovery (Wizards only):
  - Accordion or inline card: shows remaining recovery budget (`ceil(wizardLevel / 2)`), slot selection steppers, and recovery staging.
  - If already used today, shows badge: *"Arcane Recovery already used today"*.
- Warlock Pact Magic note:
  - *"Pact Magic slots will be restored upon completing rest."*
- Modal Footer:
  - `Done` / `Finish Short Rest` (primary gold button) which commits any Arcane Recovery selection, resets Pact Magic slots, and closes modal.

### 3.3 Visual & Design Guidelines
- Uniform Title Case headers and labels (`Combat Stats`, `Hit Dice`, `Short Rest`, `Finish Short Rest`).
- 14px Lucide icons (`Sun`, `Heart`, `Sparkles`, `Zap`).
- Dark panel theme matching Mythallar design system (`bg-dnd-card`, `bg-dnd-panel`, `border-white/5`, `text-dnd-gold`).

---

## 4. Test Strategy
- `dndCalculations.test.js`: test hit die roll logic, CON modifier integration, and hit dice pool allocation.
- `storage.test.js`: test `normalizeHitDice` for single class, multiclass, and legacy profile backwards compatibility.
- `VitalsCard.test.jsx`: test inline hit die roll button, healing application, and manual increment/decrement.
- `ShortRestModal.test.jsx`: test Short Rest modal with hit dice rolls, HP clamping, Wizard Arcane Recovery integration, and Pact slot reset.
- `App.test.jsx`: test end-to-end Short Rest and Long Rest hit dice recovery across Character Sheet and Spellbook views.
