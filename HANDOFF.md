# HANDOFF

## Current state (v3.1.3 - master)
- **v3.1.3 (patch)**:
  - 5e Items Catalogue & Autofill: `scripts/fetch-items.mjs` generates `public/data/items.json` (3,067 items including magic variants) with formatted 5e `typeLine` headers prepended to descriptions.
  - Typeahead `SuggestionInput`: `src/components/Common/SuggestionInput.jsx` opens strictly while typing and dismisses on blur/outside click; integrated into `ItemsCard` Add/Edit Item forms (autofills category, color, attunement, and description while remaining fully editable).
  - Viewer Pane Two-Click Delete & Trash Icons: added `useTwoClickConfirm` delete buttons (`Trash2`) to `ItemDetailViewer`, `ItemForm` (edit mode), and `ResourceDetailViewer`; replaced `X` on item chips with `Trash2`.
  - Spell Search Match: removed description text from `useSpellFilter` search matching so queries match name and tags cleanly.
  - Verification: 56 test files passing (500/500 tests); production build clean.
- **v3.1.2 (patch)**:
  - Numeric input UX (`NumericDraftInput` / `useNumericDraft`), swipeable `ToastBanner`, and Notes empty state / toolbar clipping fix.
- **v3.1.1 (patch)**:
  - Mobile browser `100dvh` viewport fix, left scroll hitbox extension, and uniform left margin alignment.

## Next up
- 5e Feats catalogue (`public/data/feats.json`) + `SuggestionInput` autofill + inline Feat Detail Viewer + optional linked Tracked Resource flow in `ResourcesCard.jsx`.
- Subclasses / other catalogue integrations from 5etools mirror dataset.

## Open questions
- Homebrew spells have no `isLegacy`, so the "2014 Legacy" filter hides them and "2024 Modern" shows them. Decide intended behavior.
- Catalog filter Reset does not clear `source` or `hideUA`; user says it works, left as is.
