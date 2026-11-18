# HANDOFF

## Release v3.2.3 - subclasses, notes formatting, builder & sheet polish

## Current state (master)
- Official 5e subclasses: 296 entries with full feature text in `public/data/classes.json`.
  - Ruleset-aware unlock levels (`getSubclassLevel`), 1/3-caster multiclass spell slots.
  - `LevelUpModal` subclass prompt (official dropdown + custom input), auto-adds feature notes and marks the checklist task complete.
  - Per-class subclass badges with inline edit in sheet headers.
- Notes: 3 text sizes (Heading/Subheading/Body) via toolbar dropdown with cursor block detection; subclass notes auto-format intro as Heading and features as Subheading.
- Character creation: `CreateCharacterModal` choice screen (Builder vs Manual Setup) with working Back from builder step 0.
- Builder: identity `Age/Gender/Alignment` + 2x2 traits grid persisted on `sheet.identity`; Starting Features accordion uses a single grid-rows transition (no double animation).
- Ability scores: slot-machine digit spin on Stat Roll re-roll and Point Buy reset (`src/components/Common/SlotNumber.jsx`); fixed 2-digit pool chips.
- Sheet header: `Character Lore` / `Character Traits` morph between pills and tabs, flush shared body with `SmoothSize` height animation.
- Full suite green: 66 test files, 596 tests passed. Production build clean.

## Next up
- Deeper subclass feature integration into character sheet traits/features.
- Optional catalogue offline sync or progressive download for lower bundle footprint.

## Open questions
- Homebrew spells have no `isLegacy`, so "2014 Legacy" filter hides them and "2024 Modern" shows them.
- Catalog filter Reset does not clear `source` or `hideUA`; left as is per past decision.
