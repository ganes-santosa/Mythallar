# HANDOFF

## Current state (v3.2.2 - master)
- **v3.2.2 (patch)**:
  - Character portrait cropper modal (`ImageCropModal.jsx`) integrated across Character Sheet and Character Builder:
    - 3-way ratio switcher (`3:4 Portrait`, `1:1 Square`, `Custom`).
    - Custom mode symmetric vertical drag handles on top/bottom edges bounded strictly between 210px (1:1) and 280px (3:4).
    - Decoupled image scale so resizing crop boundary never zooms or shifts image.
    - Pan clamped to crop frame boundaries; min zoom capped at 1.0x cover fit to prevent black borders.
    - Vector class icons rendered in Character Builder class selector.
  - Full suite green: 64 test files, 564 tests passed. Build clean.

- **v3.2.1 (patch)**:
  - Character Builder ability score generation polish: synchronized individual ability card expand/shrink transitions (`SmoothSize`) in lockstep across methods (e.g. Point Buy to Standard Array) with grid row alignment protection.
  - 2024 Background ASI defaults: ability boost cards default to 0/unfilled (`+0`, no active ring, 3 points remaining) rather than pre-allocating +2/+1; resets on background change.
  - Full suite green: 62 test files, 545 tests passed. Build clean.

- **v3.2.0 (minor)**:
  - Character Builder modal (`CharacterBuilderModal.jsx`) for guided Level 1 creation (2024 & 2014): long-form scroll layout with stable modal height, scroll spy, pinned header/footer.
  - Refined layout & flow: Character Identity at step 2 after Ruleset; subclass and spells sections removed from Level 1 builder; expandable Starting Features accordion inside Class card; Title Case skill proficiency chips with checkboxes; point-buy stepper budget (+/-) for 2024 background ASI; 3-row species chooser grid with expanded trait reading container; D&D Beyond-style unified vertical Ability Score cards (`Ability` -> `Base` -> `Total: X (+Mod)`) with tactile number assignment chips for Standard Array / Roll and clean Manual / Custom inputs.
  - Creation entry prompt (`CreateCharacterModal.jsx`): "Character Builder" (Recommended) vs "Manual Setup" (blank sheet).
  - 5e catalogues generated from 5etools mirror: species (164 entries), classes (26 entries), backgrounds (26 entries).
  - Full suite green: 61 test files, 538 tests passed. Build clean.

## Next up
- Future expansion: Multiclassing and subclass progression deeper into character sheet.
- Optional catalogue offline sync or progressive download for lower initial bundle footprint.

## Open questions
- Homebrew spells have no `isLegacy`, so the "2014 Legacy" filter hides them and "2024 Modern" shows them. Decide intended behavior.
- Catalog filter Reset does not clear `source` or `hideUA`; user says it works, left as is.
