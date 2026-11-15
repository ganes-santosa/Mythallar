# Combat Stats Tablet 3-Column Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable 3-column Combat Stats layout on landscape tablets (Galaxy Tab S10 FE, iPad 10.9", iPad Pro 11") by adjusting column ratios to 14fr 5fr 9fr and lowering the breakpoint to 1140px.

**Architecture:** Tailwind responsive utility classes in `VitalsCard.jsx` updated from `min-[1390px]:` to `min-[1140px]:` with `14fr 5fr 9fr` grid column allocation. Vitest unit tests verify class usage and non-clashing behavior.

**Tech Stack:** React 18, Tailwind CSS 3, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-14-combat-stats-tablet-layout-design.md`

## Global Constraints
- Keep `mobile.html` and `tablet.html` functioning.
- Keep portrait mode (< 1140px) at 2-column layout to avoid clashing.
- Follow existing Title Case and zero-outline conventions.

## Review Focus
- iPad 10.9" in landscape (1180px) must display 3 columns.
- Tab S10 FE in landscape (1316px) must display 3 columns.
- Portrait orientations (820px–834px) must retain 2 columns.
- Subgrid dividers and child card spans must match the new breakpoint.

---

### Task 1: Update Combat Stats Layout Breakpoint & Ratios

**Files:**
- Modify: `src/components/CharacterSheet/VitalsCard.jsx:508-1180`
- Test: `src/components/CharacterSheet/VitalsCard.test.jsx`

- [ ] **Step 1: Write the failing unit test**
Add a test in `src/components/CharacterSheet/VitalsCard.test.jsx` asserting that the root Combat Stats grid uses `min-[1140px]:grid-cols-[14fr_5fr_9fr]`.

- [ ] **Step 2: Run test to verify it fails**
Run `npm.cmd test -- --run src/components/CharacterSheet/VitalsCard.test.jsx`. Expected: FAIL.

- [ ] **Step 3: Update `VitalsCard.jsx`**
Replace `min-[1390px]:` with `min-[1140px]:` and update `grid-cols-[10fr_7fr_9fr]` to `grid-cols-[14fr_5fr_9fr]`.

- [ ] **Step 4: Run unit test to verify it passes**
Run `npm.cmd test -- --run src/components/CharacterSheet/VitalsCard.test.jsx`. Expected: PASS.

- [ ] **Step 5: Visual check in `tablet.html` & full regression**
Open/reload `tablet.html`, verify 3 columns on landscape tablets and 2 columns on portrait tablets. Run `npm.cmd test -- --run` and `npm.cmd run build`.
