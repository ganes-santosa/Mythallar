# HANDOFF

## Current state (v1.2.6)
- **First-Time User Character Onboarding & Empty State:** Removed default placeholder Mordenkainen. Fresh installations start with zero characters and an onboarding prompt ("Create First Character"). Users can delete the last remaining character from `CharacterManagerModal`, automatically closing the modal and reverting the right pane to the onboarding screen.
- **Character Creator Modal:** `CreateCharacterModal.jsx` prompts for name and 1st-level class, with single-click X/close and Cancel buttons, and "Adventure awaits" subtitle.
- **Cantrip & Leveled Spell Counters:** Cantrip accordion header calculates 5e max cantrips known (`x / max cantrips`) with full multiclassing support and turns red on overflow. Leveled spell groups show `${preparedCount} prepared`.
- **Wizard Spell Copying & Obfuscation:** Leveled spells added by Wizards start in `copying: true`. Obfuscated with glyphs, masked metadata, two-click confirmation.
- **Spell Notes:** Added spell note feature to opened spell accordions (`SpellNoteSection.jsx`). Appears at end of description after "At Higher Levels" with small "Add Note" button on right. Inline textarea to add/save/cancel. Saved notes display with non-italic `Note: <content>` and edit/delete actions.
- **Chronurgy & Graviturgy Specializations:** Restored `specializations` and Wizard class assignment for all 15 Dunamancy spells in `public/data/spells.json` and `scripts/fetch-spells.mjs`. Render subtle purple badge chips before school when accordion is open; filterable via School dropdowns.
- **Verification:** 23 test files (129 tests) green; `npm.cmd run build` green. Dev server live at http://localhost:5173.

## Next up
- Expand character creator into full builder (abilities, subclass, race, equipment) when ready.
- Cloud sync / homebrew library enhancements.

## Open questions
- (none)
