# HANDOFF

## Current state (v3.2.0 - master)
- **v3.2.0 (minor)**:
  - Character Builder modal (`CharacterBuilderModal.jsx`) for guided Level 1 creation (2024 & 2014): long-form scroll layout with stable modal height, scroll spy, pinned header/footer.
  - Refined layout & flow: Character Identity at step 2 after Ruleset; subclass and spells sections removed from Level 1 builder; expandable Starting Features accordion inside Class card; Title Case skill proficiency chips with checkboxes; point-buy stepper budget (+/-) for 2024 background ASI; 3-row species chooser grid with expanded trait reading container.
  - Creation entry prompt (`CreateCharacterModal.jsx`): "Character Builder" (Recommended) vs "Manual Setup" (blank sheet).
  - 5e catalogues generated from 5etools mirror: species (164 entries), classes (26 entries), backgrounds (26 entries).
  - Full suite green: 61 test files, 536 tests passed. Build clean.

## Next up
- Future expansion: Multiclassing and subclass progression deeper into character sheet.
- Optional catalogue offline sync or progressive download for lower initial bundle footprint.

## Open questions
- Homebrew spells have no `isLegacy`, so the "2014 Legacy" filter hides them and "2024 Modern" shows them. Decide intended behavior.
- Catalog filter Reset does not clear `source` or `hideUA`; user says it works, left as is.
