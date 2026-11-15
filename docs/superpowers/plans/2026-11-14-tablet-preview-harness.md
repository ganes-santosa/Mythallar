# Tablet Preview Harness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a standalone tablet layout preview with iPad and Galaxy Tab S10 FE presets.

**Architecture:** A dependency-free HTML page embeds the Vite app in an iframe. JavaScript swaps logical viewport dimensions and scales the device frame to fit the host review pane.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Vitest/jsdom.

**Spec:** `docs/superpowers/specs/2026-11-14-tablet-preview-harness-design.md`

## Global Constraints
Keep `mobile.html` and application behavior unchanged. Use CSS dimensions 820x1180 for iPad 10.9, 834x1194 for iPad Pro 11, and 960x1536 for Galaxy Tab S10 FE. Scaling must not alter the iframe's logical dimensions.

## Review Focus
Rotation must preserve the selected device; host resizing must retain fit-to-window scaling; controls must remain keyboard accessible; narrow hosts must not crop the tablet.

### Task 1: Tablet harness

**Files:**
- Create: `tablet.html`
- Test: `src/test/tabletPreview.test.js`

**Interfaces:**
- Produces the `/tablet.html` development page with preset buttons, a rotation button, live dimensions, and an iframe targeting `/`.

- [ ] **Step 1: Write the failing test**
Parse `tablet.html` into jsdom and assert the three viewport presets, Galaxy default, rotate control, live app iframe, and scale-on-resize implementation.

- [ ] **Step 2: Run test to verify it fails**
Run `npm.cmd test -- --run src/test/tabletPreview.test.js`; expected failure because `tablet.html` does not exist.

- [ ] **Step 3: Implement `tablet.html`**
Add responsive controls and the iframe. Calculate `min(1, availableWidth / viewportWidth, availableHeight / viewportHeight)` with a `ResizeObserver`; keep iframe width/height at logical CSS dimensions and scale its container visually. Rotation swaps the selected dimensions.

- [ ] **Step 4: Run targeted test and browser verification**
Run the targeted test. Open `/tablet.html` in the review browser; exercise presets, rotation, and resizing and check console errors.

- [ ] **Step 5: Run regression verification**
Run `npm.cmd test -- --run` and `npm.cmd run build`; both must pass. Do not commit unless requested.
