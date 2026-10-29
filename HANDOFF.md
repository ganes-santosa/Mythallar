# HANDOFF

## Current state (v1.3.1)
- **School of Magic Icons:** Replaced collapsed text tags with square badge school icons (`w-6 h-6`, 24x24px, centered 16x16px icon) using custom assets (`src/assets/*.png`). Toggles to text tag on accordion expand.
- **Palette Alignment:** Updated school color themes (Abjuration, Conjuration, Divination, Enchantment, Evocation, Illusion, Necromancy, Transmutation) to match visual icon palette.
- **Outside Click Popover Dismissal:** Added `useClickOutside` hook to dismiss hint popovers (caster level breakdown, pact magic, prepared/known limits, spell learning hint, wizard copying cost) when clicking outside.
- **Character Header Truncation & Edit Alignment:** Fixed dynamic collision detection in character header; edit action buttons ("Done", "Cancel") wrap cleanly and align left under the input without clipping or right-clash. Default theme set to The Weave (`the-weave`).
- **Verification:** 24 test files (135 tests) green; `npm.cmd run build` clean.

## Next up
- Expand character creator into full builder (abilities, subclass, race, equipment) when ready.
- **Long-term Roadmap:** Evolve left pane (current Spellbook view) into a full fillable D&D character sheet tab / interface while preserving core spellcasting workflow.
- Cloud sync / homebrew library enhancements.

## Open questions
- (none)
