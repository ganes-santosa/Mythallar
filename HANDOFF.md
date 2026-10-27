# HANDOFF

## Current state (since v1.2.4)
- **Wizard Spell Copying & Obfuscation:** Leveled spells added by Wizards start in `copying: true` (`prepared: false`). While copying: greyed-out spell name, `Copying` badge + `HelpCircle` time/cost popover, `'???'` metadata masking, runic/alchemical/occult glyph obfuscation (`MAGICAL_GLYPHS` / `obfuscateMagicalText`) on descriptions, hidden `Cast` button, and two-click `Finish Copying` / `Finish Copying All`.
- **Prepared vs. Known Spell Limits:** `PreparedSpellSummary.jsx` shows `Prepared: X / Y` for prepared casters (`Wizard`, `Cleric`, `Druid`, `Paladin`, `Artificer`), `Known: X / Y` (`KNOWN_SPELLS_TABLE`) for known casters (`Bard`, `Sorcerer`, `Ranger`, `Warlock`), and both for multiclass; turns `text-red-500` when `X > Y`. Cantrips (`level === 0`) and copying spells are excluded from limit counts.
- **Spellbook Filters & Card Details:** Expandable `Filters` button/accordion in `SpellbookView.jsx` (level, class, school, prepared, copying, concentration, ritual, V/S/M, reset), independent level group accordions (`collapsedLevels`), and `Classes:` badges in expanded `SpellbookCard.jsx`.
- **Two-Click Confirmations:** Multiclass `ClassDeleteButton` in `CharacterHeader.jsx` uses `useTwoClickConfirm`; all armed buttons keep identical text and icons.
- **Bug Fixes & Build:** Fixed `SpellList.jsx` scrollbar clipping, fixed `textCleaner.js` bullet item parsing + regenerated `public/data/spells.json`, and injected `__APP_VERSION__` from `package.json` via `vite.config.js`.
- **Verification:** 21 test files (114 tests) green; `npm.cmd run build` green.

## Next up
- When ready to release: bump MINOR to `v1.3.0` (`npm.cmd version minor --no-git-tag-version`), test, build, commit, tag `v1.3.0`, and push without `[skip netlify]`.

## Open questions
- Remove scratch files committed in `v1.2.4` (`extract_sqlite_logo.cjs`, `extracted_logo_16.png`, `test-output.txt`)?
