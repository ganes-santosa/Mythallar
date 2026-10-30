# HANDOFF

## Current state (v1.3.4)
- **Wizard Arcane Recovery Modal:** Single-line recovery layout with tight stepper spacing (`space-x-1`, `w-3.5`), theme gold `+` button, grey available stars, and pulsing yellow recovering stars.
- **Two-Click Rest Confirmation:** Converted Long Rest, header Short Rest, and Pact Magic Short Rest to `useTwoClickConfirm` with armed green icon & ring styling.
- **Skip Copying State Setting:** Added configurable `skipCopying` app preference in Settings modal that immediately readies wizard spells without scribing state.
- **Smooth Accordion Transitions:** Applied CSS Grid row animations across FilterBar, CharacterHeader, SpellSlotTracker, and SpellbookLevelGroup.
- **Verification:** 25 test files (144 tests) green; production build verified.

## Next up
- Add smooth expand/collapse transition for individual spell cards (`SpellbookCard` and catalog `SpellCard`).
- Expand character creator into full builder (abilities, subclass, race, equipment).
- Long-term roadmap: expand left pane into fillable character sheet.

## Open questions
- (none)
