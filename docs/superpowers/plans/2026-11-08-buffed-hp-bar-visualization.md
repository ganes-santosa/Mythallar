# Buffed Max HP Bar Line Visualization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Represent buffed Max HP capacity and current HP penetration on the Hit Points mini health bar with a boundary notch, tinted buff zone, and amber fill segment.

**Architecture:** Update `VitalsCard.jsx` health bar calculation to compute base capacity percentage, base current HP percentage, buffed current HP percentage, and temp HP percentage. Add visual base max notch and amber background track for buffed segment.

**Tech Stack:** React 18, Tailwind CSS, Lucide icons, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-08-buffed-hp-bar-visualization-design.md`

## Global Constraints
- Minimal nested elements & zero outlines rule: no border/outlines on inner indicators unless specified.
- Retain exact standard behavior when `hpMaxBuff <= 0`.
- All tests in `npm.cmd test -- --run` must pass.

## Review Focus
- Effective max is 0 or negative: percentages must clamp cleanly without `NaN` or dividing by zero.
- Current HP <= baseMax when buffed: buffed current bar width must be 0% and notch must remain at base percentage.
- Current HP > baseMax: green segment fills exactly to notch (`basePercent`), amber segment fills excess up to `currentPercent`.
- Temp HP addition with buff: temp HP segment must stack cleanly after current HP without overflowing 100%.
- Negative buff (drain): standard unbuffed layout applies.

---

### Task 1: Update Mini Health Bar in VitalsCard with Tests

**Files:**
- Modify: `src/components/CharacterSheet/VitalsCard.jsx`
- Test: `src/components/CharacterSheet/VitalsCard.test.jsx`

**Interfaces:**
- Consumes: `hpCurrent`, `hpMax`, `hpMaxBuff`, `hpTemp`, `effectiveMax` from `vitals` prop.
- Produces: Updated DOM elements in mini health bar:
  - Notch marker `data-testid="hp-base-max-notch"` when `hpMaxBuff > 0`.
  - Buff track indicator when `hpMaxBuff > 0`.
  - Progress segments: base current (`bg-emerald-500`), buffed current (`bg-amber-400`), temp (`bg-blue-400`).

- [ ] **Step 1: Write the failing tests in `src/components/CharacterSheet/VitalsCard.test.jsx`**
Add unit test asserting:
1. When `hpMaxBuff > 0` (e.g. Base Max 73, Buff 12, Current 73, Temp 14):
   - Base max notch exists with `left: 85.8824%` (`(73/85)*100`).
   - Emerald bar has width `85.8824%`.
   - Amber bar has width `0%`.
   - Temp bar has width `14.1176%` (clamped to fit 100%).
2. When Current HP exceeds Base Max (e.g. Current 80, Base 73, Buff 12):
   - Emerald bar is `(73/85)*100%`.
   - Amber bar is `(7/85)*100%`.
3. When `hpMaxBuff <= 0`:
   - No notch exists (`hp-base-max-notch` not in document).

- [ ] **Step 2: Run test to verify it fails**
Run: `npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx --run`
Expected: FAIL with `hp-base-max-notch` not found.

- [ ] **Step 3: Implement calculation and markup in `src/components/CharacterSheet/VitalsCard.jsx`**
In `VitalsCard.jsx`:
```javascript
const isBuffed = hpMaxBuff > 0 && effectiveMax > 0;
const basePercent = isBuffed ? Math.min(100, Math.max(0, (baseMax / effectiveMax) * 100)) : 100;
const baseCurrentPercent = isBuffed
  ? Math.min(basePercent, Math.max(0, (Math.min(hpCurrent, baseMax) / effectiveMax) * 100))
  : Math.min(100, Math.max(0, (hpCurrent / effectiveMax) * 100));
const buffedCurrentPercent = isBuffed
  ? Math.min(100 - baseCurrentPercent, Math.max(0, (Math.max(0, hpCurrent - baseMax) / effectiveMax) * 100))
  : 0;
const tempPercent = Math.min(
  100 - (baseCurrentPercent + buffedCurrentPercent),
  Math.max(0, (hpTemp / (effectiveMax || 1)) * 100)
);
```
Render container with relative position, optional amber track for `left: ${basePercent}%, width: ${100 - basePercent}%`, notch marker at `left: ${basePercent}%`, and 3 flex progress bars (`bg-emerald-500`, `bg-amber-400` if buffed, `bg-blue-400`).

- [ ] **Step 4: Run test to verify it passes**
Run: `npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx --run`
Expected: PASS

- [ ] **Step 5: Run full test suite and build verification**
Run: `npm.cmd test -- --run` and `npm.cmd run build`
Expected: All 42 files pass, production build succeeds.
