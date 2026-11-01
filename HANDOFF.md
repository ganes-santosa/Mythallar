# HANDOFF

## Current state (v2.0.2 - master @ c007622)
- **Hit Dice & Short Rest System Complete:**
  - Authentic 5e class-based dice scaling (`d6` Wizard/Sorcerer, `d8` Bard/Cleric/Druid/Monk/Rogue/Warlock/Artificer, `d10` Fighter/Paladin/Ranger, `d12` Barbarian).
  - Storage normalized (`normalizeHitDice`) supporting multiclass characters with separate pools.
  - VitalsCard Row 2 features inline hit die rolling (`rollHitDie`: roll + CON mod, min 1) healing HP live, manual steppers, and Short Rest trigger button.
  - Unified `ShortRestModal`: HP status bar, live hit die rolling, physical roll manual input, embedded Wizard Arcane Recovery with slot staging, and Warlock Pact Magic notices.
  - Long Rest recovery: up to `Math.max(1, Math.floor(level / 2))` hit dice recovered (prioritizing larger dice for multiclass), full HP restore, and spell slot recharge.
- **Verification:** 38 test files (233 tests) passing; production build clean.

## Next up
- Ready for version bump/release to v2.1.0 or user review.

## Open questions
- (none)
