# Features & Tracked Resources Edit Icon and Drag-to-Reorder Hint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize the Features & Tracked Resources edit button icon to `Settings2` and display a subtle greyed instructional reorder hint when editing is active.

**Architecture:** Update `CharacterSheetView.jsx` to render `Settings2` instead of `ArrowLeftRight` with updated labels. In `ResourcesCard.jsx`, render a subtle helper text above tracked resource items when `isEditing` is true. Add/update unit tests to verify the icon, label, and hint text.

**Tech Stack:** React 18, Tailwind CSS, Lucide React (`Settings2`), Vitest, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-15-features-resources-edit-icon-reorder-hint.md`

## Global Constraints
- Minimal nested elements, no borders/outlines on hint text or card containers.
- Zero layout regressions on tablet/mobile screens.
- All existing tests pass.

## Review Focus
- Edit button accessibility (`aria-label="Edit features and resources"`).
- Reorder hint appears only when `isEditing` is true and `trackedResources.length > 0`.
- Reorder hint disappears when `isEditing` is false or when no tracked resources exist.

---

### Task 1: Add Reorder Hint in ResourcesCard

**Files:**
- Modify: `src/components/CharacterSheet/ResourcesCard.jsx`
- Test: `src/components/CharacterSheet/ResourcesCard.test.jsx`

**Interfaces:**
- Consumes: `isEditing: boolean`, `trackedResources: Array`
- Produces: Visual DOM element `<div className="text-[10px] text-slate-500 italic pb-0.5 select-none">Drag items to reorder</div>` rendered when `isEditing && trackedResources?.length > 0` right above the resources grid/list.

- [x] **Step 1: Write the failing test in `ResourcesCard.test.jsx`**
Add test verifying that "Drag items to reorder" appears when `isEditing={true}` with tracked resources, and does not appear when `isEditing={false}`.

- [x] **Step 2: Run test to verify it fails**
Run: `npm.cmd test -- --run src/components/CharacterSheet/ResourcesCard.test.jsx`
Expected: FAIL (hint text not found).

- [x] **Step 3: Implement reorder hint in `ResourcesCard.jsx`**
Add the hint div right above `trackedResources.map(...)` inside `ResourcesCard.jsx`.

- [x] **Step 4: Run test to verify it passes**
Run: `npm.cmd test -- --run src/components/CharacterSheet/ResourcesCard.test.jsx`
Expected: PASS.

---

### Task 2: Standardize Edit Icon and Labels in CharacterSheetView

**Files:**
- Modify: `src/components/CharacterSheet/CharacterSheetView.jsx`
- Test: `src/components/CharacterSheet/CharacterSheetView.test.jsx`

**Interfaces:**
- Consumes: `Settings2` from `lucide-react`
- Produces: Edit button with `aria-label="Edit features and resources"`, `title="Edit features and resources"`, rendering `<Settings2 size={13} />`.

- [x] **Step 1: Write or update the failing test in `CharacterSheetView.test.jsx`**
Update or add test expecting button with `aria-label="Edit features and resources"`.

- [x] **Step 2: Run test to verify it fails**
Run: `npm.cmd test -- --run src/components/CharacterSheet/CharacterSheetView.test.jsx`
Expected: FAIL (button with old label or missing `Settings2`).

- [x] **Step 3: Implement `Settings2` icon and label changes in `CharacterSheetView.jsx`**
Replace `ArrowLeftRight` with `Settings2` and update `aria-label` / `title`.

- [x] **Step 4: Run test to verify it passes**
Run: `npm.cmd test -- --run src/components/CharacterSheet/CharacterSheetView.test.jsx`
Expected: PASS.

- [x] **Step 5: Full suite check and production build**
Run: `npm.cmd test -- --run` and `npm.cmd run build`.
Expected: All tests pass, build succeeds.
