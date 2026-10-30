# HANDOFF

## Current state (v1.3.5)
- **Spell Card Expand/Collapse Transitions:** Animated individual catalog and spellbook cards using `useAccordionMount` with `contain: layout paint` and `content-visibility: auto` to prevent catalog FPS drops.
- **Spell Slot Editing UX:** Added baseline-preserving slot adjustments when editing max slots (eats empty slots before filled slots).
- **Slot Stepper Layout:** Compact vertical inline stepper `[+] / {max} / [-]` with `X / Y` format; removed redundant "Editing Max" pill and "MAX" labels; eliminated click latency.
- **Performance:** Decoupled catalog mutations via `activeCharacterRef`; memoized `SpellCard`, `SpellbookCard`, `SlotLevelRow`, and `CatalogLevelGroup`.
- **Verification:** 26 test files (147 tests) passing; production build verified.

## Next up
- Expand character creator into full builder (abilities, subclass, race, equipment).
- Long-term roadmap: expand left pane into fillable character sheet.

## Open questions
- (none)
