# Two-Click Confirmation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Standardize compact two-click confirmation for every delete action and character creation plus action.

**Architecture:** Add one shared `useTwoClickConfirm` hook with 3-second reset. Use local button styling and callback wrappers at each existing action site. Remove old inline and modal confirmation state; preserve existing callbacks and modal lifecycle.

**Tech Stack:** React, Vitest, Testing Library, Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-10-27-two-click-confirmations-design.md`

## Global Constraints

- First delete click arms action; second click executes deletion.
- Armed delete state uses compact fixed-width red styling.
- Armed state resets after exactly 3 seconds.
- Character creation plus arms green, then creates on second click.
- No expanding inline confirmation or popup for these actions.
- Preserve accessibility labels and existing callbacks.

## Review Focus

- Repeated clicks: first click must not invoke destructive/create callback; second click invokes exactly once; test in hook/component tests.
- Timer expiry: armed state returns to original after 3 seconds; test with fake timers in hook/component tests.
- Multiple rows: arming one delete button must not arm another; test in CharacterManagerModal and SpellCard coverage.
- Modal lifecycle: modal delete remains open after first click and closes only under existing behavior; test CharacterManagerModal.
- Keyboard/accessibility: labels expose armed instruction and icon buttons remain keyboard-activatable; test rendered labels in changed component tests.

---

### Task 1: Shared confirmation hook

**Files:**
- Create: `src/hooks/useTwoClickConfirm.js`
- Test: `src/hooks/useTwoClickConfirm.test.js`

**Interfaces:**
- Produces `useTwoClickConfirm(action, timeoutMs = 3000)` returning `{ armed, handleClick, reset }`.
- `handleClick()` arms on first call and invokes `action` plus resets on second call.
- Hook clears timer on dismount and reset.

- [ ] Write failing tests for first click, second click, 3-second reset, reset cleanup, and callback replacement.
- [ ] Run `npm.cmd test -- --run src/hooks/useTwoClickConfirm.test.js`; confirm failure because hook is absent.
- [ ] Implement minimum hook with `useState`, `useEffect`, and `useCallback`; no dependency additions.
- [ ] Rerun focused hook test; confirm pass.

### Task 2: Standardize SpellCard homebrew delete

**Files:**
- Modify: `src/components/Catalog/SpellCard.jsx`
- Test: `src/components/Catalog/SpellCard.test.jsx`

**Interfaces:**
- Consume `useTwoClickConfirm` with `onDeleteHomebrew` and 3000ms.
- Keep non-homebrew cards unchanged.

- [ ] Add failing tests proving first click arms without callback, armed button has red styling/label, second click deletes, and timer restores original state.
- [ ] Run focused SpellCard tests and verify failure.
- [ ] Replace `showDeleteConfirm` expansion with hook state and compact button.
- [ ] Run focused SpellCard tests and verify pass.

### Task 3: Character manager modal actions

**Files:**
- Modify: `src/components/Header/CharacterManagerModal.jsx`
- Test: `src/components/Header/CharacterManagerModal.test.jsx`

**Interfaces:**
- Each character delete button owns independent `useTwoClickConfirm` state through row rendering or stable child component.
- New Character button in modal follows green two-click behavior if retained.
- Remove `deleteConfirmId`, `showCreateConfirm`, `ShieldAlert`, and obsolete popup markup.

- [ ] Add failing tests for independent row delete arming, second-click deletion, 3-second reset, and no expanding `Delete` control.
- [ ] Add failing tests for modal New Character green first-click state and second-click creation.
- [ ] Run focused tests and verify failure.
- [ ] Implement compact red delete buttons and green create button using shared hook.
- [ ] Run focused tests and verify pass.

### Task 4: Profile selector plus action

**Files:**
- Modify: `src/components/Header/ProfileSelector.jsx`
- Test: `src/components/Header/ProfileSelector.test.jsx` (create if needed).

**Interfaces:**
- `New Character` plus button consumes `useTwoClickConfirm(onCreateProfile, 3000)`.
- First click uses green armed styling and armed accessible label.
- Second click invokes `onCreateProfile`; remove `showConfirm` and popup markup.

- [ ] Add failing tests for green armed state, second-click creation, 3-second reset, and no dialog.
- [ ] Run focused test and verify failure.
- [ ] Implement hook-backed plus button.
- [ ] Run focused test and verify pass.

### Task 5: Audit remaining delete controls

**Files:**
- Modify: every remaining component containing delete action, likely `src/components/Catalog/SpellCard.jsx`, `src/components/Header/CharacterManagerModal.jsx`, and any additional search results.
- Test: corresponding existing test files.

- [ ] Search `src` for `Trash2`, `Delete`, `onDelete`, `onRemove`, and delete labels; list each user-facing destructive button.
- [ ] Add failing coverage for any missed delete button.
- [ ] Convert each missed delete button to shared compact two-click behavior, preserving special non-delete controls.
- [ ] Run focused tests for every touched component.

### Task 6: Full verification

**Files:** None.

- [ ] Run `npm.cmd test -- --run`.
- [ ] Run `npm.cmd run build`.
- [ ] Review diff for leftover popup/expanding confirmation state, stale imports, and timeout values other than 3000 for these actions.
- [ ] Run `git diff --check`.
