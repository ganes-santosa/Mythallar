# Design: Capitalization Uniformity & Visual Guidelines Alignment

Date: 2026-11-01  
Status: Proposed  

## Intent & Why
`VitalsCard.jsx` currently contains remnants of ALL-CAPS text (`HIT POINTS`, `INIT`, `SPEED`, `BASE MAX`, `MAX HP BUFF`) and CSS `uppercase` classes (`tracking-wider`, `uppercase`) that clash with the visual tone and conventions of the rest of the Character Sheet (which uses clean sentence case and Title Case accordion headers). In addition, on tight mobile viewports, `Initiative` risks crowding adjacent controls, requiring responsive abbreviation.

## Goals
1. Rename accordion section header from "Combat Vitals & Formulations" to "Combat Stats" (Title Case).
2. Standardize all internal card labels, input titles, tracker tags, and buttons in `VitalsCard.jsx` to sentence case (preserving standard 5e initialisms: HP, AC, DEX, ft).
3. Remove CSS `uppercase` and `tracking-wider` classes from card elements in `VitalsCard.jsx`.
4. Provide responsive Initiative labeling: `<span className="hidden sm:inline">Initiative</span><span className="sm:hidden">Init</span>`.
5. Codify the capitalization and visual hierarchy rules in `docs/superpowers/specs/2026-10-31-visual-guidelines.md` and `AGENTS.md`.
6. Keep the test suite 100% green.

## Non-Goals
- Changing any damage/heal mechanics or component state logic.
- Redesigning other cards that already follow sentence case.

## Approaches Considered
- **Approach 1 (Selected)**: CSS responsive toggle (`Initiative` on desktop/tablet, `Init` on narrow mobile) + uniform sentence case + section header renamed to "Combat Stats" + explicit documentation in guidelines and `AGENTS.md`.
- **Approach 2**: Always render `Initiative` with CSS `truncate`. Dropped due to awkward truncation on narrow screens.

## Detailed Changes
1. **`CharacterSheetView.jsx` & `CharacterSheetView.test.jsx`**:
   - Rename accordion section header `Combat Vitals & Formulations` -> `Combat Stats`.
   - Update accordion toggle tests expecting `Combat Vitals & Formulations` label.
2. **`VitalsCard.jsx`**:
   - Card title: `Hit points` (with heart icon).
   - Stat tags: `+X buff`, `max`, `temp`.
   - Action buttons: `Damage`, `Heal` (no `uppercase`).
   - Stat pair: `<span className="hidden sm:inline">Initiative</span><span className="sm:hidden">Init</span>`, `Speed` (no `uppercase`).
   - Trackers strip: `Hit dice`, `Death saves`, `Inspiration`, `Succ`, `Fail` (no `uppercase tracking-wider`).
   - Edit mode labels: `Current`, `Base max`, `Max HP buff`, `Temp HP`, `Effective max:`.
3. **`VitalsCard.test.jsx`**:
   - Update tests checking for specific button or label text if affected.
4. **`docs/superpowers/specs/2026-10-31-visual-guidelines.md`**:
   - Update section mapping table (`Combat Stats`).
   - Add explicit Capitalization Standard section defining Title Case for accordion headers vs. sentence case for card interiors and controls.
5. **`AGENTS.md`**:
   - Update `## UI conventions` to document the capitalization standard.
