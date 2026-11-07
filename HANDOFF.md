# HANDOFF

## Current state (v2.2.4 - master)
- **Prepared Spell Calculation & Homebrew Spells**:
  - Fixed prepared count logic so uncataloged custom spells and cantrips do not increment prepared or known totals.
  - JSON character import preserves and registers `homebrewSpells` into catalog.
- **Scrollbar Track**:
  - Restored subtle scrollbar track background (`rgba(255, 255, 255, 0.04)`) across custom scroll containers and WebKit pseudo-elements.
- **Independent Catalog Level Accordions**:
  - Resolved mutual exclusivity bug in `SpellList`: each level opens/collapses independently via `collapsedLevels` map.
- **Tracked Resources Drag Reordering**:
  - Drag-and-drop reordering for tracked resources in `ResourcesCard` edit state with `GripVertical` handle and drop target indicator.
- **Verification**: 42 test files (298 tests) passing; production build verified clean.

## Next up
- Ready for upcoming relayouting work.

## Open questions
- (none)
