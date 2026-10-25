# D&D 5e Spellbook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fast, offline-capable D&D 5e Spellbook web application with searchable/filterable spell list, drag-and-drop spellbook manager, and automated/manual spell slot tracker.

**Architecture:** Client-side React SPA powered by Vite and Tailwind CSS. Preprocessed static JSON catalog sourced from 5etools spells repository. LocalStorage for persistent character state and JSON import/export for data portability. Native HTML5 Drag and Drop for frictionless spell management.

**Tech Stack:** React 18/19, Vite, Tailwind CSS, Lucide React, Vitest for unit testing.

**Spec:** `docs/superpowers/specs/2026-10-25-dnd-spellbook-prd.md`

## Global Constraints
- **Platform**: Client-only Single Page Application (zero required backend server).
- **Theme**: Dark fantasy aesthetic with clean contrast (zinc/slate background, amber/gold accents).
- **Data format**: Clean normalized spell objects with 5etools tags (`{@spell ...}`, `{@dice ...}`) converted to clean human text.
- **Persistence**: Continuous auto-save to `localStorage` under `dnd_spellbook_data` namespace.
- **Portability**: Validated JSON import and formatted JSON export.
- **Dependencies**: Native browser APIs preferred (HTML5 drag-and-drop over heavy libraries).

## Review Focus
1. **Empty or Corrupted LocalStorage**: App initializes with a default valid character profile rather than crashing on invalid or empty JSON in storage.
2. **Missing Spell Slot on Quick-Cast**: When a player attempts to quick-cast a level N spell but has 0 remaining level N slots, show clear feedback instead of silent failure or negative slot counts.
3. **Drag and Drop Duplicate Prevention**: Dragging a spell already present in the character's spellbook must highlight/notify rather than duplicate the spell entry.
4. **5etools Tag Cleanser Resilience**: Complex or nested 5etools tags (`{@dice 1d6}`, `{@condition charmed}`, `{@spell fireball|phb}`) must all cleanly convert to plain text strings.
5. **Class Spell Progression Edge Cases**: Full casters (Wizard, Cleric), half casters (Paladin, Ranger), and non-standard/pact casters (Warlock) must correctly calculate their default 5e spell slots table for levels 1-20.

---

### Task 1: Project Scaffolding & Test Setup

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `tailwind.config.js`, `postcss.config.js`, `src/index.css`, `src/main.jsx`, `src/App.jsx`
- Test: `src/App.test.jsx`

**Interfaces:**
- Produces: Runnable Vite development server and Vitest test runner.

- [ ] **Step 1: Initialize Vite React project with dependencies**
  Install `react`, `react-dom`, `lucide-react`, and dev dependencies `vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`, `vitest`, `@testing-library/react`, `jsdom`.

- [ ] **Step 2: Configure Tailwind CSS and PostCSS**
  Create `tailwind.config.js` and `postcss.config.js`, and import Tailwind directives into `src/index.css`.

- [ ] **Step 3: Write baseline App test**
  Write failing test in `src/App.test.jsx` asserting that the app container renders with "D&D 5e Spellbook".

- [ ] **Step 4: Implement minimal App shell in `src/App.jsx`**
  Create basic header and two-column placeholder shell matching dark theme palette.

- [ ] **Step 5: Verify tests and dev build**
  Run `npx vitest run` to ensure test passes.

- [ ] **Step 6: Commit**
  ```bash
  git add .
  git commit -m "chore: scaffold Vite React Tailwind app with test setup"
  ```

---

### Task 2: 5etools Spell Data Ingestion Pipeline

**Files:**
- Create: `scripts/fetch-spells.mjs`
- Create: `src/utils/textCleaner.js`
- Test: `src/utils/textCleaner.test.js`
- Produces: `public/data/spells.json`

**Interfaces:**
- Produces: `clean5eText(text: string) -> string`
- Produces: `public/data/spells.json` containing array of `Spell` objects:
  ```ts
  interface Spell {
    id: string;
    name: string;
    level: number;
    school: string;
    time: string;
    range: string;
    components: { v: boolean; s: boolean; m: string | boolean };
    duration: string;
    concentration: boolean;
    ritual: boolean;
    classes: string[];
    entries: string[];
    higherLevels?: string;
  }
  ```

- [ ] **Step 1: Write unit tests for `clean5eText`**
  In `src/utils/textCleaner.test.js`: test cleansing of `{@damage 1d6}`, `{@condition charmed}`, `{@spell fireball|phb}`, `{@dice 1d20+4|18}`, and nested entries.

- [ ] **Step 2: Implement `clean5eText` in `src/utils/textCleaner.js`**
  Implement regex replacer that strips 5etools tag prefixes and extracts display labels/first arguments.

- [ ] **Step 3: Write data fetch script `scripts/fetch-spells.mjs`**
  Fetch `sources.json`, `spells-phb.json`, `spells-xge.json`, and `spells-tce.json` from `https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/master/data/spells/`. Map class lists from `sources.json`, format components, extract higher level text, and write formatted `public/data/spells.json`.

- [ ] **Step 4: Execute fetch script and verify output file**
  Run `node scripts/fetch-spells.mjs` and verify `public/data/spells.json` contains valid spells with proper fields and class arrays.

- [ ] **Step 5: Commit**
  ```bash
  git add scripts/ src/utils/ public/data/spells.json
  git commit -m "feat: add 5etools spell data ingestion pipeline and dataset"
  ```

---

### Task 3: Core Spell Slot Progression & Character State Engine

**Files:**
- Create: `src/utils/spellSlots.js`
- Create: `src/utils/storage.js`
- Test: `src/utils/spellSlots.test.js`
- Test: `src/utils/storage.test.js`

**Interfaces:**
- Produces: `calculateDefaultSlots(className: string, level: number) -> Record<number, number>`
- Produces: `loadCharacterProfiles() -> { profiles: CharacterProfile[], activeId: string }`
- Produces: `saveCharacterProfiles(data: { profiles: CharacterProfile[], activeId: string }) -> void`
- Produces: `createDefaultProfile(name?: string) -> CharacterProfile`

- [ ] **Step 1: Write tests for `calculateDefaultSlots`**
  In `src/utils/spellSlots.test.js`: Test Wizard level 1 (2 1st), level 5 (4 1st, 3 2nd, 2 3rd), Paladin level 2 (2 1st), Warlock level 5 (2 3rd level pact slots).

- [ ] **Step 2: Implement 5e spell slot table in `src/utils/spellSlots.js`**
  Implement progression rules for full casters (Wizard, Cleric, Druid, Sorcerer, Bard), half casters (Paladin, Ranger, Artificer), and Warlock (pact magic).

- [ ] **Step 3: Write tests for `storage.js`**
  In `src/utils/storage.test.js`: test fallback on empty `localStorage`, corrupted JSON handling, profile persistence and migration.

- [ ] **Step 4: Implement storage helper in `src/utils/storage.js`**
  Implement local storage getters/setters with safe try/catch and fallback default character profile generator.

- [ ] **Step 5: Run tests and verify**
  Run `npx vitest run` to verify all slot and storage tests pass.

- [ ] **Step 6: Commit**
  ```bash
  git add src/utils/
  git commit -m "feat: add spell slot progression engine and storage manager"
  ```

---

### Task 4: Left Segment - Spell Catalog & Filtering

**Files:**
- Create: `src/components/Catalog/SpellList.jsx`
- Create: `src/components/Catalog/SpellCard.jsx`
- Create: `src/components/Catalog/FilterBar.jsx`
- Create: `src/hooks/useSpellFilter.js`
- Test: `src/hooks/useSpellFilter.test.js`

**Interfaces:**
- Consumes: `Spell` list from `public/data/spells.json`
- Produces: `useSpellFilter(spells, filters) -> filteredSpells`
- Produces: `SpellCard` with draggable handle (`draggable`, `onDragStart={(e) => e.dataTransfer.setData('text/plain', spell.id)}`) and click handler for detail view.

- [ ] **Step 1: Write filter hook tests in `src/hooks/useSpellFilter.test.js`**
  Test searching by text, filtering by class (e.g. "Wizard"), level (e.g. 3), school (e.g. "evocation"), ritual toggle, and concentration toggle.

- [ ] **Step 2: Implement `useSpellFilter`**
  Memoized multi-criteria filter function matching search query against name, school, classes, and description text.

- [ ] **Step 3: Implement `FilterBar.jsx`**
  Search input with clear button, Level dropdown/chips (Cantrip, 1-9), Class dropdown, School dropdown, and Ritual / Concentration toggle badges.

- [ ] **Step 4: Implement `SpellCard.jsx` and `SpellList.jsx`**
  Card with spell level, school badge, casting time, range, draggable drag handle, "In Spellbook" indicator, and click action to open details.

- [ ] **Step 5: Run tests and verify catalog rendering**
  Run `npx vitest run`.

- [ ] **Step 6: Commit**
  ```bash
  git add src/components/Catalog/ src/hooks/
  git commit -m "feat: add spell catalog, filter bar, and draggable cards"
  ```

---

### Task 5: Slide-Over Spell Detail Drawer

**Files:**
- Create: `src/components/Modal/SpellDetailDrawer.jsx`
- Test: `src/components/Modal/SpellDetailDrawer.test.jsx`

**Interfaces:**
- Consumes: Selected `Spell` object, `isInSpellbook: boolean`, `onAddToSpellbook: (spellId) => void`, `onClose: () => void`.

- [ ] **Step 1: Write test for `SpellDetailDrawer.test.jsx`**
  Assert drawer renders spell name, level/school, components (V, S, M with text), casting time, range, duration, description paragraphs, and "Add to Spellbook" action.

- [ ] **Step 2: Implement `SpellDetailDrawer.jsx`**
  Overlay slide-over drawer with dark fantasy styling, close button (and Escape key listener), full component breakdown, entries list, and higher levels block.

- [ ] **Step 3: Verify drawer tests**
  Run `npx vitest run src/components/Modal/SpellDetailDrawer.test.jsx`.

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/Modal/
  git commit -m "feat: add slide-over spell detail drawer"
  ```

---

### Task 6: Right Segment - Character Spellbook & Drag and Drop

**Files:**
- Create: `src/components/Spellbook/SpellbookView.jsx`
- Create: `src/components/Spellbook/SpellbookLevelGroup.jsx`
- Create: `src/components/Spellbook/SpellbookCard.jsx`
- Test: `src/components/Spellbook/SpellbookView.test.jsx`

**Interfaces:**
- Consumes: `character: CharacterProfile`, `spellsCatalog: Record<string, Spell>`
- Produces: Drag target drop zone (`onDragOver`, `onDrop`), level grouping (Cantrips, 1st - 9th), prepared toggle, quick-cast button, and remove spell button.

- [ ] **Step 1: Write unit tests for Spellbook drop and level grouping**
  Test dropping a spell adds it to the character spell list; test grouping by spell level.

- [ ] **Step 2: Implement `SpellbookCard.jsx`**
  Displays spell info with:
  - Prepared status toggle (star/checkbox icon)
  - Quick-Cast button
  - Remove from spellbook button (trash icon)
  - Click to view details

- [ ] **Step 3: Implement `SpellbookLevelGroup.jsx`**
  Collapsible level section showing count of prepared/known spells in that level.

- [ ] **Step 4: Implement `SpellbookView.jsx` with HTML5 Drop Zone**
  `onDragOver={(e) => e.preventDefault()}` and `onDrop={(e) => handleDrop(e.dataTransfer.getData('text/plain'))}` with visual highlight when dragged over.

- [ ] **Step 5: Verify spellbook tests**
  Run `npx vitest run src/components/Spellbook/`.

- [ ] **Step 6: Commit**
  ```bash
  git add src/components/Spellbook/
  git commit -m "feat: add character spellbook with drag and drop and level grouping"
  ```

---

### Task 7: Spell Slot Tracker & Rest Mechanics

**Files:**
- Create: `src/components/Spellbook/SpellSlotTracker.jsx`
- Create: `src/components/Spellbook/SlotLevelRow.jsx`
- Test: `src/components/Spellbook/SpellSlotTracker.test.jsx`

**Interfaces:**
- Consumes: `character: CharacterProfile`, `onUseSlot: (level: number) => void`, `onRestoreSlot: (level: number) => void`, `onUpdateMaxSlot: (level: number, max: number) => void`, `onLongRest: () => void`, `onShortRest: () => void`.

- [ ] **Step 1: Write test for slot tracker interactions**
  Test clicking a slot pip marks it expended; test clicking expended slot restores it; test Long Rest restores all expended slots; test Edit Max changes maximum capacity.

- [ ] **Step 2: Implement `SlotLevelRow.jsx`**
  Displays level label (e.g. "1st Level"), clickable pip buttons (filled/empty), count fraction (`3 / 4`), and increment/decrement buttons when in "Edit Max" mode.

- [ ] **Step 3: Implement `SpellSlotTracker.jsx`**
  Grid of active slot levels, "Edit Max Slots" toggle switch, "Long Rest" button (with reset confirmation), and "Short Rest" button.

- [ ] **Step 4: Connect Quick-Cast from Task 6 to deduct slots**
  When Quick-Cast is triggered on a level N spell, deduct 1 slot from level N if available; if not available, show notification / prompt.

- [ ] **Step 5: Run tests and verify**
  Run `npx vitest run`.

- [ ] **Step 6: Commit**
  ```bash
  git add src/components/Spellbook/SpellSlotTracker* src/components/Spellbook/SlotLevelRow*
  git commit -m "feat: add spell slot tracker with pip counters, edit mode, and rest actions"
  ```

---

### Task 8: Character Profiles & JSON Import/Export

**Files:**
- Create: `src/components/Header/CharacterHeader.jsx`
- Create: `src/components/Header/ProfileSelector.jsx`
- Create: `src/utils/fileExport.js`
- Test: `src/utils/fileExport.test.js`
- Test: `src/components/Header/CharacterHeader.test.jsx`

**Interfaces:**
- Produces: `exportCharacterJSON(character: CharacterProfile) -> void` (triggers file download)
- Produces: `validateAndImportCharacterJSON(jsonString: string) -> CharacterProfile | { error: string }`

- [ ] **Step 1: Write tests for JSON import/export validation**
  In `src/utils/fileExport.test.js`: test valid JSON parsing, missing fields handling, corrupted JSON rejection.

- [ ] **Step 2: Implement `fileExport.js`**
  Download via `Blob` and `URL.createObjectURL` as `<character-name>-spellbook.json`, and file input reader with schema validation.

- [ ] **Step 3: Implement `CharacterHeader.jsx` and `ProfileSelector.jsx`**
  Name input (inline edit), Class dropdown (Wizard, Cleric, etc.), Level dropdown (1-20), New Character button, Export JSON button, and Import JSON file picker.

- [ ] **Step 4: Verify header and import/export tests**
  Run `npx vitest run`.

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/Header/ src/utils/fileExport*
  git commit -m "feat: add character profiles switcher and JSON import/export"
  ```

---

### Task 9: Full Integration, Responsive Polish & Verification

**Files:**
- Modify: `src/App.jsx`
- Test: `src/App.integration.test.jsx`

**Interfaces:**
- Wires all modules into the main split-screen app: Catalog (left), Spellbook + Slots + Header (right), Detail Drawer (overlay).

- [ ] **Step 1: Write comprehensive integration test**
  In `src/App.integration.test.jsx`:
  1. Load app with mock spell catalog.
  2. Search for "Fireball" -> verifies it appears in list.
  3. Simulate drag and drop of Fireball into spellbook -> verifies it appears in 3rd Level group.
  4. Toggle Prepared -> verifies star is active.
  5. Click Quick-Cast -> verifies 3rd level slot count decrements from 2 to 1.
  6. Click Long Rest -> verifies 3rd level slot restores to 2.

- [ ] **Step 2: Wire complete state flow in `src/App.jsx`**
  Combine `useSpellFilter`, character profile state, catalog fetch from `/data/spells.json`, drag-and-drop handlers, drawer state, and storage persistence.

- [ ] **Step 3: Run full test suite**
  Run `npx vitest run --run`. Verify 100% passing tests.

- [ ] **Step 4: Build production asset bundle**
  Run `npm run build` and ensure clean build with zero errors.

- [ ] **Step 5: Commit**
  ```bash
  git add src/
  git commit -m "feat: complete spellbook app integration and verification"
  ```
