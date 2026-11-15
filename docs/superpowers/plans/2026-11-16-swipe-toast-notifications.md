# Swipeable Toast Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable horizontal swipe/drag-to-dismiss in both directions on toast notifications.

**Architecture:** Create `ToastBanner` in `src/components/Common/ToastBanner.jsx` handling pointer tracking, swipe threshold, and `onDismiss`. Integrate into `src/App.jsx` and other notification containers.

**Tech Stack:** React 18, Tailwind CSS, Lucide icons, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-16-swipe-toast-notifications.md`

## Global Constraints
- Support both horizontal directions (left or right).
- 60px swipe threshold triggers dismiss; lesser displacement resets position.
- Retain existing icons, colors, and 3200ms auto-dismiss behavior if not swiped.
- Native pointer events only; zero external swipe libraries.

## Review Focus
- Touch cancel or rapid multi-pointer input resets cleanly without leaving toast offset.
- Dragging < 60px returns toast to original position (`translateX(0)`).
- Swiping >= 60px to the left triggers `onDismiss`.
- Swiping >= 60px to the right triggers `onDismiss`.
- Auto-dismiss timer still functions if user does not interact.

---

### Task 1: Create `ToastBanner` Component with Tests

**Files:**
- Create: `src/components/Common/ToastBanner.jsx`
- Test: `src/components/Common/ToastBanner.test.jsx`

**Interfaces:**
- Props:
  - `toast: { message: string, type?: 'success' | 'error' | 'info' }`
  - `onDismiss: () => void`
  - `className?: string`

- [ ] **Step 1: Write failing test in `src/components/Common/ToastBanner.test.jsx`**
Test rendering, swipe right >= 60px calls `onDismiss`, swipe left <= -60px calls `onDismiss`, and drag < 60px snaps back without calling `onDismiss`.

- [ ] **Step 2: Run test to verify it fails**
Run: `npm.cmd test -- --run src/components/Common/ToastBanner.test.jsx`
Expected: FAIL (file not found).

- [ ] **Step 3: Implement `ToastBanner` in `src/components/Common/ToastBanner.jsx`**
Implement pointer event listeners, deltaX state/ref, transform styles, and threshold dismissal.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm.cmd test -- --run src/components/Common/ToastBanner.test.jsx`
Expected: PASS.

---

### Task 2: Integrate `ToastBanner` into `App.jsx`

**Files:**
- Modify: `src/App.jsx`
- Test: `src/App.test.jsx`

- [ ] **Step 1: Update `src/App.jsx` to render `ToastBanner`**
Replace raw toast div with `<ToastBanner toast={toast} onDismiss={() => setToast(null)} />` and for `leftToast` if applicable.

- [ ] **Step 2: Run App tests to verify regression safety**
Run: `npm.cmd test -- --run src/App.test.jsx`
Expected: PASS.

---

### Task 3: Full Suite Verification & Build

- [ ] **Step 1: Run full test suite**
Run: `npm.cmd test -- --run`
Expected: All tests pass.

- [ ] **Step 2: Run production build**
Run: `npm.cmd run build`
Expected: Build succeeds.
