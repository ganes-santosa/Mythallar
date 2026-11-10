# HANDOFF

## Current state (v2.3.6 - master)
- **Selective Cloud Sync & Homebrew Spells**:
  - `HomebrewSpellModal`: added "Sync to Cloud" toggle when signed in (default checked), allowing local-only homebrew spell creation.
  - `LocalCharactersImportModal`: accordion-based layout with collapsible Characters and Homebrew Spells sections, zero border styling, and independent "Select All" / "Select None" buttons.
  - `App.jsx`: unowned local spells stay local during cloud pull without forced claiming; sign-in prompt offers selective upload for both characters and homebrew spells.
  - Fixed `handleDeleteHomebrewSpell` dependency array in `App.jsx` and verified `flushPendingDeletes` resilience with unit tests.
- **PWA & App Icon Background**:
  - Replaced transparent background on `public/pwa-192x192.png` and `public/pwa-512x512.png` with opaque `#1E1E29` dark indigo.
  - Updated `manifest.webmanifest` & `index.html` theme/background colors to `#1E1E29` to fix white background on Android, iPadOS, and Chrome.
- **Verification**: 45 test files (388 tests) passing; production build clean.

## Next up
- Level-up soft checklist guide (D&D 5e manual scaling tracker).

## Open questions
- (none)
