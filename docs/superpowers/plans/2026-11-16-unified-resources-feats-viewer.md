# Unified Resources & Feats Viewer with Tag Chips Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate Tracked Resources and Feats detail viewers into a single top drawer, swap vertical order so Feats precede Freeform Notes, and style Feats as compact flex-wrap tag chips.

**Architecture:**
- Single unified viewer drawer (`UnifiedDetailViewer`) mounted below the Add Resource form and above the Tracked Resources grid.
- Feat chips and Tracked Resource cards both target the unified viewer state (`viewingItemId`, `viewingItemType`).
- Active feats (e.g. *Lucky*) share the exact same viewer state whether opened from the resource card or the feat chip.
- Feats section moved above the Freeform Notes textarea, rendering feats as `flex flex-wrap gap-1.5` tag chips.
- Feat add / in-place edit form (`FeatForm`) remains positioned directly above the tag chips in the Feats subdivision.

**Tech Stack:** React 18, Tailwind CSS, Lucide icons, Vitest, `@testing-library/react`.

**Spec:** `docs/superpowers/specs/2026-11-16-unified-resources-feats-viewer-design.md`

## Global Constraints
- Minimal Nested Elements & Zero Outlines Rule: No `border` on inner cards, chips, or inputs. Differentiate with `bg-dnd-card` and `shadow-sm`.
- Capitalization Hierarchy: Title Case on headers, badges, labels, and action buttons. Standard 5e initialisms (HP, AC, DEX, STR, CON, INT, WIS, CHA, LR, SR) remain uppercase.
- Two-Click Confirmation for delete actions via `useTwoClickConfirm`.
- Files use CRLF line endings.
- All existing tests in the suite must pass (57 test files, 512 tests).

## Review Focus
1. Clicking an active feat (e.g. *Lucky*) from either its feat chip or its tracked resource card opens the same unified viewer without desync or duplicate drawers.
2. Passive feats (e.g. *Alert*, *Tough*) open in the unified top drawer and display their stat modifier badge, notes/description, edit button, and delete button.
3. DOM order check: Feats section appears before the Freeform Notes textarea.
4. Feat chips wrap cleanly as lightweight inline pill tags (`flex flex-wrap gap-1.5`).
5. Closing the unified viewer clears both resource and feat selection cleanly.

---

### Task 1: Unify Viewer State and Component in `ResourcesCard.jsx`

**Files:**
- Modify: `src/components/CharacterSheet/ResourcesCard.jsx`
- Test: `src/components/CharacterSheet/ResourcesCard.test.jsx`

**Interfaces:**
- `UnifiedDetailViewer`: Combines `ResourceDetailViewer` and `FeatDetailViewer` into a single animated drawer at the top.
- State: `viewingId`, `viewingType` ('resource' | 'feat').
  - When opening a resource linked to a feat: sets viewer to show resource steppers, reset timing, plus feat's stat badge and description.
  - When clicking an active feat linked to a resource: activates the same resource entry in the viewer.
  - When clicking a passive feat: activates the feat entry in the viewer.

- [ ] **Step 1: Write tests for unified viewer behavior**
In `src/components/CharacterSheet/ResourcesCard.test.jsx`:
- Test that clicking an active feat chip (e.g. Lucky) opens the same viewer as clicking the tracked resource card with both counters and feat description.
- Test that clicking a passive feat chip opens the unified top viewer.
- Test that editing and deleting work smoothly from the unified top viewer.

- [ ] **Step 2: Run tests to verify failure**
Run: `npm.cmd test -- --run src/components/CharacterSheet/ResourcesCard.test.jsx`
Expected: FAIL on the new assertions.

- [ ] **Step 3: Refactor viewer state and implement `UnifiedDetailViewer`**
In `src/components/CharacterSheet/ResourcesCard.jsx`:
- Consolidate `FeatDetailViewer` into `UnifiedDetailViewer` (or upgrade `ResourceDetailViewer` to support feat and linked feat viewing).
- Render only ONE viewer drawer at the top (below Add Resource drawer, above Tracked Resources grid).
- Ensure testids `resource-viewer-card` and `feat-viewer-card` are appropriately provided so existing and new tests pass.

- [ ] **Step 4: Run tests to verify pass**
Run: `npm.cmd test -- --run src/components/CharacterSheet/ResourcesCard.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/components/CharacterSheet/ResourcesCard.jsx src/components/CharacterSheet/ResourcesCard.test.jsx
git commit -m "refactor: unify tracked resources and feats detail viewer into single top drawer"
```

---

### Task 2: Reorder Sections and Convert Feats to Flex-Wrap Tag Chips

**Files:**
- Modify: `src/components/CharacterSheet/ResourcesCard.jsx`
- Test: `src/components/CharacterSheet/ResourcesCard.test.jsx`

**Interfaces:**
- Subdivision layout: Feats section placed before Freeform Notes.
- Feats container: `<div className="flex flex-wrap gap-1.5 pt-0.5">`.
- Feat chip styling: Compact pill badge with `Award` icon, name, stat modifier badge, subtle `Link2` icon if linked to a tracked resource, and hover/active states.

- [ ] **Step 1: Write test for layout order and tag chip structure**
In `src/components/CharacterSheet/ResourcesCard.test.jsx`:
- Test that Feats subdivision elements precede the Freeform Notes textarea in DOM hierarchy.
- Test that feat chips render within a flex-wrap container without grid classes.

- [ ] **Step 2: Run test to verify failure**
Run: `npm.cmd test -- --run src/components/CharacterSheet/ResourcesCard.test.jsx`
Expected: FAIL on ordering/class assertions.

- [ ] **Step 3: Move Feats above Freeform Notes and style as tag chips**
In `src/components/CharacterSheet/ResourcesCard.jsx`:
- Move Feats subdivision block above Freeform Notes.
- Replace `grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3` with `flex flex-wrap gap-1.5`.
- Refine chip markup for compact tag appearance.

- [ ] **Step 4: Run tests to verify pass**
Run: `npm.cmd test -- --run src/components/CharacterSheet/ResourcesCard.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/components/CharacterSheet/ResourcesCard.jsx src/components/CharacterSheet/ResourcesCard.test.jsx
git commit -m "feat: reorder feats above freeform notes and style feats as tag chips"
```

---

### Task 3: Full Regression Suite & Verification

**Files:**
- Verify: Full test suite and production build

- [ ] **Step 1: Run full test suite**
Run: `npm.cmd test -- --run`
Expected: All 57 test files, 512+ tests PASS.

- [ ] **Step 2: Run production build**
Run: `npm.cmd run build`
Expected: Clean build with zero errors.

- [ ] **Step 3: Verification in browser preview**
Inspect mobile and tablet preview harnesses to confirm visually clean tag chip layout and unified viewer operation.
