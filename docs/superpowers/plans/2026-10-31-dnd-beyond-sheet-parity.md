# D&D Beyond Sheet Parity Implementation Plan (No Actions/Attacks)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring Mythallar's Character Sheet to parity with D&D Beyond by adding 18 standard skills with proficiency/expertise cycles, passive senses, initiative, speed, hit dice, death saves, damage defenses, proficiencies & training (armor, weapons, tools, languages), and character identity metadata with client-compressed portraits.

**Architecture:** Extend `src/utils/dndCalculations.js` for skill and passive scores. Extend `src/utils/storage.js` with backwards-compatible defaults for skills, senses, defenses, proficiencies, and identity. Create a browser canvas avatar compressor in `src/utils/imageCompressor.js`. Build `SkillsCard.jsx` and `ProficienciesCard.jsx`. Upgrade `VitalsCard.jsx` and `CharacterSheetView.jsx`.

**Tech Stack:** React 18, HTML5 Canvas API, Tailwind CSS, Lucide icons, Vitest.

**Spec:** D&D Beyond Character Sheet reference + user instruction (excluding Actions/Attacks).

## Global Constraints

- Never use regex or PowerShell text replaces on JSX files.
- Stored avatar images MUST be compressed to max 256x256 px at quality 0.85 (data URL) before saving to character profiles.
- 18 Skills must calculate dynamically: `abilityModifier + (proficiency === 'proficient' ? profBonus : proficiency === 'expertise' ? profBonus * 2 : 0)`.
- Existing saved profiles must seamlessly migrate without missing property exceptions.
- All test suites must remain green (`npm.cmd test -- --run`).

## Review Focus

- Cycle state transitions for skills: none -> proficient -> expertise -> none.
- Passives auto-updating when proficiency bonus, ability score, or skill proficiency changes.
- Large image uploads compressed down to canvas bounds without crashing or blocking main thread.
- Death saves 3 success / 3 failure state toggles and reset on Long Rest.
- Backward compatibility: legacy profiles without `skills` or `identity` safely instantiate defaults.

---

### Task 1: D&D 5e Skills & Passives Calculation Engine

**Files:**
- Modify: `src/utils/dndCalculations.js`
- Test: `src/utils/dndCalculations.test.js`

**Interfaces:**
- Produces:
  - `SKILLS_DEFINITION: Array<{ key: string, label: string, ability: string }>`
  - `calculateSkillBonus(score: number, profType: 'none' | 'proficient' | 'expertise', level: number, override?: number): number`
  - `calculatePassiveScore(score: number, profType: string, level: number, bonus?: number): number`

- [ ] **Step 1: Write failing tests in `src/utils/dndCalculations.test.js`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement calculation helpers in `src/utils/dndCalculations.js`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 2: Storage Profile Schema Updates for Senses, Defenses & Proficiencies

**Files:**
- Modify: `src/utils/storage.js`
- Test: `src/utils/storage.test.js`

**Interfaces:**
- Updates `createDefaultSheet` to populate:
  - `skills`: `{ acrobatics: 'none', ..., stealth: 'none' }`
  - `senses`: `{ darkvision: 0, custom: '' }`
  - `vitals`: `speed: 30`, `initiativeOverride: null`, `hitDice: { current: 1, max: 1, die: 'd6' }`, `deathSaves: { successes: 0, failures: 0 }`, `defenses: []`
  - `proficiencies`: `{ armor: [], weapons: [], tools: [], languages: ['Common'] }`
  - `identity`: `{ race: '', subclass: '', background: '', portrait: '' }`

- [ ] **Step 1: Write failing tests in `src/utils/storage.test.js`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Update `createDefaultSheet` and migration in `src/utils/storage.js`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 3: Client-Side Canvas Image Compressor

**Files:**
- Create: `src/utils/imageCompressor.js`
- Test: `src/utils/imageCompressor.test.js`

**Interfaces:**
- Produces: `compressImageFile(file: File, maxDim?: number, quality?: number): Promise<string>`

- [ ] **Step 1: Write failing tests in `src/utils/imageCompressor.test.js`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `compressImageFile` using HTML Canvas**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 4: Expanded Vitals Card (Initiative, Speed, Hit Dice, Death Saves, Defenses)

**Files:**
- Modify: `src/components/CharacterSheet/VitalsCard.jsx`
- Test: `src/components/CharacterSheet/VitalsCard.test.jsx`

**Interfaces:**
- Consumes: `vitals`, `abilities.dex`, `level`, `onUpdateVitals`
- Displays: HP, Temp HP, AC, Initiative, Speed, Hit Dice, 3 Success / 3 Failure Death Save circles, Damage Defenses chips.

- [ ] **Step 1: Write failing tests in `src/components/CharacterSheet/VitalsCard.test.jsx`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement new sub-sections in `VitalsCard.jsx`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 5: Skills & Senses Card Component

**Files:**
- Create: `src/components/CharacterSheet/SkillsCard.jsx`
- Test: `src/components/CharacterSheet/SkillsCard.test.jsx`

**Interfaces:**
- Consumes: `skills`, `abilities`, `level`, `senses`, `onUpdateSkills`, `onUpdateSenses`
- Displays:
  - Top passives row: Passive Perception, Passive Investigation, Passive Insight.
  - 18 skills list with ability badge, formatted modifier, and 3-state proficiency indicator:
    - empty ring (none) -> solid gold circle (proficient) -> double ring / gold star (expertise).
  - Senses input / badges (e.g. Darkvision 60 ft).

- [ ] **Step 1: Write failing tests in `src/components/CharacterSheet/SkillsCard.test.jsx`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `SkillsCard.jsx`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 6: Proficiencies & Training Card Component

**Files:**
- Create: `src/components/CharacterSheet/ProficienciesCard.jsx`
- Test: `src/components/CharacterSheet/ProficienciesCard.test.jsx`

**Interfaces:**
- Consumes: `proficiencies: { armor, weapons, tools, languages }`, `onUpdateProficiencies`
- Displays: 4 categorized tag/chip groups with quick inline addition and deletion.

- [ ] **Step 1: Write failing tests in `src/components/CharacterSheet/ProficienciesCard.test.jsx`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `ProficienciesCard.jsx`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 7: Character Identity Banner & Portrait in CharacterSheetView

**Files:**
- Modify: `src/components/CharacterSheet/CharacterSheetView.jsx`
- Test: `src/components/CharacterSheet/CharacterSheetView.test.jsx`

**Interfaces:**
- Displays character portrait avatar with upload trigger (`<input type="file" accept="image/*">`), character name, level, race, subclass, background, proficiency bonus.
- Assembles all modular cards: `VitalsCard`, `AbilitiesCard`, `SkillsCard`, `ProficienciesCard`, `ResourcesCard`, `ItemsCard`.

- [ ] **Step 1: Write failing tests in `src/components/CharacterSheet/CharacterSheetView.test.jsx`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Update `CharacterSheetView.jsx`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 8: Full Verification & Build Check

**Files:**
- None (verification only)

- [ ] **Step 1: Run complete test suite (`npm.cmd test -- --run`)**
- [ ] **Step 2: Run production build (`npm.cmd run build`)**
