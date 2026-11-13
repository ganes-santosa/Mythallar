# HANDOFF

## Current state (v3.1.0 - master)
- **v3.1.0 (minor)**:
  - Spellbook compact view toggle (`SpellbookCompactCard`) beside the Spellbook title.
  - Uniform tool-icon colors and button containers (header buttons get `max-md:bg-dnd-hover` on mobile); Tabler `sparkles-2` (Spell Slots) and `sparkle-highlight` (Spellcasting) icons; Simulacrum snowflake 15px.
  - Wide layout: panes `md:flex-none` + `md:w-1/2` (fixes first-load gap shift); right pane margins restored to v2.3.5 with the scroll hitbox reaching the page center; custom right-pane scrollbar CSS removed.
  - Mobile Library filter card: 300ms show/hide, hides after 6 cards of scroll-down, shows after 3 cards of scroll-up.
  - Search inputs use `transition-shadow` (no focus-outline flash); filter panel clipping fixed (`-mx-1 px-1`).
  - Verification: 52 test files passing; production build clean.
- **Header + empty state (patch)**:
  - Desktop pane header holds the 3-way switcher at a constant 103px from the accordion's right edge; at `@container (max-width: 580px)` the sign-in label shortens to "Sign in" and the branding subtitle hides. Below 420px the switcher drops to row 2 at the same x.
  - Header CSS split by media query: mobile keeps the full-width switcher row; desktop keeps the narrow-pane rules.
  - `EmptyCharacterState` (`src/components/Common/`) is the single no-character screen; mobile Spellbook and Sheet tabs match pixel-for-pixel. Desktop keeps its original two-pane empty states (left text, right framed panel).
  - Verification: 50 test files passing; production build clean.
- **Mobile UI (v3.0.0, major)**:
  - Vertical three-way switcher: Library / Spellbook / Sheet.
  - Filter bar hides on downward scroll (150ms ease-out, `HIDE_AFTER_PX` anchored to last upward scroll).
  - Header buttons, modal portal, and uniform margins tuned for narrow viewports.
  - `mobile.html` committed as a local device-preview harness (loads `/` in an iframe).
- **Spell catalogue overhaul**:
  - Regenerated from the 5etools mirror: 1038 spells (was 969; +69 WoW, 0 removed).
  - Stable ids preserved; script aborts on removed ids unless `--force`. Now writes CRLF to match the repo.
  - `AU` renamed to `UA` app-wide; `variantEra` / `variantSource` badges with duplicate-group rules.
  - `SourceHint` popup explains each source code; UA filter switch added to the filter bar.
- **Vitals polish**: HP card row switches to the 3-column layout at `min-[1390px]:` so Temp HP never crowds the Damage/Heal capsule.
- **Verification**: 48 test files passing; production build clean (as of v3.0.0).

## Next up
- Awaiting next feature request. Catalogue updates: `npm.cmd run update-spells`.

## Open questions
- Homebrew spells have no `isLegacy`, so the "2014 Legacy" filter hides them and "2024 Modern" shows them. Decide intended behavior.
- Catalog filter Reset does not clear `source` or `hideUA`; user says it works, left as is.
