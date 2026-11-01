# HANDOFF

## Current state (v2.0.1)
- **Combat Stats & Row 1 Redesign:**
  - Standardized all inner card labels, stat badges, field labels, tracker text, and action buttons to **Title Case** (`Hit Points`, `Hit Dice`, `Death Saves`, `Max HP Buff`, `Base Max`, `Temp HP`, `Damage`, `Heal`, `Speed`).
  - Card 1: Hit Points redesigned with always-interactive inputs for Current and Temp HP, auto-sized width (`ch`) ensuring uniform `/` spacing across 1-3 digits, and Damage/Heal capsule.
  - Card 2: Combined AC and Initiative into a stacked card. AC on top with hero number, formula breakdown, and persistent `+ Note` / edit button. Initiative on bottom in an accent pill with `Zap` icon, modifier, and override support.
  - Card 3: Dedicated 5e Movement Speeds card with hero Walking speed (`30 ft`, `Walking`) on left, active optional speeds (`Climbing`, `Swimming`, `Flying`, `Burrowing`) on right with `+ Speed` adder and remove (`x`) buttons.
  - Backward-compatibility: legacy numeric `vitals.speed: 30` automatically normalizes to `{ walk: 30 }` via `normalizeSpeeds` in `src/utils/storage.js`.
  - Rebalanced Row 1 grid (`lg:grid-cols-[10fr_5fr_9fr]`): Hit Points ~41.7%, AC/Initiative ~20.8%, Speeds ~37.5%. Reduced Hit Points container padding and gaps to remove dead space. Speeds card uses `whitespace-nowrap` on secondary speed chips and `flex-shrink-0` on Walking speed to prevent text wrapping.
  - Removed "Over" text badge from read-only Initiative pill.
  - Proficiencies & Training add form persistent on submit (clears draft, retains focus for rapid multi-add); closes on click outside (`useClickOutside`), Cancel, or Escape; category cards use `justify-start` without vertical gaps.
  - Eliminated browser-native validation tooltips via `noValidate` and number stepper buttons in CSS (`appearance: textfield`).
- **Verification:** 37 test files (210 tests) passing; production build clean.

## Next up
- Review changes, commit, and tag/push when ready.

## Open questions
- (none)
