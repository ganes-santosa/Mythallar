# Hit Dice & Short Rest Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a comprehensive D&D 5e Hit Dice and Short Rest system with class-based dice scaling, inline Combat Stats rolling, a unified Short Rest modal with embedded Wizard Arcane Recovery, and 5e Long Rest dice recovery.

**Architecture:** Extend `storage.js` and `dndCalculations.js` to normalize hit dice pools based on character classes and levels. Update `VitalsCard.jsx` to render interactive class hit dice pools with inline rolling (+ CON mod heal) and manual steppers. Build `ShortRestModal.jsx` to manage the complete rest lifecycle (hit dice healing, Wizard Arcane Recovery, and Warlock Pact Magic recovery) accessible from both `VitalsCard` and `SpellSlotTracker`. Update `App.jsx` rest handlers to recover 5e hit dice pools on Long Rest.

**Tech Stack:** React 18, Vite 6, Tailwind 3, Vitest, React Testing Library, Lucide icons.

**Spec:** `docs/superpowers/specs/2026-11-01-hit-dice-short-rest-design.md`

## Global Constraints
- Accordion panels and cards adhere to `docs/superpowers/specs/2026-10-31-visual-guidelines.md`.
- Strictly Title Case for all headers, labels, and buttons (`Combat Stats`, `Hit Dice`, `Short Rest`, `Finish Short Rest`).
- No native number stepper spin buttons (`appearance: textfield`) and no native validation tooltips (`noValidate`).
- CRLF line endings on all modified and created files.
- Backward compatibility: legacy `vitals.hitDice` (`{ current, max, die }`) automatically normalizes without data loss.

## Review Focus
1. Multiclass character with split dice pools (e.g. Rogue 3 / Fighter 2 with 3d8 and 2d10) displays both pools distinctly and decrements the correct pool when rolled.
2. Character with negative Constitution modifier (e.g. CON 8, -1 mod) rolling a 1 on a d6 heals a minimum of 1 HP (`Math.max(1, roll + conMod)`).
3. Rolling a hit die when HP is already at Effective Max is disabled or prevented from exceeding Effective Max.
4. Wizard using Arcane Recovery during Short Rest marks `arcaneRecoveryUsed: true` and restores selected slots, while non-wizard rests cleanly without rendering wizard UI.
5. Long Rest recovers half total level in hit dice (minimum 1), allocating restored dice up to each pool's maximum without overflowing.

---

### Task 1: Hit Dice Calculation & Normalization Helpers

**Files:**
- Modify: `src/utils/dndCalculations.js`
- Modify: `src/utils/storage.js`
- Test: `src/utils/dndCalculations.test.js`
- Test: `src/utils/storage.test.js`

**Interfaces:**
- Produces:
  - `getClassHitDie(className: string): string` -> `'d6' | 'd8' | 'd10' | 'd12'`
  - `rollHitDie(dieSides: number, conScore: number, rng?: () => number): { roll: number, conMod: number, total: number }`
  - `normalizeHitDice(vitals: object, character: object): object`
  - `recoverHitDiceOnLongRest(hitDice: object, totalLevel: number): object`

- [ ] **Step 1: Write failing tests for hit dice calculations and normalization**
  - Add tests in `src/utils/dndCalculations.test.js` for `getClassHitDie` and `rollHitDie` with CON mod and min 1 floor.
  - Add tests in `src/utils/storage.test.js` for `normalizeHitDice` (single class, multiclass, legacy profile fallback) and `recoverHitDiceOnLongRest`.

- [ ] **Step 2: Run tests to verify failures**
  Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/utils/dndCalculations.test.js src/utils/storage.test.js --run`
  Expected: FAIL with functions not defined.

- [ ] **Step 3: Implement functions in `src/utils/dndCalculations.js` and `src/utils/storage.js`**
  - In `dndCalculations.js`: export `getClassHitDie` and `rollHitDie`.
  - In `storage.js`: export `normalizeHitDice` and `recoverHitDiceOnLongRest`. Ensure default profile creation uses `normalizeHitDice`.

- [ ] **Step 4: Run tests to verify pass**
  Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/utils/dndCalculations.test.js src/utils/storage.test.js --run`
  Expected: PASS.

- [ ] **Step 5: Commit**
  ```bash
  git add src/utils/dndCalculations.js src/utils/dndCalculations.test.js src/utils/storage.js src/utils/storage.test.js
  git commit -m "feat(hit-dice): add hit dice calculation and normalization helpers"
  ```

---

### Task 2: Inline Hit Dice Rolling & Management in VitalsCard

**Files:**
- Modify: `src/components/CharacterSheet/CharacterSheetView.jsx`
- Modify: `src/components/CharacterSheet/VitalsCard.jsx`
- Test: `src/components/CharacterSheet/VitalsCard.test.jsx`

**Interfaces:**
- Consumes: `normalizeHitDice`, `rollHitDie` from Task 1.
- Props in `VitalsCard`: `vitals`, `conScore`, `classes`, `onUpdateVitals`, `onShortRest`.

- [ ] **Step 1: Write failing tests in `VitalsCard.test.jsx`**
  - Test rendering hit dice pools from character classes.
  - Test clicking "Roll dX" button: rolls die + CON mod, increments `hpCurrent`, decrements pool `current`, triggers toast notification.
  - Test manual `[-]` and `[+]` steppers adjust pool count without healing.
  - Test `Rest` button invokes `onShortRest`.

- [ ] **Step 2: Run tests to verify failures**
  Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx --run`
  Expected: FAIL.

- [ ] **Step 3: Update `CharacterSheetView.jsx` and `VitalsCard.jsx`**
  - Pass `conScore={sheet.abilities?.con ?? 10}`, `classes={character.classes || [{ className: character.className, level: character.level }]}`, and `onShortRest` to `VitalsCard`.
  - In `VitalsCard.jsx`: normalize hit dice via `normalizeHitDice(currentVitals, { classes })`.
  - Render hit dice pools with `Roll d[X]` button, `[-]` / `[+]` steppers, and a compact `Rest` button.

- [ ] **Step 4: Run tests to verify pass**
  Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx --run`
  Expected: PASS.

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/CharacterSheet/CharacterSheetView.jsx src/components/CharacterSheet/VitalsCard.jsx src/components/CharacterSheet/VitalsCard.test.jsx
  git commit -m "feat(vitals): add inline hit dice rolling and rest trigger in vitals card"
  ```

---

### Task 3: Unified ShortRestModal Component

**Files:**
- Create: `src/components/Modal/ShortRestModal.jsx`
- Create: `src/components/Modal/ShortRestModal.test.jsx`

**Interfaces:**
- Props:
  - `character: object`
  - `isOpen: boolean`
  - `onClose: () => void`
  - `onRollHitDie: (dieSides: number, manualRoll?: number) => void`
  - `onCompleteShortRest: (arcaneRecoverySlots?: object) => void`

- [ ] **Step 1: Write failing tests in `ShortRestModal.test.jsx`**
  - Test modal renders title "Short Rest", current HP vs Effective Max, and CON modifier.
  - Test rolling hit die triggers `onRollHitDie` with sides.
  - Test entering a manual physical roll input passes custom value.
  - Test Wizard renders Arcane Recovery section with slot selectors when available.
  - Test Warlock renders notice that Pact Magic slots will be restored.
  - Test clicking "Finish Short Rest" calls `onCompleteShortRest`.

- [ ] **Step 2: Run tests to verify failures**
  Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/Modal/ShortRestModal.test.jsx --run`
  Expected: FAIL with component not found.

- [ ] **Step 3: Implement `ShortRestModal.jsx`**
  - Build modal matching Mythallar visual guidelines (`bg-dnd-card`, `bg-dnd-panel`, `border-white/10`, Title Case).
  - Health bar with live HP status.
  - Pool cards for each die type with `Roll 1d[X]` button and physical roll input box.
  - Embedded Arcane Recovery section for Wizards (reuses recovery logic from `ArcaneRecoveryModal`).
  - Action footer: `Finish Short Rest` and `Cancel`.

- [ ] **Step 4: Run tests to verify pass**
  Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/Modal/ShortRestModal.test.jsx --run`
  Expected: PASS.

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/Modal/ShortRestModal.jsx src/components/Modal/ShortRestModal.test.jsx
  git commit -m "feat(modal): create unified short rest modal with hit dice and arcane recovery"
  ```

---

### Task 4: Connect Short Rest and Long Rest in App & SpellSlotTracker

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/Spellbook/SpellSlotTracker.jsx`
- Modify: `src/components/CharacterSheet/CharacterSheetView.jsx`
- Test: `src/components/Spellbook/SpellSlotTracker.test.jsx`
- Test: `src/App.test.jsx`

**Interfaces:**
- Consumes: `ShortRestModal` from Task 3, `recoverHitDiceOnLongRest` from Task 1.

- [ ] **Step 1: Write failing tests in `SpellSlotTracker.test.jsx` and `App.test.jsx`**
  - Test Short Rest button in `SpellSlotTracker` triggers `onShortRest` (opening modal for all classes).
  - Test Short Rest rolling hit dice increases HP in active character.
  - Test Long Rest restores spent hit dice up to `Math.max(1, Math.floor(level / 2))` in active character.

- [ ] **Step 2: Run tests to verify failures**
  Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/Spellbook/SpellSlotTracker.test.jsx src/App.test.jsx --run`
  Expected: FAIL.

- [ ] **Step 3: Wire `ShortRestModal` and Long Rest recovery in `App.jsx`**
  - In `App.jsx`: add state `isShortRestOpen`.
  - Handle hit die rolling: computes roll + CON mod, updates `hpCurrent`, decrements hit die pool, shows toast.
  - Handle short rest completion: resets Pact slots, applies any Arcane Recovery staged, closes modal.
  - In `handleLongRest`: call `recoverHitDiceOnLongRest(activeCharacter.sheet.vitals.hitDice, activeCharacter.level)`.
  - Pass `onShortRest={() => setIsShortRestOpen(true)}` to `CharacterSheetView` and `SpellSlotTracker`.
  - Render `<ShortRestModal>` in `App.jsx`.

- [ ] **Step 4: Run tests to verify pass**
  Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- --run`
  Expected: All 38+ test files pass.

- [ ] **Step 5: Build and verification**
  Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd run build`
  Expected: 0 errors.

- [ ] **Step 6: Commit**
  ```bash
  git add src/App.jsx src/App.test.jsx src/components/Spellbook/SpellSlotTracker.jsx src/components/Spellbook/SpellSlotTracker.test.jsx src/components/CharacterSheet/CharacterSheetView.jsx
  git commit -m "feat(rest): integrate unified short rest and long rest hit dice recovery"
  ```
