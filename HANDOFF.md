# HANDOFF

## Current state (v2.1.1 - master)
- **Character Sheet Header Polish:**
  - Dedicated `CharacterSheetHeader` in left Character Sheet pane with prominent full-height portrait banner (`w-28 sm:w-36 md:w-44 self-stretch`) and soft right-fading gradient.
  - Hover highlight overlay uses `bg-gradient-to-r from-black/60 via-black/30 to-transparent` with right-edge blend, eliminating hard rectangular outlines.
  - Race / Species input relocated to its own full-width line above Subclass & Background 2-column grid, giving room for long races (e.g. Mark of Detection Half-Elf).
  - Left pane header retains complete character management: inline name editing, multiclass management with class/level selects and two-click delete, Level Up modal, and Character Manager modal. Excludes auth sync and export/import clutter.
  - Right pane `CharacterHeader` remains simplified and byte-identical to v2.0.2.
  - VitalsCard hit die carousel chips equipped with two-click confirmation before spending; left pane toast notification alerts on hit die roll (`Restored <die> (<amount>) HP`).
- **Verification:** 39 test files (239 tests) passing; production build clean.

## Next up
- Add sub-accordion card within Character card below portrait for Character's Lore (editable text area with edit button).

## Open questions
- (none)
