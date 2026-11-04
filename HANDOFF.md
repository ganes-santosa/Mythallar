# HANDOFF

## Current state (v2.1.5 - master)
- **Header Reorganization & Streamlined Actions:**
  - Export and Import moved from right pane `CharacterHeader` into `CharacterManagerModal` (global JSON import + per-character JSON export).
  - Auth button (`AuthStatus`) and middle-anchored view switcher wrap down via container query (`@container (max-width: 565px)`) exactly when header inline space runs out:
    - Wide / medium state (> 565px): 1-row grid layout: `[Branding] [Auth] [Spacer] [Switcher] [Settings]`.
    - Narrow state (<= 565px): 2-row grid: Row 1 = `[Branding]` + `[Settings]`; Row 2 = `[Auth]` + `[Switcher]`.
    - Branding has `shrink-0` ensuring title, subtitle, and version badge never compress or clip into Auth.
    - Clearance on view switcher set to `mr-24` (96px, exact 95px expansion fit) with zero collision.
    - Zero collisions across all aspect ratios and window sizes.
  - Character profile card in right pane expanded to full width.
  - View switcher compact by default with `BookOpen` and `UserRound` icons pinned symmetrically to exact middle seam:
    - Grimoire pinned to middle seam and expands leftward: `[ Grimoire 📖 ]`.
    - Character Sheet pinned to middle seam and expands rightward: `[ 👤 Character Sheet ]`.
    - Both icons remain locked in place at identical X coordinates in compact and expanded states.
    - Symmetrical container includes 112px clearance (`mr-28`) preventing collision with settings gear or container edge.
    - `AuthStatus` morphs into compact icon-only state during hover expansion.
  - Touchscreens (`@media (hover: none)`) retain static compact states.
- **Iconography Updates & View Switcher Renaming:**
  - View switcher: "Grimoire" renamed to "Spell Library" with `LibraryBig` icon.
  - Ability Scores & Saving Throws accordion icon updated to `Pyramid`.
  - Filter icons updated to `Blend` across Catalog (`FilterBar`) and Spellbook (`SpellbookView`).
  - Accordion edit buttons updated to `UserPen` across all character sheet sections (`CharacterSheetView`, `CharacterSheetHeader`, `CharacterHeader`).
  - AC vital icon updated to `ShieldHalf` (`VitalsCard`).
  - Character Lore sub-accordion icon updated to `FingerprintPattern` (`CharacterSheetHeader`).
- **Verification:** 40 test files (259 tests) passing; production build clean.

## Next up
- Ready for next user instructions or feature development.

## Open questions
- (none)
