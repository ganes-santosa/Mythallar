# HANDOFF

## Release v3.2.8 - initiative base + misc bonus, stepped lore editor

## Current state (master)
- Initiative in edit mode: split into `Base` (override, placeholder = DEX mod) and gold `Bonus` (`vitals.initiativeBonus`, default 0), matching the AC and Spellcasting chips. Total = base + bonus; `initiativeBonus` carried through the simulacrum vitals copies in `CharacterSheetHeader`, `CharacterSheetView` and `CharacterHeader`.
- Character Lore editor: now uses the shared `SteppedTextarea` (4/8/12/16 stepped height, scrolls past 16 lines) for parity with the feat Description / Notes field. No auto-focus on open.
- Builder Proficiencies: `buildLevel1Character` normalizes armor, weapon and tool entries (`Light Armor`, `Shield`, `Simple Weapons`, `Calligrapher's Supplies`). Existing saved characters keep their stored text.
- Character Sheet Lore & Traits: Click-to-edit removed from view state; edit restricted to pencil buttons; labels collapse to "Lore" and "Traits" on mobile (`sm:`).
- Full suite green: 68 test files, 623 tests passed. Production build clean.

## Next up
- Deeper subclass feature integration into character sheet traits/features.
- Optional catalogue offline sync or progressive download for lower bundle footprint.

## Open questions
- Homebrew spells have no `isLegacy`, so "2014 Legacy" filter hides them and "2024 Modern" shows them.
- Catalog filter Reset does not clear `source` or `hideUA`; left as is per past decision.
