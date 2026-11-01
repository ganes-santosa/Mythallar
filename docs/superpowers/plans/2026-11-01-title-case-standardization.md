# Title Case Standardization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize Combat Stats inner labels, trackers, buttons, and repository guidelines to Title Case while retaining standard 5e initialisms as uppercase.

**Architecture:** Update `VitalsCard.jsx` labels and badges to Title Case, polish accessibility (`aria-label="Amount"`, `aria-hidden="true"` on mobile `Init`), update `VitalsCard.test.jsx`, and codify Title Case in `docs/superpowers/specs/2026-10-31-visual-guidelines.md` and `AGENTS.md`.

**Tech Stack:** React 18, Tailwind CSS, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-01-title-case-standardization.md`

## Global Constraints

- Section and accordion titles use Title Case.
- Inner card labels, tags, trackers, and action buttons use Title Case (e.g. `Hit Points`, `Hit Dice`, `Death Saves`, `Max HP Buff`, `Base Max`, `Temp HP`, `Damage`, `Heal`, `Defenses & Resistances`).
- Standard 5e initialisms (`HP`, `AC`, `DEX`, `STR`, `CON`, `INT`, `WIS`, `CHA`, `ft`) remain uppercase.
- Prohibit CSS `uppercase` and all-caps text strings (`HIT POINTS`, `SPEED`).
- CRLF line endings on modified files.

## Review Focus

- Title Case card labels: `Hit Points`, `Hit Dice`, `Death Saves`, `Max HP Buff`, `Base Max`, `Temp HP`, `Damage`, `Heal`, `Defenses & Resistances`.
- Responsive Initiative: desktop displays `Initiative`, mobile displays `Init` with `aria-hidden="true"`.
- Quick HP amount input has accessible label `aria-label="Amount"`.
- Full test suite passes without regressions.
- Documentation accurately reflects Title Case convention.

---

### Task 1: Update `VitalsCard.jsx` to Title Case and Accessibility Polish

**Files:**
- Modify: `src/components/CharacterSheet/VitalsCard.jsx`
- Test: `src/components/CharacterSheet/VitalsCard.test.jsx`

**Interfaces:**
- Consumes: Vitals data object.
- Produces: Vitals card UI with Title Case labels and accessible controls.

- [ ] **Step 1: Update `src/components/CharacterSheet/VitalsCard.test.jsx` with Title Case expectations**

Update assertions for Title Case strings:
- `'Hit Points'`, `'Hit Dice'`, `'Death Saves'`, `'Inspiration'`, `'Succ'`, `'Fail'`
- `+5 Buff`
- `'Apply Damage'`, `'Apply Heal'` buttons without `uppercase` class.
- Amount input with `aria-label="Amount"`.

- [ ] **Step 2: Run test to verify it fails**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx --run`
Expected: FAIL due to mismatched case (`Hit points` vs `Hit Points`).

- [ ] **Step 3: Update `src/components/CharacterSheet/VitalsCard.jsx`**

Apply Title Case to:
- HP view: `Hit Points`, `Current`, `Max`, `+ Temp`, `+{buff} Buff`
- HP settings: `Hit Points Settings`, `Effective Max:`, `Current`, `Base Max`, `Max HP Buff`, `Temp HP`
- Capsule buttons: `Damage`, `Heal`
- Capsule input: `aria-label="Amount"`
- Initiative header: `<span className="hidden sm:inline">Initiative</span><span className="sm:hidden" aria-hidden="true">Init</span>`
- Speed subtext: `DEX Mod`, `Override`, `Walking`
- Trackers: `Hit Dice`, `Death Saves`, `Inspiration`, `Succ`, `Fail`
- Conditions: `Conditions:`, `+ Add Condition`
- Defenses: `Defenses & Resistances:`, `+ Add Defense`

- [ ] **Step 4: Run test to verify it passes**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx --run`
Expected: PASS

---

### Task 2: Codify Title Case in Guidelines and `AGENTS.md`

**Files:**
- Modify: `docs/superpowers/specs/2026-10-31-visual-guidelines.md`
- Modify: `AGENTS.md`

**Interfaces:**
- Consumes: Title Case standard decision.
- Produces: Updated repository instructions and visual guidelines.

- [ ] **Step 1: Update `docs/superpowers/specs/2026-10-31-visual-guidelines.md`**

Set Title Case as standard for:
- Section titles & accordion headers
- Inner card labels, fields, trackers, and action buttons
- Keep standard 5e initialisms uppercase
- Keep anti-ALL-CAPS rule

- [ ] **Step 2: Update `AGENTS.md`**

Update `## UI conventions` under `Capitalization Hierarchy` to specify Title Case as the global standard for accordion titles, inner card labels, stat badges, field labels, tracker text, and action buttons.

---

### Task 3: Full Suite Verification & Build

**Files:**
- Integration verification.
- Modify: `HANDOFF.md`

- [ ] **Step 1: Run full test suite**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- --run`
Expected: 37 test files, 200 tests passing.

- [ ] **Step 2: Run production build**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd run build`
Expected: Clean build with exit code 0.

- [ ] **Step 3: Update `HANDOFF.md`**

Record Title Case standardization in `HANDOFF.md`.
