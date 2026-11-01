# HANDOFF

## Current state (v2.0.2)
- **Combat Stats & Row 1 Redesign:**
  - Standardized all inner card labels, stat badges, field labels, tracker text, and action buttons to **Title Case** (`Hit Points`, `Hit Dice`, `Death Saves`, `Max HP Buff`, `Base Max`, `Temp HP`, `Damage`, `Heal`, `Speed`).
  - Card 1: Hit Points redesigned with always-interactive inputs for Current and Temp HP, auto-sized width (`ch`) ensuring uniform `/` spacing across 1-3 digits, and Damage/Heal capsule.
  - Card 2: Stacked standalone cards for AC and Initiative (`flex flex-col gap-2`). AC card on top with hero number, formula breakdown, and persistent `+ Note` / edit button; Initiative as its own distinct card on bottom with `Zap` icon and modifier.
  - Card 3: Dedicated 5e Movement Speeds card with hero Walking speed (`30 ft`, `Walking`) on left, active optional speeds (`Climbing`, `Swimming`, `Flying`, `Burrowing`) on right with `+ Speed` adder. Speed remove (`x`) buttons conditionally rendered only in editing state (`isEditing`).
  - Backward-compatibility: legacy numeric `vitals.speed: 30` automatically normalizes to `{ walk: 30 }` via `normalizeSpeeds` in `src/utils/storage.js`.
  - Rebalanced Row 1 grid (`lg:grid-cols-[11fr_5fr_8fr]`): Hit Points ~46%, AC 21%, Speeds ~33%, cleanly balancing space without clipping secondary speed chips.
  - Removed "Over" text badge from read-only Initiative card.
  - Proficiencies & Training add form persistent on submit (clears draft, retains focus for rapid multi-add); closes on click outside (`useClickOutside`), Cancel, or Escape; category cards use `justify-start` without vertical gaps.
  - Eliminated browser-native validation tooltips via `noValidate` and number stepper buttons in CSS (`appearance: textfield`).
- **Verification:** 37 test files (210 tests) passing; production build clean.

## Next up
- Ready for feature work or user feedback.

## Open questions
- (none)
