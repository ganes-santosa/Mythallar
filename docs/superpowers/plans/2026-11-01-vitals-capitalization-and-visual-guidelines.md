# Capitalization Uniformity & Visual Guidelines Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize character sheet vitals to sentence case, make Initiative responsive, rename section header to "Combat Stats", and codify capitalization rules in visual guidelines and `AGENTS.md`.

**Architecture:** Update `CharacterSheetView.jsx` header title, refactor `VitalsCard.jsx` labels and CSS classes to eliminate `uppercase` while preserving 5e initialisms (HP, AC, DEX, ft), provide responsive markup for Initiative, update tests, and document standards in specs and conventions.

**Tech Stack:** React 18, Tailwind CSS, Lucide icons, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-01-vitals-capitalization-and-visual-guidelines.md`

## Global Constraints
- Accordion headers use Title Case: `Combat Stats`.
- Card internal labels, field names, badges, trackers, and buttons use sentence case (e.g. `Hit points`, `Base max`, `Max HP buff`, `Temp HP`, `Damage`, `Heal`, `Hit dice`, `Death saves`, `Inspiration`, `Succ`, `Fail`).
- Standard 5e initialisms and units (HP, AC, DEX, ft) remain uppercase.
- Prohibit CSS `uppercase` / ALL-CAPS on card headings, tags, or button labels.
- File line endings CRLF.
- All 37 test files must remain green.

## Review Focus
- Accordion section header label matches `Combat Stats` exactly.
- Initiative label shows `Initiative` on desktop/tablet and `Init` on mobile without layout shift.
- Action buttons `Damage` and `Heal` retain high visual contrast and correct aria-labels.
- Edit mode inputs and labels (`Current`, `Base max`, `Max HP buff`, `Temp HP`) remain fully accessible and functional.
- Documentation in `AGENTS.md` and `docs/superpowers/specs/2026-10-31-visual-guidelines.md` accurately reflects the convention.

---

### Task 1: Rename Accordion Header to "Combat Stats"

**Files:**
- Modify: `src/components/CharacterSheet/CharacterSheetView.jsx`
- Modify: `src/components/CharacterSheet/CharacterSheetView.test.jsx`

**Interfaces:**
- Consumes: `AccordionSection` component.
- Produces: Accordion title `"Combat Stats"`.

- [ ] **Step 1: Write failing test in `CharacterSheetView.test.jsx`**

Update toggle test to look for `Combat Stats` instead of `Combat Vitals & Formulations`:
```javascript
const vitalsToggle = screen.getByLabelText('Collapse Combat Stats');
expect(vitalsToggle).toBeInTheDocument();
fireEvent.click(vitalsToggle);
expect(screen.getByLabelText('Expand Combat Stats')).toBeInTheDocument();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/CharacterSheet/CharacterSheetView.test.jsx --run`
Expected: FAIL looking for `Collapse Combat Stats`.

- [ ] **Step 3: Update `CharacterSheetView.jsx`**

Change AccordionSection title:
```jsx
<AccordionSection
  title="Combat Stats"
  icon={Heart}
  defaultOpen={true}
  ...
```

- [ ] **Step 4: Run test to verify it passes**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/CharacterSheet/CharacterSheetView.test.jsx --run`
Expected: PASS

---

### Task 2: Standardize `VitalsCard.jsx` to Sentence Case and Responsive Initiative

**Files:**
- Modify: `src/components/CharacterSheet/VitalsCard.jsx`
- Modify: `src/components/CharacterSheet/VitalsCard.test.jsx`

**Interfaces:**
- Consumes: `currentVitals`, `formatModifier`, `getAbilityModifier`.
- Produces: Sentence-case labels (`Hit points`, `Damage`, `Heal`, `Speed`, `Hit dice`, `Death saves`, `Inspiration`), responsive Initiative `<span className="hidden sm:inline">Initiative</span><span className="sm:hidden">Init</span>`, and clean edit mode labels.

- [ ] **Step 1: Write failing test for new labels in `VitalsCard.test.jsx`**

Add assertions in `VitalsCard.test.jsx` checking for `Hit points`, `Speed`, `Hit dice`, `Death saves`, and responsive initiative labels.

- [ ] **Step 2: Run test to verify it fails**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx --run`
Expected: FAIL looking for new sentence-case strings.

- [ ] **Step 3: Update `VitalsCard.jsx`**

- Hero Card:
  - Header: `<Heart size={12} className="text-red-400 fill-red-400/20" /> Hit points`
  - Buff tag: `{hpMaxBuff > 0 ? `+${hpMaxBuff} buff` : `${hpMaxBuff} buff`}`
  - Secondary numbers: `/ {baseMax} max`, `+{hpTemp} temp`
  - Edit mode labels: `Current`, `Base max`, `Max HP buff`, `Temp HP`, `Effective max:`
- Action capsule:
  - Damage button: remove `uppercase tracking-wider`
  - Heal button: remove `uppercase tracking-wider`
- Paired card:
  - Initiative header: `<Zap size={11} className="text-dnd-gold" /> <span className="hidden sm:inline">Initiative</span><span className="sm:hidden">Init</span>`
  - Speed header: `<Footprints size={11} className="text-emerald-400" /> Speed`
  - Subtext: `Dex mod` / `Override`, `Walking`
- Trackers strip:
  - Hit Dice header: `<span className="text-[10px] font-bold text-slate-400">Hit dice</span>` (remove `uppercase tracking-wider`)
  - Death Saves header: `<Activity size={11} className="text-red-400" /> Death saves` (remove `uppercase tracking-wider`)
  - Death Saves status: `Succ`, `Fail` (remove `uppercase`)
  - Inspiration header: `<Sparkles size={11} className="text-dnd-gold" /> Inspiration` (remove `uppercase tracking-wider`)
- Defenses & Conditions headers:
  - `Damage defenses`, `Conditions`

- [ ] **Step 4: Run test to verify it passes**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx --run`
Expected: PASS

---

### Task 3: Codify Guidelines in Visual Guidelines Spec and `AGENTS.md`

**Files:**
- Modify: `docs/superpowers/specs/2026-10-31-visual-guidelines.md`
- Modify: `AGENTS.md`

**Interfaces:**
- Consumes: Visual standards decisions.
- Produces: Updated design guidelines and agent instructions.

- [ ] **Step 1: Update `docs/superpowers/specs/2026-10-31-visual-guidelines.md`**

- Update section table: `Combat Vitals & Formulations` -> `Combat Stats`.
- Update Core Principle 2: Define Title Case for accordion sections/dialog titles, sentence case for inner card labels, stat badges, field labels, and buttons. Prohibit CSS `uppercase` / ALL-CAPS inside cards. Explicitly document standard game initialisms (HP, AC, DEX, STR, CON, INT, WIS, CHA, ft) as remaining uppercase.

- [ ] **Step 2: Update `AGENTS.md`**

In `## UI conventions`, update the Accordion Panels & Visual Guidelines bullet point to mandate Title Case for accordion titles and sentence case for inner card labels, prohibiting all-caps / uppercase CSS.

---

### Task 4: Full Suite Verification & Build

**Files:**
- Test all components and integration suite.

- [ ] **Step 1: Run full test suite**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- --run`
Expected: 37 test files, all tests passing.

- [ ] **Step 2: Run production build**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd run build`
Expected: Clean build with exit code 0.

- [ ] **Step 3: Update `HANDOFF.md`**

Update `HANDOFF.md` to document the Combat Stats header rename, sentence-case standardization, and visual guidelines documentation.
