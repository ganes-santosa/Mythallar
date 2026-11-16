# Character Features Accordion Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure `ResourcesCard` into a cohesive `Character Features` accordion layout (Top Detail Viewer Drawer -> Feats -> Tracked Resources -> Freeform Notes) and attach auto-scroll hooks to the top drawer to prevent viewport shifts on expand/collapse.

**Architecture:** Update `CharacterSheetView.jsx` to name the section "Character Features". In `ResourcesCard.jsx`, place the unified `ResourceDetailViewer` at the top with `useAutoScrollOnExpand`, followed by Feats (header + tag chips), Tracked Resources (header + stepper cards), and Freeform Notes (textarea).

**Tech Stack:** React 18, Tailwind CSS, Lucide icons, Vitest, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-16-character-features-accordion-restructure.md`

## Global Constraints
- Minimal Nested Elements & Zero Outlines Rule: never add outline borders (`border`, `border-white/*`) on inner blocks, cards, or inputs; use background contrast and `shadow-sm`.
- Capitalization Hierarchy: headers and action buttons strictly Title Case; standard 5e initialisms (HP, AC, LR, SR, etc.) uppercase.
- Two-click confirmations for destructive actions via `useTwoClickConfirm`.
- Preserve CRLF line endings.

## Review Focus
1. Layout order: Top Detail Viewer Drawer -> Feats section -> Tracked Resources section -> Freeform Notes section.
2. Auto-scroll anchoring: Opening the unified detail viewer drawer invokes `useAutoScrollOnExpand` to keep viewport stable.
3. Add Resource button: Header action `Add Resource` triggers inline resource form inside the Tracked Resources subdivision.
4. Feat and Resource editing: In-place edit forms expand in their respective subdivisions.
5. Regression safety: All 57 test files continue passing.

---

### Task 1: Rename Accordion to "Character Features"

**Files:**
- Modify: `src/components/CharacterSheet/CharacterSheetView.jsx:316-320`
- Test: `src/components/CharacterSheet/CharacterSheetView.test.jsx`

- [ ] **Step 1: Write test in `CharacterSheetView.test.jsx`**
Add assertion verifying `Character Features` accordion header is present.

- [ ] **Step 2: Run test to verify failure**
Run: `npm.cmd test -- --run src/components/CharacterSheet/CharacterSheetView.test.jsx`
Expected: FAIL

- [ ] **Step 3: Update `CharacterSheetView.jsx`**
Change `title="Features & Tracked Resources"` to `title="Character Features"`.

- [ ] **Step 4: Run test to verify pass**
Run: `npm.cmd test -- --run src/components/CharacterSheet/CharacterSheetView.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/components/CharacterSheet/CharacterSheetView.jsx src/components/CharacterSheet/CharacterSheetView.test.jsx
git commit -m "feat: rename accordion to Character Features"
```

---

### Task 2: Subdivide ResourcesCard into Top Viewer -> Feats -> Tracked Resources -> Notes with Auto-Scroll

**Files:**
- Modify: `src/components/CharacterSheet/ResourcesCard.jsx`
- Test: `src/components/CharacterSheet/ResourcesCard.test.jsx`

- [ ] **Step 1: Write failing test in `ResourcesCard.test.jsx`**
Verify subdivision DOM ordering (Top Viewer -> Feats -> Tracked Resources -> Freeform Notes), subdivision headers ("Feats", "Tracked Resources", "Features & Freeform Notes"), and auto-scroll ref attached to `resource-viewer-wrapper`.

- [ ] **Step 2: Run test to verify failure**
Run: `npm.cmd test -- --run src/components/CharacterSheet/ResourcesCard.test.jsx`
Expected: FAIL

- [ ] **Step 3: Update `ResourcesCard.jsx` structure and viewer ref**
1. Add `viewerRef = useAutoScrollOnExpand(Boolean(shouldRenderViewer && activeViewerItem))` and pass to `ResourceDetailViewer`.
2. Structure render body:
   - Unified `ResourceDetailViewer` at top with `viewerRef`.
   - Feats Subdivision (Header `Feats:`, `+ Add`, `FeatForm` when adding/editing feat, tag chips container).
   - Tracked Resources Subdivision (Header `Tracked Resources:`, `Reset`, `+ Add Tracked Resource`, `ResourceForm` when adding/editing resource, steppers grid).
   - Freeform Notes Subdivision (Header `Features & Freeform Notes`, textarea).

- [ ] **Step 4: Run test to verify pass**
Run: `npm.cmd test -- --run src/components/CharacterSheet/ResourcesCard.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/components/CharacterSheet/ResourcesCard.jsx src/components/CharacterSheet/ResourcesCard.test.jsx
git commit -m "feat: restructure Character Features subdivisions with auto-scroll viewer drawer"
```

---

### Task 3: Full Test Suite & Visual Verification

**Files:**
- Verify: full test suite and production build

- [ ] **Step 1: Run full test suite**
Run: `npm.cmd test -- --run`
Expected: All 57 test files, 514+ tests PASS.

- [ ] **Step 2: Run production build**
Run: `npm.cmd run build`
Expected: Clean build with exit code 0.

- [ ] **Step 3: Visual check in live browser session**
Verify visual appearance and smooth expansion in live browser tab.
