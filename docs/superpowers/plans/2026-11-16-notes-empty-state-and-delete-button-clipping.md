# Notes Empty State & Delete Button Clipping Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow characters to have zero notes, display a clean plain text "No Notes" empty state, default new characters to 0 notes, and fix outline clipping on the armed delete button.

**Architecture:** Update `createDefaultSheet` in `storage.js` to default `notes: []`. Update `normalizeNotes` and delete handler in `NotesCard.jsx` to support empty notes array and show "No Notes" empty state. Add breathing padding around the delete button in `NotesCard.jsx` editor header so the 1px armed ring is never clipped.

**Tech Stack:** React 18, Tailwind CSS, Lucide icons, Vitest, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-16-notes-empty-state-and-delete-button-clipping.md`

## Global Constraints
- Minimal nested elements & zero outlines rule (no border-based outlines).
- Use `useTwoClickConfirm` conventions without changing button size or layout shift.
- Capitalization Hierarchy: Title Case for empty state label ("No Notes").
- Retain existing search filter empty state (`No notes match "${searchQuery}"`).

## Review Focus
- Default new character profile creation creates `sheet.notes` as an empty array `[]`.
- `normalizeNotes([])` returns `[]` instead of injecting a "General" note.
- Deleting the last remaining note clears storage to `[]` and returns cleanly to list view.
- In list view with 0 notes, plain text "No Notes" appears in the list container.
- When searching notes with no match, "No notes match..." appears.
- Armed delete button `ring-1` outline is fully visible without clipping on any edge.

---

### Task 1: Update Default Character Sheet and Storage Tests

**Files:**
- Modify: `src/utils/storage.js`
- Test: `src/utils/storage.test.js`

- [ ] **Step 1: Write/update test in `src/utils/storage.test.js`**
Assert `createDefaultProfile().sheet.notes` is `[]`.

- [ ] **Step 2: Run test to verify it fails**
Run: `npm.cmd test -- --run src/utils/storage.test.js`

- [ ] **Step 3: Update `src/utils/storage.js`**
Change `notes: ''` in `createDefaultSheet` to `notes: []`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm.cmd test -- --run src/utils/storage.test.js`

---

### Task 2: Update `NotesCard` Logic, Empty State, and Clipping Fix

**Files:**
- Modify: `src/components/CharacterSheet/NotesCard.jsx`
- Test: `src/components/CharacterSheet/NotesCard.test.jsx`

- [ ] **Step 1: Write/update tests in `src/components/CharacterSheet/NotesCard.test.jsx`**
Verify:
1. `normalizeNotes([])` returns `[]`.
2. Rendering `NotesCard` with `notes={[]}` displays "No Notes" in list view.
3. Deleting the last remaining note in editor mode deletes it to `[]`, switches view back to list, and displays "No Notes".

- [ ] **Step 2: Run tests to verify failure**
Run: `npm.cmd test -- --run src/components/CharacterSheet/NotesCard.test.jsx`

- [ ] **Step 3: Implement updates in `src/components/CharacterSheet/NotesCard.jsx`**
1. In `normalizeNotes`: return `[]` when `rawNotes` is empty array or empty string.
2. In `handleDeleteActive`: when `remaining.length === 0`, update notes to `[]`, set `activeNoteId` to null, and switch view to `'list'`.
3. In list view render: when `notes.length === 0`, render `<div className="py-8 text-center text-xs text-slate-500 bg-dnd-panel/60 rounded-lg shadow-sm">No Notes</div>`.
4. In editor header toolbar: add `p-1 -m-1` around the button actions container so the armed delete button's `ring-1` is not clipped by `overflow-hidden`.

- [ ] **Step 4: Run tests to verify pass**
Run: `npm.cmd test -- --run src/components/CharacterSheet/NotesCard.test.jsx`

---

### Task 3: Full Suite Verification & Build

- [ ] **Step 1: Run full test suite**
Run: `npm.cmd test -- --run`

- [ ] **Step 2: Run build**
Run: `npm.cmd run build`
