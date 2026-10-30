# HANDOFF

## Current state (v1.3.6)
- **Uniform Card Gaps & Layout Integrity:** Fixed subpixel line-height calculation (`text-[11px] leading-4`) on catalog and spellbook card metadata rows, normalizing card heights to 54px and ensuring a pixel-perfect, non-alternating 4px gap across both lists.
- **Legacy Badge Alignment:** Locked badge dimensions (`h-4`, `pb-0.5`, `bg-dnd-panel/80`, `text-dnd-pewter`) optically centered vertically to counter font descenders and unified with slot tracker aesthetics.
- **Component Styling Cleanups:** Refined Short Rest button palette, Mythallar spinner in App header/loading, and character action headers.
- **Verification:** 26 test files (150 tests) passing; production build verified.

## Next up
- Expand character creator into full builder (abilities, subclass, race, equipment).
- Long-term roadmap: expand left pane into fillable character sheet.

## Open questions
- (none)
