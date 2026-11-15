# Combat Stats Dynamic Collision Fallback Design

## Intent
Automatically switch the Combat Stats layout from 3 columns to 2 columns whenever Hit Points content (e.g., 4-digit HP values or high Temp HP) expands and threatens to clash with the Damage/Heal capsule and divider.

## Root Cause
When characters have high HP values (e.g. 4 digits like `2333 / 3230`), the Current/Max and Temp HP boxes expand horizontally. In 3-column layout on tablets (or narrower desktop viewports), this reduces the clearance between the Temp HP box and the vertical divider to less than the required padding distance.

## Chosen Approach: Auto Collision Detection (Approach 2)
- In `VitalsCard.jsx`:
  - Attach a `useRef` to the left HP content container (holding Current/Max and Temp HP) and the right vertical divider / capsule.
  - Using a `ResizeObserver` or `useLayoutEffect`, calculate the clearance:
    `clearance = divider.offsetLeft - (tempBox.offsetLeft + tempBox.offsetWidth)`.
  - Alternatively, compare the scroll width / natural required width of the inner content against the container width. Specifically, if the required inner width (`currentMax.offsetWidth + gap + tempBox.offsetWidth + padding + capsuleWidth`) exceeds the card's available width minus safe padding (e.g. 8px clearance), set `isHpCrowded = true`.
  - When `isHpCrowded` is true:
    - Root grid suppresses the 3-column layout classes, falling back to 2-column layout (`sm:grid-cols-2`).
    - Hit Points card spans both columns (`sm:col-span-2`), giving ample breathing room.
    - When values shrink or window expands such that clearance >= 8px with 3 columns, it safely returns to 3-column layout.

## Verification
- Unit test in `VitalsCard.test.jsx`:
  - Render with normal 2-digit HP: 3-column layout active when >= 1140px.
  - Render with 4-digit HP (`2333 / 3230`): detects crowded layout and switches to 2-column layout.
- Test in `tablet.html` preview.
- Run full test suite (`npm.cmd test -- --run`) and production build (`npm.cmd run build`).
