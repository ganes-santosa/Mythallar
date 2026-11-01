# Combat Vitals & Formulations Redesign

## Intent & Why
The existing Combat Vitals section suffered from disjointed information hierarchy:
- 8 oversized equal cards for disparate elements (Inspiration had as much visual prominence as HP).
- Redundant `/ 18` badge above the current HP input.
- Temp HP isolated into its own disconnected card rather than functioning as an auxiliary pool.
- AC note field squeezed horizontally with barely readable space.
- Lack of standard D&D 5e combat actions (quick damage absorbing Temp HP first, healing bounded to max HP).
- No support for temporary Max HP spells (*Aid*, *Heroes' Feast*) or drains.

This redesign establishes a clean, high-density layout where HP is the visual anchor, combat stats are tight and proportional without dead space, and 5e HP rules work seamlessly.

## Goals
1. **Hero HP Pool:** Prominent Current HP (24px bold), Max HP (18px bold), Temp HP (18px bold blue), and mini dual health bar.
2. **5e Quick Damage & Heal Widget:**
   - Empty input by default, resets to empty after every apply.
   - Damage consumes Temp HP first, then subtracts remainder from Current HP down to 0.
   - Heal adds to Current HP up to Effective Max HP (`Base Max + MAX HP BUFF`); does not touch Temp HP.
3. **MAX HP BUFF Support:** Expose `MAX HP BUFF` field in edit mode for spells (*Aid*, etc.), calculating `Effective Max HP = Base Max + MAX HP BUFF`.
4. **Natural Height Proportions (No Dead Space):**
   - Row 1: HP Card (left HP pool, vertical divider, right Treatment A Damage/Heal capsule), AC Card (24px AC score + `SpellNoteSection`-style `+ Note` action), and Initiative & Speed Pair (20px bold stats).
   - Row 2: Compact Trackers Strip (Hit Dice, 3-dot Death Saves, Inspiration stepper) separated by subtle vertical dividers.
   - Rows 3 & 4: Retain clean Conditions (with permanent 0-6 Exhaustion stepper) and Defenses & Resistances.
5. **Section Edit Mode Toggle:** Accordion header gets `Settings2` / `Check` edit toggle matching Abilities, Skills, and Proficiencies cards.

## Non-Goals
- Full character builder or sheet export schema overhaul.
- Automated damage type resistance calculations during manual damage entry (player enters net damage).

## Approaches Considered
- **Approach 1 (Chosen): Proportional 3-Card Row + Compact Trackers Strip.** HP on left with vertical Damage/Heal capsule; AC and Initiative/Speed alongside; compact tracker strip below. Eliminates all stretching and dead space.
- **Approach 2: 3-Pillar Vertical Columns.** Stacked Hit Dice, Death Saves, and Inspiration in column 3. Cramped mobile view and uneven card heights.
- **Approach 3: Modal Damage Calculator.** Required clicking into a popup for every combat adjustment. Slower play during active sessions.

## Detailed Specifications

### 1. Data Schema & State (`vitals`)
- `hpCurrent`: number (default 10)
- `hpMax`: number (base max, default 10)
- `hpMaxBuff`: number (default 0, optional bonus from *Aid*, etc.)
- `hpTemp`: number (default 0)
- `ac`: number (default 10)
- `acFormula`: string (e.g. `14 + 2 DEX`)
- `speed`: number (default 30)
- `initiativeOverride`: number | null
- `hitDice`: `{ current: number, max: number, die: string }`
- `deathSaves`: `{ successes: number, failures: number }`
- `inspiration`: number
- `exhaustion`: number (0-6)
- `conditions`: string[]
- `defenses`: string[]

Effective Max HP calculation:
`effectiveMax = (currentVitals.hpMax ?? 10) + (currentVitals.hpMaxBuff ?? 0);`

### 2. HP Card Architecture
- Container: `bg-dnd-card p-2 rounded-lg flex items-stretch justify-between gap-3 shadow-sm`
- Left side:
  - Header: `♥ HIT POINTS` with conditional `+X Buff` badge if `hpMaxBuff > 0`.
  - Values row: Current HP (24px text-slate-100), `/`, Max HP (18px text-slate-400), vertical line, `+ Temp` (18px text-blue-300).
  - Mini health bar: Green segment (`hpCurrent / effectiveMax * 100%`) + Blue segment (`hpTemp / effectiveMax * 100%`, capped at remaining bar width).
- Subtle vertical divider: `w-px bg-white/5 my-0.5`.
- Right side (Treatment A Capsule):
  - Container: `bg-dnd-panel/60 border border-white/5 rounded-md p-1 flex flex-col gap-1 w-16`
  - Damage button: `text-red-400 bg-red-950/40 hover:bg-red-900/50 border border-red-500/20 text-[9px] font-bold uppercase rounded py-0.5`
  - Amount input: `text-xs font-bold text-slate-100 bg-dnd-panel/90 text-center rounded py-0.5`
  - Heal button: `text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/20 text-[9px] font-bold uppercase rounded py-0.5`
- Quick apply handlers:
  - Damage: absorbs Temp HP first. `rem = amt - hpTemp`. If `rem > 0`: `hpTemp = 0`, `hpCurrent = Math.max(0, hpCurrent - rem)`. Else: `hpTemp = hpTemp - amt`. Resets input to empty.
  - Heal: `hpCurrent = Math.min(effectiveMax, hpCurrent + amt)`. Resets input to empty.

### 3. AC Card Architecture
- Shield icon, `AC` label.
- View mode: 24px bold AC score (`text-dnd-gold`) + note display or `+ Note` button.
- Note behavior: Click `+ Note` or existing note to open an inline textarea; Save / Cancel buttons store to `acFormula` without altering character profile integrity.

### 4. Initiative & Speed Card Architecture
- Split into 2 equal halves with subtle vertical divider.
- Initiative: formatted DEX modifier `+X` or override value. Sub-label: "DEX mod" or "Override".
- Speed: walking speed number with `ft` unit. Sub-label: "Walking".

### 5. Trackers Strip Architecture
- Horizontal container: `bg-dnd-card/60 border border-white/5 rounded-lg p-2 flex items-center justify-between gap-2`.
- Hit Dice: `-` / `+` stepper, `{current} / {max} {die}`.
- Death Saves: `Succ` with 3 emerald dots, `Fail` with 3 red dots. Clicking dot toggles count (1, 2, 3, or clear).
- Inspiration: `-` / `+` stepper with gold count.

### 6. Edit Mode Capabilities
When `isEditing` is true (toggled from accordion header):
- HP Card reveals direct edit fields for `Base Max`, `MAX HP BUFF`, and `Temp HP`.
- AC Card allows direct editing of base AC number and formula note.
- Speed allows editing walking speed number.
- Initiative allows setting or clearing override.
