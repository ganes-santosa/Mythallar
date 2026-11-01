# Vitals HP Sub-Containers & Always-Interactive Inputs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign Hit Points display in `VitalsCard.jsx` into two sub-container chips matching the class level chip color (`bg-dnd-panel/60`), placing `/` on the number line between Current and Max, and making Current HP and Temp HP always-interactive inputs.

**Architecture:** Replace the current static/overlay toggle in normal view (`!isEditing`) with two sub-containers:
- Sub-container 1 (`bg-dnd-panel/60 border border-white/5 rounded-md px-2.5 py-1`): contains `Current` and `Max` column headers, with an always-interactive borderless input for Current HP, a `/` separator, and static Max HP number.
- Sub-container 2 (`bg-dnd-panel/60 border border-white/5 rounded-md px-2.5 py-1`): contains `Temp` column header, with an always-interactive borderless input for Temp HP (displays `0` when zero).
- Remove the stray vertical line between Max and Temp.

**Tech Stack:** React 18, Tailwind CSS, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-01-vitals-hp-layout-redesign.md`

## Global Constraints

- Current HP and Temp HP are always-interactive numeric inputs (borderless, transparent, auto-select on focus, commit on blur or Enter or change, clamp `>= 0`).
- Max HP remains static display in normal view; configured only in section edit mode.
- Top labels use Title Case: `Current`, `Max`, `Temp`.
- Slash `/` appears on the number line between Current and Max numbers.
- Sub-containers use `bg-dnd-panel/60 border border-white/5 rounded-md`.
- No stray vertical line between Max and Temp.
- CRLF line endings.

## Review Focus

- Current HP input edits immediately on click without clicking an edit button first.
- Temp HP input edits immediately on click without clicking an edit button first.
- Max HP cannot be focused or edited directly in normal view.
- Temp HP shows `0` when 0.
- Clamping `>= 0` enforced on inputs.
- Full Vitest suite passes without regressions.

---

### Task 1: Update Tests in `VitalsCard.test.jsx`

**Files:**
- Modify: `src/components/CharacterSheet/VitalsCard.test.jsx`

- [ ] **Step 1: Write tests for always-interactive inputs and new sub-container structure**
  - Verify `Current HP` and `Temp HP` inputs are rendered immediately in normal view (`screen.getByLabelText('Current HP')`, `screen.getByLabelText('Temp HP')`).
  - Verify slash `/` is rendered adjacent to Current and Max HP numbers.
  - Verify editing `Current HP` input calls `onUpdateVitals({ ...hpCurrent })`.
  - Verify editing `Temp HP` input calls `onUpdateVitals({ ...hpTemp })`.
  - Verify Temp HP displays `0` when `hpTemp` is 0.
  - Verify negative values clamp to 0.

- [ ] **Step 2: Run test to verify it fails**
  Run: `$env:Path=\"C:\\Program Files\\nodejs;\"+$env:Path; npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx --run`
  Expected: FAIL because current code still requires clicking `Edit Current HP` button to render the input.

---

### Task 2: Implement Layout & Inputs in `VitalsCard.jsx`

**Files:**
- Modify: `src/components/CharacterSheet/VitalsCard.jsx`

- [ ] **Step 1: Simplify state and handlers**
  - Current HP and Temp HP inputs can bind to local draft state synced with `vitals.hpCurrent` and `vitals.hpTemp` (or direct handlers on change/blur).
  - On focus: `(e) => e.target.select()`.
  - On blur / Enter: commit clamped integer `>= 0` via `handleFieldChange`.
  - On Escape: reset draft to current prop value.

- [ ] **Step 2: Render sub-container 1 (Current / Max)**
  - Container: `bg-dnd-panel/60 border border-white/5 rounded-md px-2.5 py-1 flex flex-col justify-between`
  - Header: labels `Current` and `Max` (`text-[8px] text-slate-400 font-semibold`).
  - Values:
    - Input `aria-label="Current HP"`: `w-12 text-center text-2xl font-black text-slate-100 bg-transparent outline-none focus:ring-1 focus:ring-dnd-gold/60 rounded leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`
    - Separator `/`: `text-base text-slate-600 font-bold self-center px-1`
    - Static Max: `text-lg font-bold text-slate-400 self-center`

- [ ] **Step 3: Render sub-container 2 (Temp)**
  - Container: `bg-dnd-panel/60 border border-white/5 rounded-md px-2.5 py-1 flex flex-col justify-between items-center`
  - Header: label `Temp` (`text-[8px] text-blue-400 font-semibold`).
  - Value:
    - Input `aria-label="Temp HP"`: `w-10 text-center text-lg font-bold text-blue-300 bg-transparent outline-none focus:ring-1 focus:ring-blue-400/60 rounded leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`

- [ ] **Step 4: Remove old stray vertical divider line between Max and Temp**

- [ ] **Step 5: Run tests to verify pass**
  Run: `$env:Path=\"C:\\Program Files\\nodejs;\"+$env:Path; npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx --run`
  Expected: PASS

---

### Task 3: Full Suite Verification & Build

**Files:**
- Modify: `HANDOFF.md`

- [ ] **Step 1: Run full test suite**
  Run: `$env:Path=\"C:\\Program Files\\nodejs;\"+$env:Path; npm.cmd test -- --run`
  Expected: 37 test files, all tests passing.

- [ ] **Step 2: Run production build**
  Run: `$env:Path=\"C:\\Program Files\\nodejs;\"+$env:Path; npm.cmd run build`
  Expected: Clean build with exit code 0.

- [ ] **Step 3: Update `HANDOFF.md`**
  Record the new sub-container layout and always-interactive inputs in `HANDOFF.md`.
