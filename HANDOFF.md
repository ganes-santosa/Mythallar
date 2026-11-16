# HANDOFF

## Current state (v3.1.4 - master)
- **v3.1.4 (patch)**:
  - 5e Feats catalogue (`public/data/feats.json`, 257 feats from 5etools) generated via `scripts/fetch-feats.mjs` with `npm run update-feats`.
  - Feats autocomplete in `ResourcesCard.jsx` via `SuggestionInput` (only applies on explicit click; Enter dismisses & blurs).
  - Feat ASI derivation: non-destructive `getFeatAbilityBonuses` & `getEffectiveAbilities` with default-on matching first allowed stat, `+1 STAT` badges on chips/viewer, and edit-mode-only `+1 Feat` on `AbilitiesCard`.
  - Stepped textarea bucket transitions (`4, 8, 12, 16`) with zero scrollbar flash and zero vertical text jump.
  - Form Enter guards across `ItemsCard`, `ResourcesCard`, and `HomebrewSpellModal` preventing accidental submission on text inputs.
  - Feat edit mode UX: moved delete icon button (`Trash2`) next to X in header; removed redundant Cancel button.
  - Full suite green: 57 test files, 512 tests passed. Build clean.
- **v3.1.3 (patch)**:
  - 5e Items Catalogue & Autofill (`public/data/items.json`, 3,067 items) via `scripts/fetch-items.mjs`.

## Next up
- Subclasses / other catalogue integrations from 5etools mirror dataset.
- Character builder and left-pane full fillable character sheet expansion.

## Open questions
- Homebrew spells have no `isLegacy`, so the "2014 Legacy" filter hides them and "2024 Modern" shows them. Decide intended behavior.
- Catalog filter Reset does not clear `source` or `hideUA`; user says it works, left as is.
