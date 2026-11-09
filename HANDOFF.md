# HANDOFF

## Current state (v2.3.5 - master)
- **Currency Tracker & Spellbook Search**:
  - 5e currency tracker (CP, SP, EP, GP, PP) with total wealth in GP.
  - Uniform currency wrapping and dynamic container width detection.
  - Spellbook section search bar matching inventory dimensions (`w-full pl-7 pr-7 py-1 text-xs rounded-lg bg-dnd-card`).
  - Real-time search filtering across spell names, schools, notes, and entries with clear button and empty search states.
  - Search bar styling unified without outline borders across catalog, spellbook, inventory, and notes.
- **Settings Modal Capitalization**:
  - Removed `uppercase tracking-wider` from `Spellbook Preferences` and `Color Palettes` in `SettingsModal.jsx`.
  - Consistent Title Case styling across all modal and accordion headers.
- **Verification**: 45 test files (382 tests) passing; production build clean.

## Next up
- Review user feedback on spellbook, inventory search, and settings.

## Open questions
- (none)
