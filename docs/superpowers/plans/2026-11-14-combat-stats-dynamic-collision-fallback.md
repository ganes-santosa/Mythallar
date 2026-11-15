# Combat Stats Dynamic Collision Fallback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically collapse Combat Stats to 2 columns when Hit Points content (e.g. 4-digit values) exceeds the 3-column capacity, preventing Temp HP from clashing with the Damage/Heal capsule.

**Architecture:** A lightweight `ResizeObserver` and calculation in `VitalsCard.jsx` monitors the required width of Hit Points (`inputsRow.scrollWidth + gaps + capsule + padding`) against the 3-column allocation (`gridWidth * (27/56)`). When required width exceeds the 3-column width, `isHpCrowded` triggers the 2-column layout.

**Tech Stack:** React 18 (`useRef`, `useState`, `useLayoutEffect`), Vitest.

**Spec:** `docs/superpowers/specs/2026-11-14-combat-stats-dynamic-collision-fallback-design.md`

## Global Constraints
- Pure React/CSS; no layout flickering or resize thrashing.
- Keep normal 2-digit and 3-digit HP in 3-column layout on landscape tablets (Galaxy Tab S10 FE, iPads).
- Trigger 2 columns when 4-digit HP values cause clearance to dip below safe padding distance.

## Review Focus
- High digit values (e.g. 2333 / 3230) must trigger 2 columns on tablet landscape.
- Normal values (e.g. 10 / 10) must remain 3 columns on tablet landscape.
- Transitioning back to normal values must restore 3 columns smoothly without page reload.

---

### Task 1: Dynamic Collision Detection in VitalsCard

**Files:**
- Modify: `src/components/CharacterSheet/VitalsCard.jsx`
- Test: `src/components/CharacterSheet/VitalsCard.test.jsx`

- [ ] **Step 1: Write failing test for 4-digit HP fallback**
In `VitalsCard.test.jsx`, test that rendering with 4-digit HP (`hpCurrent: 2333, hpMax: 3230`) sets `data-hp-crowded="true"` or falls back to 2-column layout.

- [ ] **Step 2: Run test to verify it fails**
Run `npm.cmd test -- --run src/components/CharacterSheet/VitalsCard.test.jsx`.

- [ ] **Step 3: Implement collision calculation in `VitalsCard.jsx`**
Add ref to grid and inputs row, measure required width vs 3-column width allocation, set `isHpCrowded` state, and conditionally apply 3-column vs 2-column grid classes.

- [ ] **Step 4: Run unit tests to verify they pass**
Run `npm.cmd test -- --run src/components/CharacterSheet/VitalsCard.test.jsx`.

- [ ] **Step 5: Verify in `tablet.html` preview and full test suite**
Check live behavior in browser, run `npm.cmd test -- --run` and `npm.cmd run build`.
