# Combined AC & Initiative + Dedicated Speeds Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Combine Armor Class and Initiative into a stacked card, and create a dedicated Movement Speeds card supporting Walking plus optional, addable 5e movement modes (Climbing, Swimming, Flying, Burrowing) in Row 1 of the Combat Stats accordion.

**Architecture:** Row 1 of `VitalsCard.jsx` transitions from 3 cards (`[HP]`, `[AC]`, `[Initiative + Speed]`) to 3 updated cards: `[HP Hero Card]`, `[AC & Initiative Card]`, and `[Dedicated Movement Speeds Card]`. Speed storage supports both legacy numeric `vitals.speed: 30` and structured `vitals.speeds = { walk: 30, ... }` with backward compatibility.

**Tech Stack:** React 18, Tailwind CSS, Lucide icons (`Shield`, `Zap`, `Footprints`, `Plus`, `X`), Vitest, `@testing-library/react`.

**Spec:** `docs/superpowers/specs/2026-11-01-ac-initiative-speeds-card-design.md`

## Global Constraints
- Accordion panels and labels strictly adhere to Title Case (`Combat Stats`, `Armor Class`, `Initiative`, `Walking`, `Climbing`, `Swimming`, `Flying`, `Burrowing`, `+ Speed`).
- Standard 5e initialisms (`HP`, `AC`, `DEX`, `ft`) remain uppercase.
- Number inputs have native browser spin buttons suppressed.
- No destructive or confirmation dialogs; speed removals are immediate or inline.
- Files use CRLF line endings.

## Review Focus
1. Legacy character profile loading with numeric `speed: 30` displays Walking `30 ft` without errors.
2. Removing an optional speed leaves Walking speed untouched.
3. Adding duplicate movement modes is prevented (dropdown filters out already-added modes).
4. Long AC formula notes do not clip or break Initiative layout underneath.
5. All 5e speed inputs clamp to positive integers (`>= 0`).

---

### Task 1: Movement Speeds Data Normalization & Backward Compatibility

**Files:**
- Modify: `src/utils/storage.js:100-115`
- Test: `src/utils/storage.test.js`

**Interfaces:**
- Consumes: `vitals` object from character storage.
- Produces: `normalizeSpeeds(vitals)` returning `{ walk: number, ...optionalSpeeds }`.

- [ ] **Step 1: Write the failing tests**

```javascript
// in src/utils/storage.test.js
it('normalizes legacy vitals.speed into speeds object with walk', () => {
  const legacyVitals = { speed: 30 };
  const normalized = normalizeSpeeds(legacyVitals);
  expect(normalized).toEqual({ walk: 30 });
});

it('preserves existing vitals.speeds object with secondary modes', () => {
  const modernVitals = { speeds: { walk: 30, fly: 60 } };
  const normalized = normalizeSpeeds(modernVitals);
  expect(normalized).toEqual({ walk: 30, fly: 60 });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- src/utils/storage.test.js --run`
Expected: FAIL with `normalizeSpeeds is not defined`.

- [ ] **Step 3: Implement `normalizeSpeeds` in `src/utils/storage.js`**

Implement `normalizeSpeeds(vitals)`:
- If `vitals.speeds` is an object, ensure `walk` has a numeric fallback (default 30), and filter out invalid/negative values.
- Else if `typeof vitals.speed === 'number'`, return `{ walk: vitals.speed }`.
- Else return `{ walk: 30 }`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- src/utils/storage.test.js --run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/storage.js src/utils/storage.test.js
git commit -m "feat(vitals): normalize movement speeds with legacy fallback"
```

---

### Task 2: Combined AC & Initiative Card

**Files:**
- Modify: `src/components/CharacterSheet/VitalsCard.jsx:420-560`
- Test: `src/components/CharacterSheet/VitalsCard.test.jsx`

**Interfaces:**
- Consumes: `currentVitals.ac`, `currentVitals.acFormula`, `currentVitals.initiativeOverride`, DEX mod calculation.
- Produces: Single combined card containing AC hero and Initiative pill row.

- [ ] **Step 1: Write the failing test**

```javascript
// in src/components/CharacterSheet/VitalsCard.test.jsx
it('renders combined AC and Initiative in the same card container', () => {
  render(<VitalsCard vitals={{ ac: 15, acFormula: '10 + 2 DEX + 3 Armor', initiativeOverride: null }} dexScore={14} />);
  expect(screen.getByText('15')).toBeInTheDocument();
  expect(screen.getByText('10 + 2 DEX + 3 Armor')).toBeInTheDocument();
  expect(screen.getByText('Initiative')).toBeInTheDocument();
  expect(screen.getByText('+2')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx --run`
Expected: Passes or fails depending on structural expectations.

- [ ] **Step 3: Refactor Card 2 into Combined AC & Initiative in `VitalsCard.jsx`**

- Top half:
  - Header: `Shield` icon, `AC`, `+ Note` button.
  - Large number: `currentVitals.ac ?? 10` in `text-2xl font-black text-slate-100`.
  - AC Formula note display / editable textarea.
- Bottom half (Initiative pill/row):
  - Subtle divider or separate container (`border-t border-white/5 pt-1.5 mt-1 flex items-center justify-between`).
  - Left: `Zap` icon (11px, `text-dnd-gold`), `Initiative` label in `text-[10px] text-slate-400 font-bold`.
  - Right: Initiative modifier in `text-sm font-bold text-slate-100` (`+2`), with override input in edit mode.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx --run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/CharacterSheet/VitalsCard.jsx src/components/CharacterSheet/VitalsCard.test.jsx
git commit -m "feat(vitals): combine AC and Initiative into single card"
```

---

### Task 3: Dedicated Movement Speeds Card with Optional Addable Modes

**Files:**
- Modify: `src/components/CharacterSheet/VitalsCard.jsx:560-630`
- Test: `src/components/CharacterSheet/VitalsCard.test.jsx`

**Interfaces:**
- Consumes: `currentVitals.speeds`, `normalizeSpeeds`.
- Produces: Speeds card with base Walking speed hero on left, and optional modes on right with `+ Speed` adder and remove buttons.

- [ ] **Step 1: Write failing tests for Speeds card**

```javascript
// in src/components/CharacterSheet/VitalsCard.test.jsx
it('renders walking speed and allows adding/removing optional secondary movement modes', () => {
  const onUpdateVitals = vi.fn();
  render(<VitalsCard vitals={{ speeds: { walk: 30, fly: 60 } }} onUpdateVitals={onUpdateVitals} isEditing={true} />);

  expect(screen.getByText('30 ft')).toBeInTheDocument();
  expect(screen.getByText('Walking')).toBeInTheDocument();
  expect(screen.getByText('Fly 60 ft')).toBeInTheDocument();

  // Remove fly speed
  const removeFlyBtn = screen.getByLabelText('Remove Fly speed');
  fireEvent.click(removeFlyBtn);
  expect(onUpdateVitals).toHaveBeenCalledWith(expect.objectContaining({
    speeds: { walk: 30 }
  }));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx --run`
Expected: FAIL.

- [ ] **Step 3: Implement Dedicated Movement Speeds Card in `VitalsCard.jsx`**

1. Movement Speeds constants:
   ```javascript
   const OPTIONAL_SPEED_TYPES = [
     { key: 'climb', label: 'Climbing' },
     { key: 'swim', label: 'Swimming' },
     { key: 'fly', label: 'Flying' },
     { key: 'burrow', label: 'Burrowing' },
   ];
   ```
2. Card layout:
   - Header: `Footprints` icon in emerald-400, Title Case `Speed` label. Top right: `+ Speed` button if any optional speed is not yet added.
   - Main body: Split into 2 columns:
     - Left column: Large `walk` speed (`30 ft`, `Walking` subtitle). When in edit mode, input field for walk speed.
     - Right column:
       - Vertical stack of configured optional speeds: `${label} ${val} ft` with remove `X` icon.
       - Inline add drawer when `isAddingSpeed` is true: dropdown with unadded types, numeric input for distance (default `30`), `Add` and `Cancel` buttons. Closes on click outside / Escape.
3. Row 1 grid template:
   - Update `lg:grid-cols-[12fr_5fr_7fr]` or `lg:grid-cols-[11fr_5fr_8fr]`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx --run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/CharacterSheet/VitalsCard.jsx src/components/CharacterSheet/VitalsCard.test.jsx
git commit -m "feat(vitals): add dedicated movement speeds card with addable 5e modes"
```

---

### Task 4: Full Suite Verification & Build

**Files:**
- Modify: `HANDOFF.md`

- [ ] **Step 1: Run all unit & integration tests**

Run: `npm.cmd test -- --run`
Expected: All 37 test files passing.

- [ ] **Step 2: Run production build**

Run: `npm.cmd run build`
Expected: Production build succeeds with 0 errors.

- [ ] **Step 3: Update `HANDOFF.md` and commit**

Update `HANDOFF.md` with Row 1 Combat Stats architecture changes.
```bash
git add HANDOFF.md
git commit -m "docs: update handoff for combined AC/Init and 5e movement speeds"
```
