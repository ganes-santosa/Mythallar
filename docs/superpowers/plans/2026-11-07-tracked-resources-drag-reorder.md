# Tracked Resources Drag-and-Drop Reordering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to rearrange tracked resources via drag-and-drop in `ResourcesCard` while in the editing state.

**Architecture:** Use HTML5 drag-and-drop API on tracked resource card containers in `ResourcesCard.jsx` when `isEditing` is true. Include a visual grip handle (`GripVertical`), drag styling (opacity + ring on drag target), and call `onUpdateResources` with reordered array on drop.

**Tech Stack:** React 18, Tailwind CSS, Lucide icons (`GripVertical`, `X`), Vitest + React Testing Library.

**Spec:** Direct user request: "In features and tracked resource make user able to rearrange the tracked resources by dragging in the editting state".

## Global Constraints
- Only allow drag reordering when `isEditing === true`.
- Zero outline borders on inner cards by default (`bg-dnd-card`, `shadow-sm`, ring only as temporary drop indicator).
- Preserve existing resource properties (`id`, `name`, `current`, `max`, `resetOn`, `note`).
- All existing tests in `ResourcesCard.test.jsx` and full suite must pass.

## Review Focus
1. Dragging item onto itself should not corrupt order or trigger redundant state change.
2. Drag state (`draggedId`, `dragOverId`) cleanly resets on `onDragEnd` even if dropped outside target.
3. Stepper buttons (`+`, `-`) and delete button (`X`) must not trigger dragging.

---

### Task 1: Add Drag-and-Drop Reordering to ResourcesCard

**Files:**
- Modify: `src/components/CharacterSheet/ResourcesCard.jsx`
- Test: `src/components/CharacterSheet/ResourcesCard.test.jsx`

**Interfaces:**
- Consumes: `trackedResources`, `isEditing`, `onUpdateResources`
- Produces: `onUpdateResources(reorderedArray)` when drop occurs on a different resource item.

- [ ] **Step 1: Write failing tests in `src/components/CharacterSheet/ResourcesCard.test.jsx`**
  - Test: renders drag handle (`GripVertical`) and `draggable="true"` attribute only when `isEditing` is true.
  - Test: reorders resources on dragStart, dragOver, and drop onto another resource, calling `onUpdateResources` with the new array order.
  - Test: does not change order or call `onUpdateResources` when dropped onto itself.

- [ ] **Step 2: Run test to verify it fails**
  - Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/CharacterSheet/ResourcesCard.test.jsx --run`
  - Expected: FAIL

- [ ] **Step 3: Implement drag-and-drop in `src/components/CharacterSheet/ResourcesCard.jsx`**
  - Import `GripVertical` from `lucide-react`.
  - Add state `draggedResId` and `dragOverResId`.
  - When `isEditing` is true, add `draggable={isEditing}`, `onDragStart`, `onDragOver`, `onDragEnter`, `onDragLeave`, `onDrop`, `onDragEnd` to resource container.
  - Render `<GripVertical size={12} className="text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing mr-1 shrink-0" />` on the left when `isEditing` is true.
  - On drop, splice and move dragged item to target index and call `onUpdateResources(reordered)`.
  - Clear drag state.

- [ ] **Step 4: Run test to verify it passes**
  - Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/CharacterSheet/ResourcesCard.test.jsx --run`
  - Expected: PASS

- [ ] **Step 5: Verify full test suite and build**
  - Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- --run`
  - Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd run build`
