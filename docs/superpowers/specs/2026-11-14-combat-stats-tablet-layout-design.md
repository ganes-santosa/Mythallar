# Combat Stats Tablet 3-Column Layout Design

## Intent
Enable the 3-column Combat Stats layout on tablets (Samsung Galaxy Tab S10 FE, iPad 10.9-inch, iPad Pro 11-inch) in landscape without causing the Hit Points card (Current/Max, Temp HP) to clash with the quick Damage/Heal capsule.

## Root Cause
The current layout in `VitalsCard.jsx` uses `min-[1390px]:grid-cols-[10fr_7fr_9fr]`. The 1390px breakpoint was introduced because the `10fr 7fr 9fr` ratio gave Column 2 (AC) 27% of available width (~152px), while AC only needs ~80px. Column 1 (Hit Points) was constricted to 217px, below its minimum non-clashing width of ~237px. Tablets in landscape (1180px–1316px) were below 1390px, forcing them into the 2-column layout.

## Scope & Changes
- In `src/components/CharacterSheet/VitalsCard.jsx`:
  - Update the grid columns from `min-[1390px]:grid-cols-[10fr_7fr_9fr]` to `min-[1140px]:grid-cols-[14fr_5fr_9fr]`.
  - Update all `min-[1390px]:` breakpoint utilities on child cards and dividers to `min-[1140px]:`.
- Behavior:
  - At window width >= 1140px (including iPad 10.9" landscape at 1180px, iPad Pro 11" landscape at 1194px, and Galaxy Tab S10 FE landscape at 1316px): Combat Stats displays 3 columns (`14fr 5fr 9fr`). Hit Points has 245px–275px, preventing any overlap or clashing.
  - Below 1140px (including portrait tablets at 820px–834px and phones): Combat Stats collapses to 2-column layout (`sm:grid-cols-2`), keeping elements spacious and readable.
- In `src/test/tabletPreview.test.js` and `src/components/CharacterSheet/VitalsCard.test.jsx`:
  - Add/update tests verifying the `1140px` breakpoint and `14fr 5fr 9fr` grid column ratio.

## Approaches Considered
1. **Approach 1 (Chosen): Adjust column ratio to `14fr 5fr 9fr` + drop breakpoint to `min-[1140px]`**
   - Pure CSS/Tailwind change, minimal diff, zero runtime cost.
   - Accurately fits iPad 10.9" (1180px) and Tab S10 FE (1316px) while preserving 2-column layout in portrait.
2. **Approach 2: CSS Container Queries (`@container (min-width: 490px)`)**
   - Tracks pane width directly, but requires custom CSS classes in `index.css` and container markup changes.
3. **Approach 3: Fixed AC width (`minmax(76px, max-content)`)**
   - Leaves subgrid row 2 (Inspiration) prone to clipping on narrow widths.

## Verification
- Vitest unit tests pass (`VitalsCard.test.jsx` and `tabletPreview.test.js`).
- Test in `tablet.html` across all presets (Tab S10 FE Browser & App, iPad 10.9", iPad Pro 11") in both portrait and landscape.
- Run full test suite (`npm.cmd test -- --run`) and production build (`npm.cmd run build`).
