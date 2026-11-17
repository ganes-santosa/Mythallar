# HANDOFF

## Current state (v3.2.0 - master)
- **v3.2.0 (minor)**:
  - Character Builder modal (`CharacterBuilderModal.jsx`) for guided Level 1 character creation supporting 2024 (XPHB) and 2014 (PHB) rulesets.
  - Creation entry prompt (`CreateCharacterModal.jsx`): "Character Builder" (Recommended) vs "Manual Setup" (blank sheet).
  - 5e catalogues generated from 5etools mirror:
    - Species (`species.json`, 164 entries across 82 unique races + 93 subraces/lineages, instant search bar).
    - Classes (`classes.json`, 26 class entries across 2024 & 2014, including Artificer, with all official subclasses).
    - Backgrounds (`backgrounds.json`, 26 entries with 2024 ASI + Origin Feats and 2014 equipment/skills).
  - Full suite green: 61 test files, 532 tests passed. Build clean.

## Next up
- Future expansion: Multiclassing and subclass progression deeper into character sheet.
- Optional catalogue offline sync or progressive download for lower initial bundle footprint.

## Open questions
- Homebrew spells have no `isLegacy`, so the "2014 Legacy" filter hides them and "2024 Modern" shows them. Decide intended behavior.
- Catalog filter Reset does not clear `source` or `hideUA`; user says it works, left as is.
