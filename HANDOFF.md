# HANDOFF

## Release v3.2.9 - Resilient split into per-ability catalogue entries

## Current state (master)
- Resilient feat: `scripts/fetch-feats.mjs` now emits `Resilient (STR|DEX|CON|INT|WIS|CHA)` (XPHB + PHB) with a fixed `+1 <ability>` typeLine and ability-named description, instead of a single `+1 Any Ability` entry that defaulted to `+1 STR`. Feats already saved on characters keep their old text.
- Initiative in edit mode: split into `Base` (override, placeholder = DEX mod) and gold `Bonus` (`vitals.initiativeBonus`, default 0), matching the AC and Spellcasting chips.
- Character Lore editor: shared `SteppedTextarea` (4/8/12/16 stepped height, scrolls past 16 lines) for parity with the feat Description / Notes field. No auto-focus on open.
- Builder Proficiencies: `buildLevel1Character` normalizes armor, weapon and tool entries (`Light Armor`, `Shield`, `Simple Weapons`, `Calligrapher's Supplies`).
- Full suite green: 68 test files, 623 tests passed. Production build clean.

## Next up
- Deeper subclass feature integration into character sheet traits/features.
- Optional catalogue offline sync or progressive download for lower bundle footprint.

## Open questions
- Homebrew spells have no `isLegacy`, so "2014 Legacy" filter hides them and "2024 Modern" shows them.
- Catalog filter Reset does not clear `source` or `hideUA`; left as is per past decision.
