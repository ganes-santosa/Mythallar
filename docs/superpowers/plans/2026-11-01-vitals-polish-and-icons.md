# Vitals Card Visual Polish & Icon Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 6 visual polish and usability adjustments in `VitalsCard.jsx`: hover highlights, auto-width single-line `Current / Max` spacing, uniform `text-[10px]` typography and `"0"` placeholder in Damage/Heal capsule, white font color for AC and Initiative, always-visible edit button for AC notes, and `Lightbulb` icon for Inspiration.

**Architecture:**
- Adjust Current HP input width to dynamic `ch` (`style={{ width: `${Math.max(1, String(currentHpDraft).length)}ch` }}`) with a fixed inline gap around `/` and static Max HP.
- Add hover highlight styling to HP sub-containers and inputs.
- Change Damage/Heal capsule input placeholder to `"0"`, align typography to `text-[10px] font-bold`.
- Update AC value and Initiative value text color to `text-slate-100`.
- Update AC note edit trigger to remain visible (remove `opacity-0 group-hover:opacity-100`).
- Replace `Sparkles` icon with `Lightbulb` icon for Inspiration.

**Tech Stack:** React 18, Lucide React (`Lightbulb`), Tailwind CSS, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-01-vitals-polish-and-icons.md`

## Global Constraints
- Current HP and Temp HP remain always-interactive inputs.
- Values clamp `>= 0`.
- Title Case labels preserved.
- CRLF line endings. UTF-8 without BOM.

## Review Focus
- Quick HP input has placeholder `"0"`.
- AC note edit button is visible without hover.
- AC and Initiative render white text (`text-slate-100`).
- Inspiration renders `Lightbulb` icon.
- Spacing around `/` is uniform across 1, 2, and 3-digit HP numbers.

---

### Task 1: Update Tests in `VitalsCard.test.jsx`

**Files:**
- Modify: `src/components/CharacterSheet/VitalsCard.test.jsx`

- [ ] **Step 1: Update test expectations**
  - Update quick HP input placeholder assertion to `"0"` (replace any checks expecting `"Amt"`).
  - Verify AC note edit button is present and not hidden by opacity classes.
  - Verify AC and Initiative values have `text-slate-100` class instead of `text-dnd-gold`.
  - Verify Inspiration icon is `Lightbulb` (or renders properly).

- [ ] **Step 2: Run test to verify failure**
  Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx --run`
  Expected: FAIL due to placeholder and color differences.

---

### Task 2: Implement Changes in `VitalsCard.jsx`

**Files:**
- Modify: `src/components/CharacterSheet/VitalsCard.jsx`

- [ ] **Step 1: Update imports**
  - Import `Lightbulb` from `lucide-react`.

- [ ] **Step 2: Update HP sub-container 1 & 2**
  - Add hover styles: `hover:border-white/20 hover:bg-dnd-panel/90 transition-all`.
  - Auto-size Current HP input: `style={{ width: `${Math.max(1, String(currentHpDraft).length)}ch` }}` with `min-w-[1ch] text-right font-black text-2xl text-slate-100`.
  - Slash separator: `text-base text-slate-600 font-bold px-1.5 select-none`.
  - Static Max HP: `text-lg font-bold text-slate-400 text-left`.
  - Sub-container 2: `style={{ width: `${Math.max(1, String(tempHpDraft).length)}ch` }}` for Temp HP input with hover highlight.

- [ ] **Step 3: Update Damage / Heal capsule**
  - Change input placeholder from `"Amt"` to `"0"`.
  - Ensure uniform `text-[10px] font-bold` for Damage button, input, and Heal button.

- [ ] **Step 4: Update AC and Initiative color**
  - Change AC number to `text-2xl font-black text-slate-100 leading-none my-0.5`.
  - Change Initiative modifier to `text-xl font-black text-slate-100 leading-none`.
  - Change edit mode Initiative to `text-sm font-bold text-slate-100`.

- [ ] **Step 5: Update AC Note edit button**
  - Remove `opacity-0 group-hover:opacity-100`, making the edit button visible with `text-slate-400 hover:text-dnd-gold p-0.5 rounded transition-colors`.

- [ ] **Step 6: Update Inspiration icon**
  - Replace `<Sparkles size={11} className="text-dnd-gold" />` with `<Lightbulb size={11} className="text-dnd-gold" />`.

- [ ] **Step 7: Run test to verify pass**
  Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx --run`
  Expected: PASS.

---

### Task 3: Full Suite Verification & Build

**Files:**
- Modify: `HANDOFF.md`

- [ ] **Step 1: Run full test suite**
  Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- --run`
  Expected: 37 files, all 204 tests pass.

- [ ] **Step 2: Run production build**
  Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd run build`
  Expected: Clean build.

- [ ] **Step 3: Update `HANDOFF.md`**
  Record refinements in `HANDOFF.md`.
