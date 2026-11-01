# Combat Vitals & Formulations Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Combat Vitals & Formulations section with a prominent Hero HP card, 5e Temp HP damage absorption, quick healing, MAX HP BUFF support, an AC note action, compact stats/trackers, and an edit mode toggle.

**Architecture:** Update `VitalsCard.jsx` to render a 3-card primary grid (HP Hero with vertical Damage/Heal capsule, AC with inline note action, Initiative & Speed pair), a compact 3-tracker strip (Hit Dice, Death Saves, Inspiration), and retain Conditions/Defenses. Connect section edit mode from `CharacterSheetView.jsx` via header action toggle.

**Tech Stack:** React 18, Tailwind CSS, Lucide icons (`Heart`, `Shield`, `Zap`, `Footprints`, `Sparkles`, `Activity`, `Flame`, `Settings2`, `Check`, `Plus`, `X`, `Edit3`, `Trash2`), Vitest, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-01-combat-vitals-redesign.md`

## Global Constraints
- React 18, Vite 6, Tailwind 3.
- Windows PowerShell compatibility (`npm.cmd test -- --run`, `npm.cmd run build`).
- Files use CRLF line endings.
- Strictly adhere to visual guidelines: `bg-dnd-card`, `bg-dnd-panel`, `text-dnd-gold`, subtle borders `border-white/5`.
- TDD required: tests written and verified red before green.

## Review Focus
1. `Damage > Temp HP + Current HP`: Ensure damage clamps Current HP at 0 (never negative) and sets Temp HP to 0.
2. `Heal exceeds Effective Max`: Ensure healing clamps at `effectiveMax = hpMax + (hpMaxBuff || 0)` and never adds to Temp HP.
3. `Empty / Invalid Damage Input`: Clicking Damage or Heal with empty input does nothing and does not corrupt state.
4. `Negative Damage / Heal Input`: Amount inputs negative or non-numeric should be treated as positive integers via `Math.abs(Math.floor(val))` or ignored.
5. `Backward Compatibility`: Characters without `hpMaxBuff` default gracefully to `hpMaxBuff: 0` without crashing.

---

### Task 1: Update Default Schema for Vitals

**Files:**
- Modify: `src/utils/storage.js:105-125`
- Test: `src/utils/storage.test.js`

**Interfaces:**
- Consumes: character profile creation
- Produces: `vitals.hpMaxBuff: 0` in default character profile

- [ ] **Step 1: Write the failing test**

In `src/utils/storage.test.js`, assert that default character profile vitals includes `hpMaxBuff: 0`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- src/utils/storage.test.js --run`
Expected: FAIL if `hpMaxBuff` is undefined in new character defaults.

- [ ] **Step 3: Implement `hpMaxBuff: 0` in `src/utils/storage.js`**

Add `hpMaxBuff: 0` to default `vitals` object in `createCharacterProfile`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- src/utils/storage.test.js --run`
Expected: PASS

---

### Task 2: Implement 5e Damage, Heal, and MAX HP BUFF Logic in VitalsCard

**Files:**
- Modify: `src/components/CharacterSheet/VitalsCard.jsx`
- Test: `src/components/CharacterSheet/VitalsCard.test.jsx`

**Interfaces:**
- Consumes: `vitals` prop (`hpCurrent`, `hpMax`, `hpMaxBuff`, `hpTemp`), `onUpdateVitals`
- Produces: `handleQuickDamage(amt)`, `handleQuickHeal(amt)`, `effectiveMax` computation

- [ ] **Step 1: Write failing tests for 5e Damage, Heal, and MAX HP BUFF**

In `src/components/CharacterSheet/VitalsCard.test.jsx`:
- Test Damage absorbs `hpTemp` first, then subtracts remainder from `hpCurrent` down to 0.
- Test Heal restores `hpCurrent` up to `hpMax + hpMaxBuff` without altering `hpTemp`.
- Test quick damage/heal input clears to empty after application.
- Test `MAX HP BUFF` calculation: `effectiveMax = hpMax + hpMaxBuff`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx --run`
Expected: FAIL on quick damage/heal buttons and buffer calculations.

- [ ] **Step 3: Implement damage/heal calculations and HP Hero card**

In `src/components/CharacterSheet/VitalsCard.jsx`:
- Compute `effectiveMax = (currentVitals.hpMax ?? 10) + (currentVitals.hpMaxBuff ?? 0)`.
- Implement `handleQuickDamage(amount)`:
  - Return early if `!amount || isNaN(amount) || amount <= 0`.
  - Absorb `currentVitals.hpTemp`: if `amount <= hpTemp`, new temp is `hpTemp - amount`, current unchanged.
  - If `amount > hpTemp`, new temp is 0, new current is `Math.max(0, hpCurrent - (amount - hpTemp))`.
  - Clear amount input state.
- Implement `handleQuickHeal(amount)`:
  - Return early if `!amount || isNaN(amount) || amount <= 0`.
  - New current is `Math.min(effectiveMax, hpCurrent + amount)`. Temp unchanged.
  - Clear amount input state.
- Render HP Hero Card:
  - Left panel: `♥ HIT POINTS` with conditional `+X Buff` badge, Current `24px`, Max `18px`, `+ Temp` `18px`, mini progress bar.
  - Divider `w-px bg-white/5 my-0.5`.
  - Right panel: Treatment A capsule (`Damage` button, `Amt` input, `Heal` button).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx --run`
Expected: PASS

---

### Task 3: Redesign AC Card with Note Action & Initiative/Speed Pair

**Files:**
- Modify: `src/components/CharacterSheet/VitalsCard.jsx`
- Test: `src/components/CharacterSheet/VitalsCard.test.jsx`

**Interfaces:**
- Consumes: `vitals.ac`, `vitals.acFormula`, `vitals.speed`, `vitals.initiativeOverride`, `dexScore`
- Produces: Inline AC note editing, compact initiative & speed display

- [ ] **Step 1: Write failing tests for AC note action and Initiative/Speed**

In `src/components/CharacterSheet/VitalsCard.test.jsx`:
- Test clicking `+ Note` or formula opens note textarea.
- Test saving note updates `acFormula`.
- Test Initiative displays DEX modifier or override.
- Test Speed displays walking speed.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx --run`
Expected: FAIL on AC note action and structure.

- [ ] **Step 3: Implement AC note action and Initiative/Speed pair**

In `src/components/CharacterSheet/VitalsCard.jsx`:
- Add state `isEditingAcNote` and `acNoteDraft`.
- Render AC Card with 24px AC score (`text-dnd-gold`), shield icon, and `+ Note` toggle button / note breakdown. When editing, display compact textarea with Save/Cancel.
- Render Initiative & Speed Pair in a single card split with vertical divider:
  - Initiative: DEX modifier or override, "DEX mod" sub-label.
  - Speed: walking speed in `ft`, "Walking" sub-label.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx --run`
Expected: PASS

---

### Task 4: Implement Compact Trackers Strip & Edit Mode

**Files:**
- Modify: `src/components/CharacterSheet/VitalsCard.jsx`
- Modify: `src/components/CharacterSheet/CharacterSheetView.jsx`
- Test: `src/components/CharacterSheet/VitalsCard.test.jsx`
- Test: `src/components/CharacterSheet/CharacterSheetView.test.jsx`

**Interfaces:**
- Consumes: `isEditing` prop in `VitalsCard`, `isEditingVitals` in `CharacterSheetView`
- Produces: Header edit button toggle for Combat Vitals, edit mode inputs for Base Max HP, MAX HP BUFF, Temp HP, AC, Speed, Initiative

- [ ] **Step 1: Write failing tests for edit mode and compact trackers**

In `src/components/CharacterSheet/VitalsCard.test.jsx` and `CharacterSheetView.test.jsx`:
- Test compact trackers strip renders Hit Dice, Death Saves, and Inspiration in one horizontal strip.
- Test `CharacterSheetView` renders an Edit button (`Settings2` / `Check`) for "Combat Vitals & Formulations" and toggles `isEditing`.
- Test `VitalsCard` in edit mode displays fields for `Base Max`, `MAX HP BUFF`, and `Temp HP`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx src/components/CharacterSheet/CharacterSheetView.test.jsx --run`
Expected: FAIL

- [ ] **Step 3: Implement compact trackers strip and edit mode in VitalsCard & CharacterSheetView**

In `src/components/CharacterSheet/VitalsCard.jsx`:
- Render Row 2 Trackers Strip: `bg-dnd-card/60 border border-white/5 rounded-lg p-2 flex items-center justify-between` containing Hit Dice, 3-dot Death Saves, and Inspiration.
- When `isEditing` is true, HP card swaps into edit grid: `Base Max` input, `MAX HP BUFF` input, `Temp HP` input.
In `src/components/CharacterSheet/CharacterSheetView.jsx`:
- Add `isEditingVitals` state.
- Render header action button (`Settings2` / `Check`) on "Combat Vitals & Formulations" AccordionSection.
- Pass `isEditing={isEditingVitals}` to `<VitalsCard />`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx src/components/CharacterSheet/CharacterSheetView.test.jsx --run`
Expected: PASS

---

### Task 5: Full Suite Verification & Build

**Files:**
- Verify: Full test suite and Vite build

- [ ] **Step 1: Run full test suite**

Run: `npm.cmd test -- --run`
Expected: PASS across all 37+ test files.

- [ ] **Step 2: Run production build**

Run: `npm.cmd run build`
Expected: Build succeeds with 0 errors.
