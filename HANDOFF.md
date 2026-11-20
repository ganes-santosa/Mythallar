# HANDOFF

## Release v3.2.5 - builder uniform vertical spacing rhythm & visual polish

## Current state (master)
- Builder Identity Spacing: Unified visual gap rhythm above and below Character Lore to exactly 40px, matching the standard section divider spacing across Character Builder.
- Subclass picker & features: 296 entries with full feature text in `public/data/classes.json`.
- Character creation: `CreateCharacterModal` choice screen (Builder vs Manual Setup).
- Builder equipment: starting gear & gold for 2014 (rolled wealth vs gear) and 2024 (Class & Background Equipment or Starting Wealth), parsing inventory and currency.
- Smooth UX: dynamic tracking auto-scroll over 380ms grid transitions; stable `SlotNumber` digit alignment.
- Notes: 3 text sizes (Heading/Subheading/Body) via toolbar dropdown with cursor block detection.
- Full suite green: 67 test files, 613 tests passed. Production build clean.

## Next up
- Deeper subclass feature integration into character sheet traits/features.
- Optional catalogue offline sync or progressive download for lower bundle footprint.

## Open questions
- Homebrew spells have no `isLegacy`, so "2014 Legacy" filter hides them and "2024 Modern" shows them.
- Catalog filter Reset does not clear `source` or `hideUA`; left as is per past decision.
