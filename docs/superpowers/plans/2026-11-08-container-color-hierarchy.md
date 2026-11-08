# Uniform Container & Nested Subcontainer Color Hierarchy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize background colors for containers and nested subcontainers across Mythallar so every element's background strictly corresponds to its structural hierarchy level (Level 1 Panel: `bg-dnd-panel`, Level 2 Card: `bg-dnd-card`, Level 3 Inset/Subcontainer/Pill: `bg-dnd-panel/70`).

**Architecture:** Replace fragmented background tokens (`bg-dnd-panel`, `bg-dnd-panel/60`, `bg-dnd-panel/80`, `bg-dnd-panel/90`) on Level 3 elements nested inside Level 2 cards with a uniform `bg-dnd-panel/70` utility. Verify that top-level cards and standalone section chips retain `bg-dnd-card`.

**Tech Stack:** React 18, Tailwind CSS 3, Vitest, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-08-container-color-hierarchy-design.md`

## Global Constraints
- Preserve existing overall aesthetic, theme palette, typography, borders, spacing, and component layouts.
- Do not introduce new colors unnecessarily.
- Do not redesign or restructure the interface.
- Determine color strictly by structural hierarchy, not by component type.

## Review Focus
1. `ProficienciesCard` proficiency tag chips: verify they use `bg-dnd-panel/70` instead of solid `bg-dnd-panel`.
2. `ResourcesCard` resource stepper `current / max` counter button: verify it uses `bg-dnd-panel/70` instead of solid `bg-dnd-panel`.
3. `CharacterSheetHeader` metadata fields (Race/Species, Subclass, Class pills, Speed pills): verify view and edit subcontainers use `bg-dnd-panel/70` instead of `bg-dnd-panel/60`.
4. `VitalsCard` inner capsules (HP Current/Max, Temp HP, Treatment capsule, Spellcasting INT chip): verify they use `bg-dnd-panel/70`.
5. Full Vitest test suite (all 42 test files) and production build pass with zero regressions.

---

### Task 1: Standardize Level 3 Elements in CharacterSheetHeader

**Files:**
- Modify: `src/components/CharacterSheet/CharacterSheetHeader.jsx`
- Test: `src/components/CharacterSheet/CharacterSheetHeader.test.jsx`

**Interfaces:**
- Consumes: Tailwind utility `bg-dnd-panel/70`
- Produces: Normalized background colors for Class pills, Race/Species, Subclass, and Speed badges in `CharacterSheetHeader`.

- [ ] **Step 1: Write test checking Level 3 background classes in CharacterSheetHeader**

Add test in `src/components/CharacterSheet/CharacterSheetHeader.test.jsx` verifying that Race/Species subcontainer, class pill, and speed tags have `bg-dnd-panel/70`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- src/components/CharacterSheet/CharacterSheetHeader.test.jsx`
Expected: FAIL on class matcher.

- [ ] **Step 3: Update background classes in CharacterSheetHeader.jsx**

Replace `bg-dnd-panel/60` and `bg-dnd-panel/80` with `bg-dnd-panel/70` on:
- Class display pills (`bg-dnd-panel/60` -> `bg-dnd-panel/70`)
- Add Class button (`bg-dnd-panel/60` -> `bg-dnd-panel/70`)
- Multiclass edit row inputs/selects (`bg-dnd-panel` / `bg-dnd-panel/80` -> `bg-dnd-panel/70`)
- Race/Species display & input (`bg-dnd-panel/60` / `bg-dnd-panel` -> `bg-dnd-panel/70`)
- Subclass display & input (`bg-dnd-panel/60` / `bg-dnd-panel` -> `bg-dnd-panel/70`)
- Secondary speed chips & add speed inline form (`bg-dnd-panel/60` / `bg-dnd-panel/80` -> `bg-dnd-panel/70`)
- Lore fields (Background, Alignment, Faith, Lifestyle) display & input (`bg-dnd-panel/60` / `bg-dnd-panel` -> `bg-dnd-panel/70`)

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- src/components/CharacterSheet/CharacterSheetHeader.test.jsx`
Expected: PASS

---

### Task 2: Standardize Level 3 Elements in ProficienciesCard and ResourcesCard

**Files:**
- Modify: `src/components/CharacterSheet/ProficienciesCard.jsx`
- Modify: `src/components/CharacterSheet/ResourcesCard.jsx`
- Test: `src/components/CharacterSheet/ProficienciesCard.test.jsx`
- Test: `src/components/CharacterSheet/ResourcesCard.test.jsx`

**Interfaces:**
- Consumes: Tailwind utility `bg-dnd-panel/70`
- Produces: Uniform tag chips in `ProficienciesCard` and uniform counter pill in `ResourcesCard`.

- [ ] **Step 1: Write tests for proficiency chips and resource stepper background classes**

Add test assertions verifying proficiency chips in `ProficienciesCard` use `bg-dnd-panel/70` and resource stepper counter in `ResourcesCard` uses `bg-dnd-panel/70`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm.cmd test -- src/components/CharacterSheet/ProficienciesCard.test.jsx src/components/CharacterSheet/ResourcesCard.test.jsx`
Expected: FAIL on background class expectation.

- [ ] **Step 3: Update background classes in ProficienciesCard.jsx and ResourcesCard.jsx**

In `src/components/CharacterSheet/ProficienciesCard.jsx`:
- Update proficiency chips: `bg-dnd-panel` -> `bg-dnd-panel/70`
- Update add proficiency input: `bg-dnd-card` -> `bg-dnd-panel/70`

In `src/components/CharacterSheet/ResourcesCard.jsx`:
- Update stepper counter pill (`{res.current} / {res.max}`): `bg-dnd-panel` -> `bg-dnd-panel/70`
- Update resource add form inputs (`name`, `max`, `resetOn`): `bg-dnd-panel` -> `bg-dnd-panel/70`

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm.cmd test -- src/components/CharacterSheet/ProficienciesCard.test.jsx src/components/CharacterSheet/ResourcesCard.test.jsx`
Expected: PASS

---

### Task 3: Standardize Level 3 Elements in VitalsCard and SlotLevelRow

**Files:**
- Modify: `src/components/CharacterSheet/VitalsCard.jsx`
- Modify: `src/components/Spellbook/SlotLevelRow.jsx`
- Test: `src/components/CharacterSheet/VitalsCard.test.jsx`
- Test: `src/components/Spellbook/SpellSlotTracker.test.jsx`

**Interfaces:**
- Consumes: Tailwind utility `bg-dnd-panel/70`
- Produces: Uniform nested subcontainers across `VitalsCard` and `SlotLevelRow`.

- [ ] **Step 1: Write test verifying subcontainers in VitalsCard use bg-dnd-panel/70**

Add assertion in `src/components/CharacterSheet/VitalsCard.test.jsx` verifying the Spellcasting ability badge and HP subcontainer use `bg-dnd-panel/70`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx`
Expected: FAIL.

- [ ] **Step 3: Update background classes in VitalsCard.jsx and SlotLevelRow.jsx**

In `src/components/CharacterSheet/VitalsCard.jsx`:
- Current & Max HP subcontainer: `bg-dnd-panel/60` -> `bg-dnd-panel/70`
- Temp HP subcontainer: `bg-dnd-panel/60` -> `bg-dnd-panel/70`
- Treatment capsule: `bg-dnd-panel/60` -> `bg-dnd-panel/70`
- Treatment amount input: `bg-dnd-panel/90` -> `bg-dnd-panel/70`
- Spellcasting ability "INT" pill and edit select: `bg-dnd-panel/60` / `bg-dnd-panel` -> `bg-dnd-panel/70`
- Spell Attack & Spell DC override inputs: `bg-dnd-panel` -> `bg-dnd-panel/70`
- AC edit inputs and note textarea: `bg-dnd-panel` -> `bg-dnd-panel/70`
- Initiative override input: `bg-dnd-panel` -> `bg-dnd-panel/70`
- Hit dice pool chips: `bg-dnd-panel/60` -> `bg-dnd-panel/70`

In `src/components/Spellbook/SlotLevelRow.jsx`:
- Level badge: `bg-dnd-panel/80` -> `bg-dnd-panel/70`
- Max slot edit input: `bg-dnd-panel/90` -> `bg-dnd-panel/70`

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx src/components/Spellbook/SpellSlotTracker.test.jsx`
Expected: PASS

---

### Task 4: Full App Verification & Final Regression Check

**Files:**
- Test: Full Vitest test suite (`npm.cmd test -- --run`)
- Build: Production build (`npm.cmd run build`)

- [ ] **Step 1: Run complete test suite**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- --run`
Expected: All 42 test files pass (304+ tests).

- [ ] **Step 2: Run production build**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd run build`
Expected: Production build succeeds with code 0.
