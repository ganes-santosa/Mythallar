# HANDOFF

## Release v3.2.7 - builder proficiency labels normalized to Title Case

## Current state (master)
- Builder Proficiencies: `buildLevel1Character` now normalizes armor, weapon and tool entries. `light`/`medium`/`heavy` become `Light Armor`/`Medium Armor`/`Heavy Armor`, `shield` becomes `Shield`, `simple`/`martial` become `Simple Weapons`/`Martial Weapons`, and tools are Title Cased (`Calligrapher's Supplies`, `Vehicles (Land)`). Existing saved characters keep their stored text.
- Builder Starting Feats: Background origin feats & species feats (Variant/Standard Human, Custom Lineage) populate `sheet.feats` with descriptions & linked `trackedResources`.
- Subrace catalogue: Explicit `Standard` Human options for 2014 (+1 all stats) and 2024 (Resourceful, Skillful, Versatile).
- Character Sheet Lore & Traits: Click-to-edit removed from view state; edit restricted to pencil buttons; labels collapse to "Lore" and "Traits" on mobile (`sm:`).
- Full suite green: 68 test files, 622 tests passed. Production build clean.

## Next up
- Deeper subclass feature integration into character sheet traits/features.
- Optional catalogue offline sync or progressive download for lower bundle footprint.

## Open questions
- Homebrew spells have no `isLegacy`, so "2014 Legacy" filter hides them and "2024 Modern" shows them.
- Catalog filter Reset does not clear `source` or `hideUA`; left as is per past decision.
