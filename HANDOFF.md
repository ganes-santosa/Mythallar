# HANDOFF

## Current state (v2.4.0 - master)
- **Simulacrum Companion Tracker**:
  - Simulacrum toggle switch in edit mode on both Character Sheet portrait and Right Pane header.
  - Dedicated `Simulacrum Combat Stats` accordion on Character Sheet with half-HP baseline and independent vitals editing.
  - Dedicated `Simulacrum Spell Slots` tracker in right pane with independent slot tracking (no rest recovery, custom max slots).
  - Smooth opening and closing animations for both Simulacrum accordions using `useAccordionMount`.
  - Full import/export schema round-trip support in `fileExport.js`.
- **Combat Vitals Polish**:
  - Added in-memory Undo and Redo HP buttons to `VitalsCard.jsx` for rapid combat HP adjustments.
- **PWA Mobile Launcher Breathing Room**:
  - Scaled down maskable logo in `pwa-192x192.png` and `pwa-512x512.png` (~45% total canvas, ~63% squircle width) on solid `#1E1E29` background.
- **Verification**: 47 test files (429 tests) passing; production build clean.

## Next up
- Ready for next user instructions or feature development.

## Open questions
- (none)
