# Ability Scores, Skills, and Senses Misc. Modifier Bonus Design

## Intent & Why
In D&D 5e, magic items, feats, spells, and class features frequently grant flat misc bonuses to specific skill checks (e.g. Stone of Good Luck, +1 to Arcana / History), ability saving throws (e.g. Ring of Protection, Cloak of Protection), ability checks, or passive senses (e.g. Observant feat +5 passive perception).
Currently, the sheet only supports setting raw ability scores, cycling skill proficiency (`none`, `proficient`, `expertise`), and setting manual total overrides for senses.
There is no clean way to apply a `+X` or `-X` misc modifier to skills, abilities (check / save), or senses.

## Goals
1. Allow users to input an additive **Misc. Bonus** (`+X` / `-X`, e.g. `+1`, `-2`, `0`) to:
   - **Skills** (all 18 skills)
   - **Ability Saves / Checks** (STR, DEX, CON, INT, WIS, CHA)
   - **Senses** (Passive Perception, Passive Investigation, Passive Insight, Darkvision)
2. **Zero visual changes in view mode**: Outside of edit mode, cards render with the exact current compact, polished appearance. If a misc bonus is non-zero, it seamlessly factors into the calculated total.
3. **Clean, non-clunky edit mode**:
   - No clunky stepper arrows (`[appearance:textfield]` / hidden native spin buttons).
   - Direct, minimal inline numeric input styled consistently with existing inputs (`bg-dnd-panel text-dnd-gold font-bold text-xs text-center`).
   - Placeholder or clear label indicating misc bonus without crowding the row.
4. **100% Backward Compatible**:
   - `skills` map in profile data remains `{ [skillKey]: 'none' | 'proficient' | 'expertise' }` so existing saved characters and exports are not corrupted.
   - Misc bonuses stored in clean optional sub-maps:
     - `sheet.skillBonuses = { [skillKey]: number }` (or within `sheet.skillsBonuses`)
     - `sheet.abilities.saveBonuses = { [abilityKey]: number }` and/or `sheet.abilities.checkBonuses = { [abilityKey]: number }`
     - `sheet.senses.bonuses = { perception: number, investigation: number, insight: number, darkvision: number }`
   - Default fallback is `0` when undefined.

## Non-Goals & Anti-Goals
- Anti-Goal: Do not change the resting / viewing mode styling or layout of `AbilitiesCard`, `SkillsCard`, or `Senses`.
- Anti-Goal: Do not add separate modal popups or multi-click drawers.
- Non-Goal: Automated inventory-item-to-stat attunement calculation (items remain inventory records; players enter modifiers directly).

## Approaches Considered
- **Approach A (Selected)**: Direct inline numeric inputs in edit mode.
  - *Tradeoffs*: Fast, intuitive, immediate feedback. Must fit within skill rows and ability cards gracefully when `isEditing=true`.
- **Approach B**: Click-to-open popover/tooltip on each stat.
  - *Tradeoffs*: More clicks, high friction when setting multiple bonuses.
- **Approach C**: JSON / custom modifier manager section.
  - *Tradeoffs*: Detached from the stats themselves, poor UX.

## Detailed Layout & Behavior in Edit Mode

### 1. Skills (`SkillsCard.jsx`)
- **Viewing Mode**:
  - Unchanged: `[proficiency dot] [Skill Name] [Ability Tag] [Total Bonus (+X)]`.
  - Calculation: `getAbilityModifier(score) + (profMultiplier * profBonus) + (skillBonuses[skillKey] || 0)`.
- **Editing Mode**:
  - Row shows `[proficiency cycle button] [Skill Name] [Ability Tag]`.
  - On the right:
    - Small inline input: `w-9 py-0.5 text-center text-xs font-bold rounded bg-dnd-panel text-dnd-gold` with `placeholder="+0"`.
    - Total calculated badge updates live next to it.
    - Zero clunky stepper buttons.

### 2. Abilities (`AbilitiesCard.jsx`)
- **Viewing Mode**:
  - Unchanged: Score, Ability Mod, Save Mod.
  - Calculation: Save mod = `getAbilityModifier(score) + (isProf ? profBonus : 0) + (abilities.saveBonuses?.[key] || 0)`.
  - Ability check mod = `getAbilityModifier(score) + (abilities.checkBonuses?.[key] || 0)`.
- **Editing Mode**:
  - Inside each ability card (STR, DEX, etc.):
    - Below score input, add concise edit fields:
      - `Save +X`: small numeric input for save misc bonus.
      - Save total updates live.

### 3. Senses (`SkillsCard.jsx`)
- **Viewing Mode**:
  - Unchanged: Passive Perception, Passive Investigation, Passive Insight, Darkvision.
  - Calculation:
    - Passive Skill = `10 + calculateSkillBonus(score, prof, level, skillBonus) + (senses.bonuses?.[key] || 0)`.
    - Darkvision = `(senses.darkvision || 0) + (senses.bonuses?.darkvision || 0)`.
- **Editing Mode**:
  - Input field for bonus `+X` to passives and Darkvision.
  - Maintains clean layout in the 4-column grid.

## Storage Schema & Migrations (`storage.js`)
In `createDefaultSheet()`:
```javascript
abilities: {
  str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
  saveProficiencies: defaultProficientSaves,
  saveBonuses: {}, // e.g. { str: 0, dex: 1, ... }
  checkBonuses: {}, // e.g. { str: 0, ... }
  overrides: {},
},
skills: { ... }, // unchanged string values 'none' | 'proficient' | 'expertise'
skillBonuses: {}, // e.g. { arcana: 1, history: 1 }
senses: {
  darkvision: 0,
  custom: '',
  bonuses: {}, // { perception: 0, investigation: 0, insight: 0, darkvision: 0 }
  overrides: {},
}
```
In `loadCharacterProfiles()`:
Add shallow merge fallbacks for `skillBonuses: p.sheet.skillBonuses || {}`, `saveBonuses`, and `senses.bonuses`.
Existing saves load without errors or data loss.
