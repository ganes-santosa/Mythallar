# HANDOFF

## Current state (v2.3.7 - master)
- **Level-Up Checklist & 5e Starting Rules**:
  - Added `LevelUpModal.jsx` and `levelUpRules.js` with 5e level 1 starting choices across all classes.
  - Anchored level-up alert badge as top-right superscript relative to character name in `CharacterHeader` and `CharacterSheetHeader`.
- **Level Group Accordion Transitions**:
  - Added CSS grid height opening/closing transitions to level groups in `SpellList.jsx` and `SpellbookLevelGroup.jsx` without triggering expand autoscroll.
- **Spellbook Sizing & Terminology**:
  - Purged all instances of "grimoire" across the codebase in favor of "spellbook" and "spells".
  - Added dynamic container height sizing in `SpellbookView.jsx` to stop flush at right pane bottom limit while preserving independent inner card scrolling.
- **Right Pane Scroll Layout**:
  - Expanded native scroll container across right pane with inset scrollbar styling.
- **Verification**: 47 test files (418 tests) passing; production build clean.

## Next up
- Resolve right-pane outer padding wheel scrolling behavior and scroll rate uniformity on the right side of the scrollbar.

## Open questions
- (none)
