# HANDOFF

## Current state (v2.0.1)
- **Character Sheet Left-Pane Integration:** Built modular card grid (`CharacterSheetView`) with segmented toggle in header (`Grimoire` vs `Character Sheet`).
- **Core 5e Calculation Engine:** Added `dndCalculations.js` for dynamic level-based proficiency bonus and ability modifiers with toggleable saving throw proficiencies and overrides.
- **Combat Vitals & Formulations:** Added `VitalsCard` with editable HP (current/max/temp), AC breakdown formula, exhaustion stepper, and inspiration toggles.
- **Tracked Resources & Notes:** Added `ResourcesCard` with interactive `+`/`-` steppers for custom resources (Lucky, Chronal Shift, etc.) and freeform notes textarea.
- **Items & Attunement Mode:** Added `ItemsCard` with interactive attunement mode (`Manage Attunement`), tracking `X / 3` capacity with glowing ivory bookmark strips (`#EFE9E0` with ambient glow) matching `SpellbookCard.jsx`.
- **Backward Compatibility:** Extended `storage.js` with `createDefaultSheet` so legacy saved characters cleanly migrate without data loss.
- **Verification:** 33 test files (174 tests) passing; production build clean.

## Next up
- Add character portrait support (compressed 256x256 WebP via browser `<canvas>`).
- Extend character creator with subclass, background, and stats selection.

## Open questions
- (none)
