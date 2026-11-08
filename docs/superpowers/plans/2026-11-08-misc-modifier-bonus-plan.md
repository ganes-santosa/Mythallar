# Misc Modifier Bonus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable additive misc modifier bonus inputs (+X / -X) for abilities (save / check), skills, and senses (passives & darkvision) in edit mode, while preserving the exact existing appearance in view mode.

**Architecture:** Extend calculation helpers in `dndCalculations.js` to accept additive bonuses; update `storage.js` defaults and loading schema; update `SkillsCard.jsx`, `AbilitiesCard.jsx`, and `CharacterSheetView.jsx` to render clean, uncrowded inline numeric inputs in edit mode and include misc bonuses in totals.

**Tech Stack:** React 18, Vite 6, Tailwind CSS 3, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-08-misc-modifier-bonus-design.md`

## Global Constraints
- Files use CRLF line endings.
- Strictly no stepper/arrow buttons on modifier inputs; use `[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`.
- View mode styling and resting card appearance must remain 100% unchanged.
- Follow TDD: write failing test, verify failure, implement code, verify pass.

## Review Focus
1. Empty or non-numeric input in modifier fields must fall back to 0 without resulting in `NaN` in total modifier displays.
2. Negative modifier inputs (e.g. `-1`) must calculate correctly and display `-1` instead of `+-1`.
3. Existing saved character profiles lacking `skillBonuses` or `saveBonuses` must load seamlessly without errors.
4. Passive senses must recalculate automatically when an underlying skill's misc bonus changes (e.g. Arcana misc bonus does not change perception, but Perception misc bonus updates Passive Perception).
5. Toggling edit mode off must retain any entered misc bonuses across saves and character reloads.

---

### Task 1: Calculation Helpers & Storage Migration for Misc Bonuses

**Files:**
- Modify: `src/utils/dndCalculations.js`
- Modify: `src/utils/dndCalculations.test.js`
- Modify: `src/utils/storage.js`
- Modify: `src/utils/storage.test.js`

**Interfaces:**
- Produces:
  - `calculateSkillBonus(score, profType, level, override, miscBonus)`
  - `calculateSave(score, isProficient, level, override, miscBonus)`
  - `calculatePassiveScore(score, profType, level, bonus, skillBonus)`
  - `createDefaultSheet()` includes `skillBonuses: {}` and `abilities.saveBonuses: {}` and `senses.bonuses: {}`

- [x] **Step 1: Write failing tests in `dndCalculations.test.js` and `storage.test.js`**
- [x] **Step 2: Run test to verify failure**
- [x] **Step 3: Update `dndCalculations.js` and `storage.js`**
- [x] **Step 4: Run test to verify pass**

---

### Task 2: SkillsCard Misc Bonus UI & Passives Integration

**Files:**
- Modify: `src/components/CharacterSheet/SkillsCard.jsx`
- Modify: `src/components/CharacterSheet/SkillsCard.test.jsx`
- Modify: `src/components/CharacterSheet/CharacterSheetView.jsx`

**Interfaces:**
- Consumes: `calculateSkillBonus`, `calculatePassiveScore`, `onUpdateSkills`, `onUpdateSkillBonuses`, `onUpdateSenses`
- Produces: Inline misc modifier input in `SkillsCard.jsx` rows and senses banner when `isEditing=true`.

- [x] **Step 1: Write failing tests in `SkillsCard.test.jsx`**
- [x] **Step 2: Run test to verify failure**
- [x] **Step 3: Implement misc bonus inputs in `SkillsCard.jsx` and wire in `CharacterSheetView.jsx`**
- [x] **Step 4: Run test to verify pass**

---

### Task 3: AbilitiesCard Misc Save & Check Bonus UI

**Files:**
- Modify: `src/components/CharacterSheet/AbilitiesCard.jsx`
- Modify: `src/components/CharacterSheet/AbilitiesCard.test.jsx`
- Modify: `src/components/CharacterSheet/CharacterSheetView.jsx`

**Interfaces:**
- Consumes: `calculateSave`, `onUpdateAbilities`
- Produces: Inline save misc bonus input in `AbilitiesCard.jsx` when `isEditing=true`.

- [x] **Step 1: Write failing tests in `AbilitiesCard.test.jsx`**
- [x] **Step 2: Run test to verify failure**
- [x] **Step 3: Implement save bonus input in `AbilitiesCard.jsx`**
- [x] **Step 4: Run test to verify pass**

---

### Task 4: Full Suite Integration & Verification

**Files:**
- Modify: `src/components/CharacterSheet/CharacterSheetView.test.jsx`
- Run: Full test suite & build check

- [x] **Step 1: Run integration test for CharacterSheetView**
- [x] **Step 2: Run full test suite & production build**
