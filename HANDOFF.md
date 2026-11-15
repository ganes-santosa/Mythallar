# HANDOFF

## Current state (v3.1.2 - master)
- **v3.1.2 (patch)**:
  - Numeric input UX: currency, abilities, darkvision, passives, combat settings, speeds, and max spell slots preserve empty drafts while typing, normalize leading zeroes, and commit on blur (`NumericDraftInput` / `useNumericDraft`).
  - Swipeable Toast Notifications: `ToastBanner` (`src/components/Common/ToastBanner.jsx`) supports horizontal swipe/drag in both directions (>=60px threshold) with opacity fade and snap-back. Integrated into `App.jsx`, `ShortRestModal.jsx`, `VitalsCard.jsx`.
  - Notes Empty State & Clipping Fix: character sheet `notes` defaults to `[]` on creation and allows zero notes without forcing "General". List view renders "No Notes" empty state. Added `p-1 -m-1` padding around editor toolbar to eliminate armed delete button outline clipping.
  - Verification: 54 test files passing (486/486 tests); production build clean.
- **v3.1.1 (patch)**:
  - Mobile browser vertical reactivity: fixed address bar viewport cutoff where Notes was clipped by replacing cascading `100vh` with `h-full h-[100dvh]` across root, `index.css` (`html, body, #root`), and adding `interactive-widget=resizes-content` to `index.html`.
  - Left scroll hitbox extension: left pane scroll hitbox now extends to screen edge (`x = 0`) across both Spell Library and Character Sheet views.
  - Uniform left margin alignment: Mythallar logo branding, search bar & filter card, "Showing spells" text, and spell cards below all align with uniform padding/margin (`pl-4 sm:pl-5`, 16px mobile, 20px desktop).
- **v3.1.0 (minor)**:
  - Spellbook compact view toggle (`SpellbookCompactCard`) beside the Spellbook title.
  - Uniform tool-icon colors and button containers (header buttons get `max-md:bg-dnd-hover` on mobile); Tabler `sparkles-2` (Spell Slots) and `sparkle-highlight` (Spellcasting) icons; Simulacrum snowflake 15px.
  - Wide layout: panes `md:flex-none` + `md:w-1/2` (fixes first-load gap shift); right pane margins restored to v2.3.5 with the scroll hitbox reaching the page center; custom right-pane scrollbar CSS removed.
  - Mobile Library filter card: 300ms show/hide, hides after 6 cards of scroll-down, shows after 3 cards of scroll-up.
- **Combat Stats & Tablet Preview**:
  - Tablet preview harness: standalone `tablet.html` with presets for Galaxy Tab S10 FE (Browser 1316×648, PWA 1316×744), iPad 10.9" (820×1180), and iPad Pro 11" (834×1194).
  - Responsive Combat Stats layout: breakpoint `min-[1300px]:` with ratio `27fr 12fr 17fr`.
  - Dynamic collision fallback: auto-detects 4-digit HP values, dynamically falling back to 2 columns with Hit Points spanning `sm:col-span-2`.

## Next up
- Feats & Subclasses catalogue integration from 5etools GitHub mirror dataset.
- Catalogue updates: `npm.cmd run update-spells`.

## Open questions
- Homebrew spells have no `isLegacy`, so the "2014 Legacy" filter hides them and "2024 Modern" shows them. Decide intended behavior.
- Catalog filter Reset does not clear `source` or `hideUA`; user says it works, left as is.
