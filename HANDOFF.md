# HANDOFF

## Current state (v2.3.2 - master)
- **Notes Scroll & Height Fixes (v2.3.2)**:
  - Short entries stay compact (no `minHeight` void, gentle scroll only if overflowing); long entries (>400 chars or >15 lines) expand and scroll header to top bar.
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
