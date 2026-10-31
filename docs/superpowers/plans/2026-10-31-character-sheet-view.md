# Character Sheet View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the left-pane modular Character Sheet view with dynamic D&D 5e companion calculations, interactive tracked resource steppers, and a chip-based inventory with spellbook-style ivory glowing bookmark strips for attuned items.

**Architecture:** Extend character profiles in `src/utils/storage.js` with an optional `sheet` property (migrated seamlessly for existing profiles). Implement pure calculation helpers in `src/utils/dndCalculations.js`. Create modular, self-contained cards under `src/components/CharacterSheet/` (`VitalsCard`, `AbilitiesCard`, `ResourcesCard`, `ItemsCard`). Add a top-level left-pane view toggle in `src/App.jsx` switching between the Spell Grimoire and the Character Sheet.

**Tech Stack:** React 18, Tailwind CSS, Lucide icons, Vitest, React Testing Library.

**Spec:** `docs/superpowers/mockups/sheet-approach-1.html` & user requirements from conversation checkpoint.

## Global Constraints

- Never use regex or PowerShell text replaces on JSX files.
- Do not add external math or rich text dependencies when native React state and CSS suffice.
- Attuned items MUST feature an ivory-white glowing bookmark strip on the left edge (`#EFE9E0` with `shadow-[0_0_8px_rgba(239,233,224,0.65)]`), matching `SpellbookCard.jsx`.
- Existing profiles must seamlessly load without data loss or exceptions if `sheet` data is absent.
- All test suites must remain green (`npm.cmd test -- --run`).

## Review Focus

- Missing or corrupted `sheet` payload in existing saved profile fallback to sane defaults.
- Attuning an item when at max attunement capacity (prevent exceeding max unless confirmed or allowed).
- Ability modifier calculation for edge-case scores (e.g., score 1 -> -5, score 10 -> 0, score 20 -> +5, score 30 -> +10).
- Level change in character header dynamically recalculating proficiency bonus and save totals while preserving custom overrides.
- Freeform vital formula changes persisting directly to localStorage without clobbering other character properties.

---

### Task 1: D&D 5e Core Calculation Engine & Tests

**Files:**
- Create: `src/utils/dndCalculations.js`
- Test: `src/utils/dndCalculations.test.js`

**Interfaces:**
- Produces:
  - `getProficiencyBonus(level: number): number`
  - `getAbilityModifier(score: number): number`
  - `formatModifier(mod: number): string`
  - `calculateSave(score: number, isProficient: boolean, level: number, override?: number): number`

- [ ] **Step 1: Write the failing test**

```javascript
// src/utils/dndCalculations.test.js
import { describe, it, expect } from 'vitest';
import {
  getProficiencyBonus,
  getAbilityModifier,
  formatModifier,
  calculateSave,
} from './dndCalculations';

describe('dndCalculations', () => {
  it('calculates proficiency bonus by level', () => {
    expect(getProficiencyBonus(1)).toBe(2);
    expect(getProficiencyBonus(4)).toBe(2);
    expect(getProficiencyBonus(5)).toBe(3);
    expect(getProficiencyBonus(9)).toBe(4);
    expect(getProficiencyBonus(13)).toBe(5);
    expect(getProficiencyBonus(17)).toBe(6);
    expect(getProficiencyBonus(20)).toBe(6);
  });

  it('calculates ability modifiers accurately across standard and extreme scores', () => {
    expect(getAbilityModifier(1)).toBe(-5);
    expect(getAbilityModifier(8)).toBe(-1);
    expect(getAbilityModifier(9)).toBe(-1);
    expect(getAbilityModifier(10)).toBe(0);
    expect(getAbilityModifier(11)).toBe(0);
    expect(getAbilityModifier(12)).toBe(1);
    expect(getAbilityModifier(19)).toBe(4);
    expect(getAbilityModifier(20)).toBe(5);
    expect(getAbilityModifier(30)).toBe(10);
  });

  it('formats modifiers with explicit signs', () => {
    expect(formatModifier(3)).toBe('+3');
    expect(formatModifier(0)).toBe('+0');
    expect(formatModifier(-2)).toBe('-2');
  });

  it('calculates saving throws correctly with and without proficiency', () => {
    expect(calculateSave(10, false, 5)).toBe(0);
    expect(calculateSave(14, false, 5)).toBe(2);
    expect(calculateSave(14, true, 5)).toBe(5); // +2 mod + 3 prof
    expect(calculateSave(20, true, 19)).toBe(11); // +5 mod + 6 prof
    expect(calculateSave(14, true, 5, 9)).toBe(9); // respects manual override
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/utils/dndCalculations.test.js`
Expected: FAIL with module not found

- [ ] **Step 3: Implement `src/utils/dndCalculations.js`**

Implement pure functions:
- `getProficiencyBonus(level)`: `Math.floor((Math.max(1, Math.min(20, Number(level) || 1)) - 1) / 4) + 2`
- `getAbilityModifier(score)`: `Math.floor(((Number(score) || 10) - 10) / 2)`
- `formatModifier(mod)`: `mod >= 0 ? `+${mod}` : `${mod}``
- `calculateSave(score, isProficient, level, override)`: `typeof override === 'number' ? override : getAbilityModifier(score) + (isProficient ? getProficiencyBonus(level) : 0)`

- [ ] **Step 4: Run test to verify it passes**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/utils/dndCalculations.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/dndCalculations.js src/utils/dndCalculations.test.js
git commit -m "feat: add D&D 5e calculation helpers"
```

---

### Task 2: Character Sheet Profile Data Schema & Default Migration

**Files:**
- Modify: `src/utils/storage.js`
- Test: `src/utils/storage.test.js`

**Interfaces:**
- Consumes: `src/utils/storage.js`
- Produces:
  - `createDefaultSheet(className?: string): CharacterSheetData`
  - Updated `createDefaultProfile` and `loadCharacterProfiles` ensuring default `sheet` presence without crashing existing profiles.

- [ ] **Step 1: Write the failing tests in `src/utils/storage.test.js`**

Add tests:
- `createDefaultSheet()` returns complete initial structure with `vitals`, `abilities`, `trackedResources`, `featuresNotes`, `items`, and `maxAttunement: 3`.
- `loadCharacterProfiles()` populates a default `sheet` for legacy profiles where `sheet` is undefined.

- [ ] **Step 2: Run test to verify it fails**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/utils/storage.test.js`
Expected: FAIL

- [ ] **Step 3: Update `src/utils/storage.js`**

Export `createDefaultSheet(className)`:
```javascript
export function createDefaultSheet(className = 'Wizard') {
  const defaultProficientSaves = {
    Wizard: ['int', 'wis'],
    Sorcerer: ['con', 'cha'],
    Warlock: ['wis', 'cha'],
    Cleric: ['wis', 'cha'],
    Druid: ['int', 'wis'],
    Bard: ['dex', 'cha'],
    Paladin: ['wis', 'cha'],
    Ranger: ['str', 'dex'],
    Fighter: ['str', 'con'],
    Barbarian: ['str', 'con'],
    Rogue: ['dex', 'int'],
    Monk: ['str', 'dex'],
  }[className] || ['int', 'wis'];

  return {
    vitals: {
      hpCurrent: 10,
      hpMax: 10,
      hpTemp: 0,
      ac: 10,
      acFormula: '',
      conditions: {
        exhaustion: 0,
        inspiration: false,
        heroicInspiration: false,
      },
    },
    abilities: {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10,
      saveProficiencies: defaultProficientSaves,
      overrides: {},
    },
    trackedResources: [],
    featuresNotes: '',
    items: [],
    maxAttunement: 3,
  };
}
```
Update `createDefaultProfile` to assign `sheet: createDefaultSheet(className)`.
Update `loadCharacterProfiles` to ensure any profile without `p.sheet` receives `createDefaultSheet(p.className)`.

- [ ] **Step 4: Run test to verify it passes**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/utils/storage.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/storage.js src/utils/storage.test.js
git commit -m "feat: expand character storage schema with sheet defaults"
```

---

### Task 3: Vitals & Formulas Card Component

**Files:**
- Create: `src/components/CharacterSheet/VitalsCard.jsx`
- Test: `src/components/CharacterSheet/VitalsCard.test.jsx`

**Interfaces:**
- Consumes:
  - `vitals: CharacterSheetData['vitals']`
  - `onUpdateVitals: (updatedVitals) => void`
- Produces:
  - Editable HP (Current, Max, Temp), AC (value + formula breakdown), Exhaustion stepper, and Inspiration toggles.

- [ ] **Step 1: Write the failing tests**

```javascript
// src/components/CharacterSheet/VitalsCard.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import VitalsCard from './VitalsCard';

describe('VitalsCard', () => {
  const mockVitals = {
    hpCurrent: 45,
    hpMax: 50,
    hpTemp: 10,
    ac: 16,
    acFormula: '14 + 2 DEX',
    conditions: {
      exhaustion: 1,
      inspiration: true,
      heroicInspiration: false,
    },
  };

  it('renders HP, AC, and condition values', () => {
    render(<VitalsCard vitals={mockVitals} onUpdateVitals={() => {}} />);
    expect(screen.getByDisplayValue('45')).toBeInTheDocument();
    expect(screen.getByText('/ 50')).toBeInTheDocument();
    expect(screen.getByDisplayValue('16')).toBeInTheDocument();
  });

  it('triggers update callback when HP changes', () => {
    const handleUpdate = vi.fn();
    render(<VitalsCard vitals={mockVitals} onUpdateVitals={handleUpdate} />);
    const hpInput = screen.getByDisplayValue('45');
    fireEvent.change(hpInput, { target: { value: '40' } });
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({ hpCurrent: 40 }));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx`
Expected: FAIL

- [ ] **Step 3: Implement `src/components/CharacterSheet/VitalsCard.jsx`**

Implement styled card matching `sheet-approach-1.html` vitals card with clean numeric inputs for HP and AC formula breakdown.

- [ ] **Step 4: Run test to verify it passes**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/CharacterSheet/VitalsCard.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/CharacterSheet/VitalsCard.jsx src/components/CharacterSheet/VitalsCard.test.jsx
git commit -m "feat: add VitalsCard component for combat math"
```

---

### Task 4: Ability Scores & Saves Card Component

**Files:**
- Create: `src/components/CharacterSheet/AbilitiesCard.jsx`
- Test: `src/components/CharacterSheet/AbilitiesCard.test.jsx`

**Interfaces:**
- Consumes:
  - `abilities: CharacterSheetData['abilities']`
  - `level: number`
  - `onUpdateAbilities: (updatedAbilities) => void`
  - `src/utils/dndCalculations.js`
- Produces:
  - 6-column grid for STR, DEX, CON, INT, WIS, CHA.
  - Auto-calculated modifier and saving throw display.
  - Proficient save indicator dot. Clicking dot toggles saving throw proficiency.
  - Ability score inline number editing.

- [ ] **Step 1: Write the failing tests**

```javascript
// src/components/CharacterSheet/AbilitiesCard.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import AbilitiesCard from './AbilitiesCard';

describe('AbilitiesCard', () => {
  const mockAbilities = {
    str: 10,
    dex: 14,
    con: 16,
    int: 20,
    wis: 12,
    cha: 8,
    saveProficiencies: ['int', 'wis'],
    overrides: {},
  };

  it('renders all 6 ability scores with calculated modifiers and saves at level 10', () => {
    render(<AbilitiesCard abilities={mockAbilities} level={10} onUpdateAbilities={() => {}} />);
    // INT 20 at lvl 10 has mod +5 and prof +4 -> Save +9
    expect(screen.getByText('INT')).toBeInTheDocument();
    expect(screen.getByDisplayValue('20')).toBeInTheDocument();
    expect(screen.getByText('+5 mod')).toBeInTheDocument();
    expect(screen.getByText('Save +9')).toBeInTheDocument();
  });

  it('allows toggling save proficiency', () => {
    const handleUpdate = vi.fn();
    render(<AbilitiesCard abilities={mockAbilities} level={10} onUpdateAbilities={handleUpdate} />);
    const conToggle = screen.getByLabelText('Toggle CON save proficiency');
    fireEvent.click(conToggle);
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      saveProficiencies: expect.arrayContaining(['int', 'wis', 'con'])
    }));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/CharacterSheet/AbilitiesCard.test.jsx`
Expected: FAIL

- [ ] **Step 3: Implement `src/components/CharacterSheet/AbilitiesCard.jsx`**

Implement 6 ability tiles utilizing `getAbilityModifier`, `formatModifier`, and `calculateSave`. Include toggleable indicator for proficiency.

- [ ] **Step 4: Run test to verify it passes**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/CharacterSheet/AbilitiesCard.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/CharacterSheet/AbilitiesCard.jsx src/components/CharacterSheet/AbilitiesCard.test.jsx
git commit -m "feat: add AbilitiesCard with dynamic modifiers and save toggles"
```

---

### Task 5: Tracked Resources & Notes Card Component

**Files:**
- Create: `src/components/CharacterSheet/ResourcesCard.jsx`
- Test: `src/components/CharacterSheet/ResourcesCard.test.jsx`

**Interfaces:**
- Consumes:
  - `trackedResources: Array<{ id, name, current, max, resetOn }>`
  - `featuresNotes: string`
  - `onUpdateResources: (resources) => void`
  - `onUpdateNotes: (notes) => void`
- Produces:
  - Quick stepper tiles with `+` / `-` buttons for tracked resources.
  - Add Resource button / modal.
  - Freeform editable textarea for notes/feats/features.

- [ ] **Step 1: Write the failing tests**

```javascript
// src/components/CharacterSheet/ResourcesCard.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ResourcesCard from './ResourcesCard';

describe('ResourcesCard', () => {
  const mockResources = [
    { id: 'res_1', name: 'Lucky', current: 2, max: 3, resetOn: 'LR' },
  ];

  it('renders tracked resources and increments counter on click', () => {
    const handleUpdate = vi.fn();
    render(
      <ResourcesCard
        trackedResources={mockResources}
        featuresNotes="Sample feature notes"
        onUpdateResources={handleUpdate}
        onUpdateNotes={() => {}}
      />
    );
    expect(screen.getByText('Lucky')).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();

    const incBtn = screen.getByLabelText('Increment Lucky');
    fireEvent.click(incBtn);
    expect(handleUpdate).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'res_1', current: 3 }),
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/CharacterSheet/ResourcesCard.test.jsx`
Expected: FAIL

- [ ] **Step 3: Implement `src/components/CharacterSheet/ResourcesCard.jsx`**

Implement resource stepper grid, resource creation form, and auto-expanding note box.

- [ ] **Step 4: Run test to verify it passes**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/CharacterSheet/ResourcesCard.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/CharacterSheet/ResourcesCard.jsx src/components/CharacterSheet/ResourcesCard.test.jsx
git commit -m "feat: add ResourcesCard with interactive steppers and rich notes"
```

---

### Task 6: Items & Attunement Card Component (Bookmark Glow Strips)

**Files:**
- Create: `src/components/CharacterSheet/ItemsCard.jsx`
- Test: `src/components/CharacterSheet/ItemsCard.test.jsx`

**Interfaces:**
- Consumes:
  - `items: Array<{ id, name, attuned, requiresAttunement, category, quantity, note }>`
  - `maxAttunement: number`
  - `onUpdateItems: (items) => void`
- Produces:
  - "Manage Attunement" mode toggle button.
  - Attunement counter badge (`X / 3`).
  - Item chips categorized into Magic Items, Consumables, and Mundane.
  - Left bookmark subdivision strip on attunable item chips:
    - Attuned: `bg-[#EFE9E0] shadow-[0_0_8px_rgba(239,233,224,0.65)]` + `ring-1 ring-white/20`.
    - Unattuned: `bg-white/10`.
  - Add Item inline modal/drawer.

- [ ] **Step 1: Write the failing tests**

```javascript
// src/components/CharacterSheet/ItemsCard.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ItemsCard from './ItemsCard';

describe('ItemsCard', () => {
  const mockItems = [
    { id: 'itm_1', name: 'The Tuvala Sundial', requiresAttunement: true, attuned: true, category: 'magic', quantity: 1 },
    { id: 'itm_2', name: 'Gauntlets of Ogre Power', requiresAttunement: true, attuned: false, category: 'magic', quantity: 1 },
    { id: 'itm_3', name: 'Potion of Greater Healing', requiresAttunement: false, attuned: false, category: 'consumable', quantity: 2 },
  ];

  it('renders items with attunement count and bookmark glow on attuned items', () => {
    render(<ItemsCard items={mockItems} maxAttunement={3} onUpdateItems={() => {}} />);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    expect(screen.getByText('The Tuvala Sundial')).toBeInTheDocument();

    const attunedChip = screen.getByTestId('item-chip-itm_1');
    const bookmark = attunedChip.querySelector('[data-testid="attunement-bookmark-strip"]');
    expect(bookmark.className).toContain('bg-[#EFE9E0]');
  });

  it('toggles attunement when in Manage Attunement mode', () => {
    const handleUpdate = vi.fn();
    render(<ItemsCard items={mockItems} maxAttunement={3} onUpdateItems={handleUpdate} />);
    const manageBtn = screen.getByRole('button', { name: /manage attunement/i });
    fireEvent.click(manageBtn);

    const unattunedChip = screen.getByTestId('item-chip-itm_2');
    fireEvent.click(unattunedChip);

    expect(handleUpdate).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ id: 'itm_2', attuned: true }),
    ]));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/CharacterSheet/ItemsCard.test.jsx`
Expected: FAIL

- [ ] **Step 3: Implement `src/components/CharacterSheet/ItemsCard.jsx`**

Implement attunement management mode, category sections, add item dialog, and glowing ivory bookmark strips matching `SpellbookCard.jsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/CharacterSheet/ItemsCard.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/CharacterSheet/ItemsCard.jsx src/components/CharacterSheet/ItemsCard.test.jsx
git commit -m "feat: add ItemsCard with interactive attunement chips and bookmark glow"
```

---

### Task 7: CharacterSheetView Assembly & Left-Pane Integration in App

**Files:**
- Create: `src/components/CharacterSheet/CharacterSheetView.jsx`
- Modify: `src/App.jsx`
- Test: `src/components/CharacterSheet/CharacterSheetView.test.jsx`
- Test: `src/App.test.jsx`

**Interfaces:**
- Consumes:
  - `VitalsCard`, `AbilitiesCard`, `ResourcesCard`, `ItemsCard`
  - `activeCharacter` and `updateActiveCharacter` from `src/App.jsx`
- Produces:
  - Left-pane view toggle (Grimoire vs Sheet).
  - Clean modular card grid view in left pane.

- [ ] **Step 1: Write the failing tests**

Write `src/components/CharacterSheet/CharacterSheetView.test.jsx` verifying assembly of all 4 modular cards.
Add tests in `src/App.test.jsx` verifying toggling the left pane between "Grimoire" and "Character Sheet" views.

- [ ] **Step 2: Run test to verify it fails**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- src/components/CharacterSheet/CharacterSheetView.test.jsx`
Expected: FAIL

- [ ] **Step 3: Implement `CharacterSheetView.jsx` and wire into `src/App.jsx`**

1. Create `src/components/CharacterSheet/CharacterSheetView.jsx` combining sticky profile header (name, class, level, proficiency bonus) and scrollable card grid.
2. Add `leftPaneView` state in `src/App.jsx` (`'spells'` | `'sheet'`).
3. Add segmented toggle in header.
4. Render `CharacterSheetView` when `leftPaneView === 'sheet'`.

- [ ] **Step 4: Run test to verify it passes**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- --run`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/CharacterSheet/ src/App.jsx src/App.test.jsx
git commit -m "feat: integrate Character Sheet view into left pane with view toggle"
```

---

### Task 8: Full Verification & Build Check

**Files:**
- None (verification only)

- [ ] **Step 1: Run complete test suite**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- --run`
Expected: 28+ test files, 160+ tests passing.

- [ ] **Step 2: Run production build**

Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd run build`
Expected: Clean exit 0.
