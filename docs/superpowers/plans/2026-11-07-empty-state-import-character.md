# Empty State Import Character Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a secondary "Import Character" button to the "No Character Selected" empty state in `App.jsx` allowing direct JSON import when no character exists.

**Architecture:** Wire a hidden file input with a secondary styled button in the empty state block of `src/App.jsx`. On file change, read JSON contents via `FileReader` and delegate to existing `handleImport` handler.

**Tech Stack:** React 18, Tailwind CSS, Lucide React (`Upload`), Vitest, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-07-empty-state-import-character-design.md`

## Global Constraints
- Node path on Windows PowerShell: `$env:Path="C:\Program Files\nodejs;"+$env:Path`
- Minimal styling without loud borders; use `bg-dnd-card hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-white/5`
- Must preserve existing tests and pass `npm.cmd test -- --run`

## Review Focus
- Attempting to import non-JSON or corrupted file shows error toast without crash.
- File input value is reset after import so re-selecting same file triggers change event.
- Empty state transitions immediately to the imported character view upon successful import.

---

### Task 1: Add Import Character button to empty state and verify end-to-end

**Files:**
- Modify: `src/App.jsx:1420-1435`
- Test: `src/App.test.jsx`

**Interfaces:**
- Consumes: `handleImport(jsonStr: string)` in `src/App.jsx`
- Produces: Secondary button `Import Character` in empty state with file input ref trigger

- [x] **Step 1: Write the failing tests in `src/App.test.jsx`**
Add tests asserting that:
1. `Import Character` button renders alongside `Create First Character` when storage is empty.
2. Clicking `Import Character` and selecting valid character JSON imports character and displays active character view.

- [x] **Step 2: Run test to verify it fails**
Run: `npm.cmd test -- src/App.test.jsx -t "allows importing a character directly from empty state"`
Expected: FAIL (button not found)

- [x] **Step 3: Implement Import Character button and file handler in `src/App.jsx`**
1. Add `Upload` import from `lucide-react`.
2. Add `emptyStateFileInputRef` ref and `handleEmptyStateFileChange` handler in `App.jsx`.
3. Wrap action buttons in `flex items-center gap-3`.
4. Render secondary button with `Upload` icon and hidden file input.

- [x] **Step 4: Run test to verify it passes**
Run: `npm.cmd test -- src/App.test.jsx`
Expected: PASS

- [x] **Step 5: Run full test suite to ensure no regressions**
Run: `npm.cmd test -- --run`
Expected: 42 test files passing
