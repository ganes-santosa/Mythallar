# Crop Box Vertical Size Adjustment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 3-way crop mode switcher (3:4, 1:1, Custom) with symmetric vertical edge drag handles in Custom mode bounded between 210px (1:1) and 280px (3:4) on a fixed 210px width.

**Architecture:** Extend `ImageCropModal.jsx` with a `cropMode` state (`'3:4' | '1:1' | 'custom'`) and dynamic `cropH` state initialized to 280px (clamped to `[210, 280]`). Add top and bottom drag handles rendered only when `cropMode === 'custom'`, handling pointer events with `stopPropagation` to avoid panning interference and scaling height symmetrically from center. Update `clampPan`, `coverScale`, and canvas generation to use dynamic `cropH`.

**Tech Stack:** React 18, Tailwind CSS, Lucide icons (`MoveVertical` / grips), Vitest, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-18-crop-box-height-adjustment-design.md`

## Global Constraints
- Narrowest ratio: 3:4 (`cropW = 210`, `cropH = 280`).
- Widest ratio: 1:1 (`cropW = 210`, `cropH = 210`).
- No landscape / wider than 1:1: `cropH` strictly clamped to `[210, 280]`.
- Fixed width: `cropW = 210px` across all modes.
- Dragging handles must not initiate image pan (`stopPropagation`).
- Keep all commits local on `master` with `[skip ci]`.

## Review Focus
- Switching from `Custom` to `3:4` or `1:1` snaps `cropH` to 280px or 210px respectively and hides drag handles.
- Panning the image does not interfere with dragging the vertical handles, and vice versa.
- Extreme handle drag beyond 280px or below 210px stops cleanly without jumping.
- Zoom cover calculations ensure no black borders at any intermediate height between 210px and 280px.
- Canvas output aspect ratio matches current custom `cropH / 210` framing accurately.

---

### Task 1: 3-Way Ratio Switcher & Dynamic Height State

**Files:**
- Modify: `src/components/Modal/ImageCropModal.jsx`
- Test: `src/components/Modal/ImageCropModal.test.jsx`

**Interfaces:**
- Consumes: `ImageCropModal` props (`isOpen`, `imageSrc`, `onClose`, `onApplyCrop`).
- Produces: 3-way toggle buttons (`3:4 Portrait`, `1:1 Square`, `Custom`), `cropMode` and `cropH` state.

- [ ] **Step 1: Write failing test in `ImageCropModal.test.jsx` for 3-way toggle and Custom mode selection**
  - Verify `3:4 Portrait`, `1:1 Square`, and `Custom` buttons render.
  - Verify clicking `1:1 Square` sets framing guide height to 210px.
  - Verify clicking `3:4 Portrait` sets framing guide height to 280px.
  - Verify clicking `Custom` keeps framing guide height within `[210, 280]` and highlights Custom button.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npm.cmd test -- --run src/components/Modal/ImageCropModal.test.jsx`
  Expected: FAIL (Custom button not found)

- [ ] **Step 3: Implement 3-way switcher and dynamic `cropH` state in `ImageCropModal.jsx`**
  - Set `cropW = 210`.
  - State: `cropMode` (`'3:4' | '1:1' | 'custom'`), default `'3:4'`.
  - State: `cropH`, default `280`.
  - In toolbar, render 3 buttons: `3:4 Portrait`, `1:1 Square`, and `Custom`.
  - On `3:4` click: `setCropMode('3:4'); setCropH(280);`
  - On `1:1` click: `setCropMode('1:1'); setCropH(210);`
  - On `Custom` click: `setCropMode('custom');`

- [ ] **Step 4: Run test to verify it passes**
  Run: `npm.cmd test -- --run src/components/Modal/ImageCropModal.test.jsx`
  Expected: PASS

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add src/components/Modal/ImageCropModal.jsx src/components/Modal/ImageCropModal.test.jsx
  git commit -m "feat(crop): add 3-way ratio switcher and dynamic height state [skip ci]"
  ```

---

### Task 2: Symmetric Drag Handles in Custom Mode

**Files:**
- Modify: `src/components/Modal/ImageCropModal.jsx`
- Test: `src/components/Modal/ImageCropModal.test.jsx`

**Interfaces:**
- Consumes: `cropMode`, `cropH`, `setCropH` from Task 1.
- Produces: Top and bottom drag handle elements with `cursor-ns-resize`, symmetric height adjustment clamped to `[210, 280]`, isolated from pan pointer events.

- [ ] **Step 1: Write failing test in `ImageCropModal.test.jsx` for drag handles**
  - Verify handles are not rendered in `3:4` or `1:1` modes.
  - Verify top and bottom handles (`aria-label="Adjust top crop boundary"`, `aria-label="Adjust bottom crop boundary"`) render when `Custom` is active.
  - Simulate vertical pointer drag on bottom handle and verify `cropH` changes symmetrically within `[210, 280]`.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npm.cmd test -- --run src/components/Modal/ImageCropModal.test.jsx`
  Expected: FAIL (handles not found in document)

- [ ] **Step 3: Implement symmetric drag handles and pointer listeners in `ImageCropModal.jsx`**
  - Only render handles when `cropMode === 'custom'`.
  - Render top grip pill (`absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 flex items-center justify-center cursor-ns-resize z-30`).
  - Render bottom grip pill (`absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-6 flex items-center justify-center cursor-ns-resize z-30`).
  - Add pointerDown/Move/Up handlers on the handles with `e.stopPropagation()` and pointer capture.
  - On pointerMove: calculate `deltaY = e.clientY - dragStartY`. For bottom handle, symmetric height is `startH + deltaY * 2`. For top handle, symmetric height is `startH - deltaY * 2`. Clamp to `[210, 280]`.
  - Update `clampPan` and image pan so pan stays within bounded edges as height changes.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npm.cmd test -- --run src/components/Modal/ImageCropModal.test.jsx`
  Expected: PASS

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add src/components/Modal/ImageCropModal.jsx src/components/Modal/ImageCropModal.test.jsx
  git commit -m "feat(crop): add symmetric vertical drag handles in custom mode [skip ci]"
  ```

---

### Task 3: Canvas Export Adaptations & End-to-End Verification

**Files:**
- Modify: `src/components/Modal/ImageCropModal.jsx`
- Test: `src/components/Modal/ImageCropModal.test.jsx`

**Interfaces:**
- Consumes: Dynamic `cropH` and `cropW` (210) from Task 1 & 2.
- Produces: Correct canvas aspect ratio export `384` x `Math.round(384 * (cropH / 210))` in `handleApply`.

- [ ] **Step 1: Write test in `ImageCropModal.test.jsx` verifying canvas export dimensions with custom crop height**
  - In Custom mode with adjusted `cropH` (e.g. 245), trigger `handleApplyCrop`.
  - Verify canvas dimensions set to `targetW = 384` and `targetH = Math.round(384 * (245 / 210)) = 448`.

- [ ] **Step 2: Run test to verify it fails or passes**
  Run: `npm.cmd test -- --run src/components/Modal/ImageCropModal.test.jsx`

- [ ] **Step 3: Update `handleApply` in `ImageCropModal.jsx` to dynamically size canvas output**
  - Calculate `targetW = 384` and `targetH = Math.round(384 * (cropH / cropBoxW))`.
  - Set canvas width/height accordingly and compute source scaling based on `cropBoxW` and `cropH`.

- [ ] **Step 4: Run full test suite and production build**
  Run: `npm.cmd test -- --run`
  Run: `npm.cmd run build`
  Expected: PASS (all 64 test suites pass, build succeeds)

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add src/components/Modal/ImageCropModal.jsx src/components/Modal/ImageCropModal.test.jsx
  git commit -m "feat(crop): dynamically scale canvas export to custom crop height [skip ci]"
  ```
