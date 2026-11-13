# Design Doc: Mobile Vertical Three-Way View Toggle

## Intent
Provide a streamlined single-pane layout on mobile vertical screens (< md breakpoint / 768px) where users toggle between three core views (Character Sheet, Spellbook & Slots, Spell Catalog) without altering desktop dual-pane behavior or layout.

## Goals
- **Desktop (>= md)**: Exact bit-for-bit preservation of existing dual-pane layout. Left pane toggles between Catalog (`spells`) and Sheet (`sheet`); right pane remains pinned with Character Header, Spell Slots, and Prepared Spellbook.
- **Mobile (< md)**: Full-width single-pane experience with 3 distinct views:
  1. `Sheet`: Full Character Sheet.
  2. `Spellbook`: Active character header, spell slot tracker, and prepared spellbook.
  3. `Catalog`: Full spell library search and filters.
- **Navigation access on mobile**: The view toggle and header actions (Settings, Auth status) remain accessible regardless of which view is active.
- **No layout shift or clipping**: Fluid view transitions without horizontal overflow or clipped scrollbars.

## Non-Goals
- Changing the desktop 50/50 dual-pane layout or wide-screen view switcher.
- Altering internal card or list layouts inside Character Sheet, Spellbook, or Catalog.
- Introducing a fixed bottom navigation bar (Approach 1 chosen over Approach 2).

## Approaches Considered

### Approach 1: Expand Top Header Switcher to 3 Tabs on Mobile (Selected)
- On desktop (`md:`), the left-pane header retains the 2-button hover/expand pill (`Spell Library` | `Character Sheet`).
- On mobile (`< md`), the top header is persistent or shared above the pane content. The view switcher pill exposes 3 tabs:
  - `Sheet` (Icon: `UserRound`)
  - `Spellbook` (Icon: `BookOpen` or `Bookmark`)
  - `Catalog` (Icon: `LibraryBig`)
- The active view renders full-width (`w-full`), hiding the other views.
- **Tradeoffs**: Cleanest UX, zero lost screen height from a bottom bar, uses existing visual language.

### Approach 2: Fixed Bottom Navigation Bar on Mobile (Rejected)
- Pinned bottom bar on mobile with 3 tabs.
- **Tradeoffs**: Consumes 50-60px vertical height on mobile viewports, requires safe-area insets, adds duplicate navigation controls.

## Architecture & Implementation Plan
1. **View State**:
   - Introduce or adapt view state in `App.jsx` so that on desktop it maps between `'spells'` and `'sheet'`, and on mobile it maps between `'sheet'`, `'spellbook'`, and `'catalog'`.
2. **Top Header Structure**:
   - Ensure the catalog header (Branding, AuthStatus, View Switcher, Settings) remains rendered at the top on mobile across all 3 views, or render the switcher consistently so the player can switch between views from any screen.
3. **Pane Visibility**:
   - Section 1 (Left Pane): On mobile, visible when view is `sheet` or `catalog`.
   - Section 2 (Right Pane): On mobile, visible when view is `spellbook`.
   - On desktop (`md:`), Section 1 and Section 2 are both visible side-by-side as `md:w-1/2`.
4. **Active Character Edge Cases**:
   - If no active character exists, `Spellbook` and `Sheet` views show appropriate empty states or default gracefully to `Catalog`.
