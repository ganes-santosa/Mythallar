# HANDOFF

## Current state (v2.0.3 - master)
- **Hit Dice & Short Rest System Complete:**
  - Authentic 5e class-based dice scaling (`d6` Wizard/Sorcerer, `d8` Bard/Cleric/Druid/Monk/Rogue/Warlock/Artificer, `d10` Fighter/Paladin/Ranger, `d12` Barbarian).
  - Storage normalized (`normalizeHitDice`) supporting multiclass characters with separate pools.
  - VitalsCard Row 2 kept in ONE single card container (`bg-dnd-card/60 border border-white/5 rounded-lg`) directly inside the parent vitals grid (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[13fr_6fr_9fr] xl:grid-cols-[11fr_5fr_8fr] gap-2`).
  - Row 2 card uses `col-span-1 sm:col-span-2 lg:col-span-3` with `lg:grid-cols-subgrid`: subdivisions share parent grid tracks directly, with visible subdivision dividers (`border-r border-white/5`).
  - Fixed clashing threshold: Speed card chips now use `max-w-full overflow-hidden truncate` and track ratios tuned (`lg:grid-cols-[13fr_6fr_9fr]` scaling to `xl:[11fr_5fr_8fr]`) so Speed badges never collide with Walk speed text when compressing.
  - Inspiration responsive layout & centering: centered in its subdivision (`justify-center text-center`), renders 1-line (`xl:flex-row gap-x-1.5`) when space permits, wraps to stacked 2-line (`flex-col gap-y-0.5`) on narrower viewports.
  - Sizing & layout within cards: Hit Dice left with hidden scrollbar, Inspiration center, Death Saves right with green/red pips.
  - Unified `ShortRestModal`: hit dice recovery (live rolling & manual inputs), HP status bar, and embedded Wizard Arcane Recovery matching `ArcaneRecoveryModal` with glowing star pips (`SlotPipStar`), budget header, row cards, and stepper buttons.
  - SpellSlotTracker Short Rest button triggers `ShortRestModal` consistently for both Hit Dice and Arcane Recovery.
  - Long Rest recovery: up to `Math.max(1, Math.floor(level / 2))` hit dice recovered, full HP restore, and spell slot recharge.
- **Verification:** 38 test files (232 tests) passing; production build clean.

## Next up
- User feature requests or character sheet expansions.

## Open questions
- (none)
