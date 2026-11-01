# Click-to-Edit Current HP & Temp HP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable click-to-edit inline editing for Current HP and Temp HP directly in the hero card in normal view, while keeping Max HP editable only in the section editing state.

**Architecture:** Add local inline edit state (`isEditingCurrentHp`, `isEditingTempHp`) to `VitalsCard.jsx`. When clicked, render lightweight numeric inputs that commit on blur or Enter, cancel on Escape, clamp to >= 0, and match hero card typography.

**Tech Stack:** React 18, Tailwind CSS, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-01-click-to-edit-hp.md`

## Global Constraints

- Current HP and Temp HP are click-to-edit in normal view (`!isEditing`).
- Max HP (`effectiveMax`) remains read-only in normal view; edited only in section edit mode.
- Blur or Enter commits the value; Escape reverts.
- Values clamp to minimum 0.
- Typography and layout remain stable without layout shift.
- Standard 5e initialisms and Title Case conventions preserved.
- CRLF line endings.

## Review Focus

- Clicking Current HP opens input with initial value, blur/Enter saves, Escape cancels.
- Clicking Temp HP opens input with initial value, blur/Enter saves, Escape cancels.
- Max HP cannot be clicked or edited in normal view.
- Entering section edit mode continues to display all 4 full configuration inputs as before.
- All existing Vitest tests continue to pass.

---

### Task 1: Add Click-to-Edit Tests in `VitalsCard.test.jsx`

**Files:**
- Modify: `src/components/CharacterSheet/VitalsCard.test.jsx`

- [ ] **Step 1: Write test for Current HP click-to-edit**
  - Render `VitalsCard` with `hpCurrent: 45`.
  - Click Current HP element (`aria-label="Edit Current HP"` or text `45`).
  - Expect input `aria-label="Current HP"` to appear with value `45`.
  - Change to `38`, press Enter or blur, expect `onUpdateVitals` called with `{ hpCurrent: 38 }`.
  - Press Escape on another edit, expect cancel without update.

- [ ] **Step 2: Write test for Temp HP click-to-edit**
  - Render `VitalsCard` with `hpTemp: 10`.
  - Click Temp HP element (`aria-label="Edit Temp HP"` or text `10`).
  - Expect input `aria-label="Temp HP"` to appear with value `10`.
  - Change to `15`, blur, expect `onUpdateVitals` called with `{ hpTemp: 15 }`.

- [ ] **Step 3: Run test to verify it fails**
  Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx --run`
  Expected: FAIL because click-to-edit inputs don't exist in normal view yet.

---

### Task 2: Implement Click-to-Edit in `VitalsCard.jsx`

**Files:**
- Modify: `src/components/CharacterSheet/VitalsCard.jsx`

- [ ] **Step 1: Add inline editing states**
  - `isEditingCurrentHp`, `currentHpDraft`
  - `isEditingTempHp`, `tempHpDraft`
  - Handlers for commit/cancel on Enter/Escape/Blur.

- [ ] **Step 2: Render click-to-edit Current HP**
  - If `isEditingCurrentHp`: render numeric input styled to match 24px bold typography (`w-14 text-2xl font-black bg-dnd-panel rounded px-1 text-slate-100 outline-none border border-dnd-gold/60`).
  - Else: render button/clickable element with `cursor-pointer hover:text-dnd-gold transition-colors` and `aria-label="Edit Current HP"`.

- [ ] **Step 3: Render click-to-edit Temp HP**
  - If `isEditingTempHp`: render numeric input styled to match 18px bold typography (`w-12 text-lg font-bold bg-dnd-panel rounded px-1 text-blue-300 outline-none border border-blue-400/60`).
  - Else: render button/clickable element with `cursor-pointer hover:text-blue-200 transition-colors` and `aria-label="Edit Temp HP"`.

- [ ] **Step 4: Run test to verify it passes**
  Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx --run`
  Expected: PASS

---

### Task 3: Full Suite Verification & Handoff

**Files:**
- Modify: `HANDOFF.md`

- [ ] **Step 1: Run full test suite**
  Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- --run`
  Expected: 37 test files, all tests passing.

- [ ] **Step 2: Run production build**
  Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd run build`
  Expected: Clean build with exit code 0.

- [ ] **Step 3: Update `HANDOFF.md`**
  Record click-to-edit Current HP & Temp HP in `HANDOFF.md`.
