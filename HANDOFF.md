# HANDOFF

## Release v3.2.6 - builder starting feats, vitals 2-digit min width, header mobile labels, hand-eye icon

## Current state (master)
- Builder Starting Feats: Background origin feats & species feats (Variant/Standard Human, Custom Lineage) populate `sheet.feats` with descriptions & linked `trackedResources`. Feat traits sort first with floating searchable dropdown and expandable description.
- Subrace catalogue: Added explicit `Standard` Human options for 2014 (+1 all stats) and 2024 (Resourceful, Skillful, Versatile).
- Vitals HP digit alignment: Current/Max HP containers reserve 2ch min-width to avoid label crowding on 1-digit values; digits align on uniform baseline.
- Character Sheet Lore & Traits: Click-to-edit removed from view state; edit restricted to pencil buttons; labels collapse to "Lore" and "Traits" on mobile (`sm:`).
- HandEye Icon: Custom normalized Phosphor HandEye component replaces Wand2 in modals.
- Full suite green: 67 test files, 614 tests passed. Production build clean.

## Next up
- Deeper subclass feature integration into character sheet traits/features.
- Optional catalogue offline sync or progressive download for lower bundle footprint.

## Open questions
- Homebrew spells have no `isLegacy`, so "2014 Legacy" filter hides them and "2024 Modern" shows them.
- Catalog filter Reset does not clear `source` or `hideUA`; left as is per past decision.
