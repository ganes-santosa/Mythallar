# HANDOFF

## Current state (v2.1.0 - master)
- **Character Sheet Header & Quick-Roll Polish:**
  - Dedicated `CharacterSheetHeader` in left Character Sheet pane with portrait avatar upload (256px WebP compression) and identity fields (Race/Species, Subclass, Background).
  - Left pane header retains complete character management: inline name editing, multiclass management with class/level selects and two-click delete, Level Up modal, and Character Manager modal. Excludes auth sync and export/import clutter.
  - Right pane `CharacterHeader` remains simplified and byte-identical to v2.0.2.
  - VitalsCard hit die carousel chips equipped with two-click confirmation before spending.
  - Left pane toast notification alerts on hit die roll (`Restored <die> (<amount>) HP`).
  - Unified `text-xl font-black` stat size maintained across HP stats and Ability Scores.
- **Verification:** 38 test files (235 tests) passing; production build clean.

## Next up
- Character sheet expansion or user requested features.

## Open questions
- (none)
