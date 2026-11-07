# HANDOFF

## Current state (v2.2.2 - master)
- **Scroll & Transition Polish**:
  - Dual-level right-pane scrolling (`right-pane-scroll` + `SpellbookView`) and left-pane Character Sheet <-> Spell Library scroll preservation.
  - Scrollbars rest at `24%` opacity with native arrows, fading to `100%` on scroll and back after 3s without inherited `scrollbar-color` recalculation lag.
  - Upgraded `useAutoScrollOnExpand` with a synchronized `requestAnimationFrame` + `ResizeObserver` loop (`keepBottomInView`) so bottom accordions (`Notes`, `Proficiencies & Training`, `Items & Inventory`, `SpellCard`, `SpellbookCard`, etc.) open smoothly upwards along the CSS transition curve.
- **Notes, Inventory & Catalog Polish**:
  - `NotesCard` defaults to the list view, inserts new/edited notes at top, adds `ArrowDown`/`ArrowUp` direction toggle + `"Sort By"` (`Recent`, `Date`, `Alphabetical`), and restores scroll positions on editor exit.
  - `ItemsCard` removes duplicate viewer delete button and prevents `ring-1` outline clipping on `item-viewer-card`.
  - `Legacy` tag chip matches `In Book` chip size across `SpellCard` and `SpellbookCard`.
- **Verification**: 41 test files (289 tests) passing; production build clean.

## Next up
- Ready for next user instructions or feature development.

## Open questions
- (none)
