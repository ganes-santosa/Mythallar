# HANDOFF

## Release v3.2.3 - subclasses, builder starting wealth & equipment, notes & sheet polish

## Current state (master)
- Official 5e subclasses: 296 entries with full feature text in `public/data/classes.json`.
  - Ruleset-aware unlock levels (`getSubclassLevel`), 1/3-caster multiclass spell slots.
  - `LevelUpModal` subclass prompt (official dropdown + custom input), auto-adds feature notes.
- Character creation: `CreateCharacterModal` choice screen (Builder vs Manual Setup).
- Builder equipment: starting gear & gold for 2014 (rolled wealth vs gear) and 2024 (Class & Background Equipment or Starting Wealth), parsing inventory and currency.
- Smooth UX: dynamic tracking auto-scroll over 380ms grid transitions; stable `SlotNumber` digit alignment (0.0px shift during/after spin).
- Notes: 3 text sizes (Heading/Subheading/Body) via toolbar dropdown with cursor block detection.
- Full suite green: 67 test files, 611 tests passed. Production build clean.

## Next up
- Deeper subclass feature integration into character sheet traits/features.
- Optional catalogue offline sync or progressive download for lower bundle footprint.

## Open questions
- Homebrew spells have no `isLegacy`, so "2014 Legacy" filter hides them and "2024 Modern" shows them.
- Catalog filter Reset does not clear `source` or `hideUA`; left as is per past decision.
