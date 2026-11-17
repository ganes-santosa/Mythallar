# HANDOFF

## Current state (v3.1.6 - master)
- **v3.1.6 (patch)**:
  - Subdivision dividers standardized to `pt-1.5 border-t border-white/5` across Character Features (Feats, Tracked Resources, Feature Notes) and Items & Inventory categories, replacing the heavier `border-t border-white/10 my-3` separators.
  - "Features & Freeform Notes" renamed to `Feature Notes` (label + `aria-label`), wrapped in the standard subdivision header row so text baseline and 17px divider gap match every other subdivision.
  - Character Features accordion header now holds only the edit-mode toggle; Reset and `+ Add` moved into the Tracked Resources subdivision header (`hideHeaderActions={false}`).
  - Removed dead `handleResetAllResources` from `CharacterSheetView` (reset now lives in `ResourcesCard`), plus unused `RotateCcw` import.
  - Full suite green: 57 test files, 516 tests passed. Build clean.
- **v3.1.5 (patch)**:
  - Character Features accordion restructure: Top Detail Viewer Drawer -> Feats -> Tracked Resources -> Notes.
  - Feat chips restyled to match Conditions and Resistance & Immunities compact tag pills (`rounded-lg text-[11px] px-2 py-0.5 shadow-sm`, `None recorded` empty state).
  - Feats subheader aligned with identical weight, color (`text-slate-400 font-medium text-[10px]`), and icon (`text-amber-400`).
- **v3.1.4 (patch)**:
  - 5e Feats catalogue (`public/data/feats.json`, 257 feats from 5etools) generated via `scripts/fetch-feats.mjs` with `npm run update-feats`.
- **v3.1.3 (patch)**:
  - 5e Items Catalogue & Autofill (`public/data/items.json`, 3,067 items) via `scripts/fetch-items.mjs`.

## Next up
- Character creation entry prompt: "Character Builder" (Recommended) vs "Manual Setup" in `CreateCharacterModal.jsx`.
- Character Builder flow backed by 5etools fetches (`fetch-classes.mjs`, `fetch-species.mjs`, `fetch-backgrounds.mjs` -> `public/data/`), mirroring the spells/feats pipeline.

## Open questions
- Homebrew spells have no `isLegacy`, so the "2014 Legacy" filter hides them and "2024 Modern" shows them. Decide intended behavior.
- Catalog filter Reset does not clear `source` or `hideUA`; user says it works, left as is.
