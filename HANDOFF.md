# HANDOFF

## Current state (v2.3.3 - master)
- **Notes Adaptive Editor (v2.3.3)**:
  - No short/long split and no forced `minHeight`: card is always content-height. Opening any note sweeps toward header-at-top-bar, clamped per frame to real max scroll.
  - Typing grows the card upward (ResizeObserver scrolls by height delta while card bottom sits at viewport edge) until header hits top bar / editor hits 500px cap.
- **Notes Scroll Fixes (v2.3.2)**:
  - Exit restores sheet scroll via per-frame eased sweep over 300ms synced with grid expansion, so bottom-of-page positions restore exactly without clamping or jitter.
  - Note: JSDOM can't verify layout/scroll clamping; always browser-test scroll changes in `NotesCard.jsx`.
- **Character Sheet Notes Overhaul**:
  - Full WYSIWYG note formatting toolbar: Bold, Italic, Underline, Strikethrough with clean HTML serialization.
  - Smooth 300ms bidirectional grid animations between note list and document canvas without layout snapping.
  - Auto-scroll to top on opening note and accurate scroll restoration on exit back to note list.
  - Directional sorting icon consistency: natural top-to-bottom order (`ArrowDown`) across Recent, Date, and Alphabetical (A-Z).
- **Spellbook Filters & UI Polish**:
  - Animated expandable filter drawer with 200ms accordion transitions (`useAccordionMount`).
- **Verification**: 44 test files (342 tests) passing; production build clean.

## Next up
- Ready for next planned character sheet and spellbook feature milestones.

## Open questions
- (none)
