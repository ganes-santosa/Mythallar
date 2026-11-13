# HANDOFF

## Current state (v3.0.0 - master)
- **Mobile UI (major)**:
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
- **Verification**: 48 test files passing; production build clean.

## Next up
- Awaiting next feature request. Catalogue updates: `npm.cmd run update-spells`.

## Open questions
- (none)
