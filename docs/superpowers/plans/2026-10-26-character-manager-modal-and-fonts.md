# Character Manager Modal & Funnel Typography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide a dedicated Character Manager modal to view, sort (by level/name), switch, create, and safely delete characters (with confirmation), while updating typography to Google Fonts "Funnel Display" (headings) and "Funnel Sans" (body) with a recorded rollback path for Bricolage Grotesque.

**Architecture:** 
- New modal component `src/components/Header/CharacterManagerModal.jsx`.
- Update `src/components/Header/ProfileSelector.jsx` with button to open modal while keeping quick dropdown.
- Update `src/App.jsx` with character deletion handler (removing locally and deleting from Supabase `characters` table).
- Update `index.html`, `tailwind.config.js`, and `src/index.css` to load and apply `Funnel Display` and `Funnel Sans` fonts.

**Tech Stack:** React 18, Vite, Tailwind CSS, Lucide React, Vitest.

## Review Focus
1. **Active Character Deletion**: When user deletes the currently active character, automatically switch `activeId` to the next available character.
2. **Sole Character Deletion Guard**: If only 1 character remains, do not leave state with 0 characters; create a default character or disallow deleting the last character.
3. **Cloud Deletion Sync**: Deleting a character triggers deletion in Supabase if logged in (`deleteCloudCharacter`).
4. **Font Loading & Fallback**: Retain clean CSS class definitions with system fallback (`sans-serif`) in case font is blocked offline.

---

### Task 1: Typography Update to Funnel Display & Funnel Sans

**Files:**
- Modify: `index.html`
- Modify: `tailwind.config.js`
- Modify: `src/index.css`

- [ ] **Step 1: Update `index.html` Google Fonts link**
  Add preconnect and font stylesheet for `Funnel+Display:wght@300..800` and `Funnel+Sans:ital,wght@0,300..800;1,300..800`. Keep previous `Bricolage+Grotesque` commented for quick rollback.
- [ ] **Step 2: Configure font families in `tailwind.config.js`**
  Add `fontFamily: { display: ['"Funnel Display"', 'sans-serif'], sans: ['"Funnel Sans"', 'sans-serif'] }`.
- [ ] **Step 3: Update `src/index.css` base body font**
  Set `font-family: 'Funnel Sans', system-ui, sans-serif;`.
- [ ] **Step 4: Verify dev server and run tests**
- [ ] **Step 5: Commit**

---

### Task 2: Character Deletion in State & Cloud Service

**Files:**
- Modify: `src/utils/syncService.js`
- Modify: `src/utils/syncService.test.js`
- Modify: `src/App.jsx`

- [ ] **Step 1: Write test for `deleteCloudCharacter` in `src/utils/syncService.test.js`**
- [ ] **Step 2: Implement `deleteCloudCharacter(client, userId, characterId)` in `src/utils/syncService.js`**
- [ ] **Step 3: Implement `handleDeleteCharacter(characterId)` in `src/App.jsx`**
  Removes from `profiles`, selects next available profile, calls `deleteCloudCharacter`.
- [ ] **Step 4: Run tests**
- [ ] **Step 5: Commit**

---

### Task 3: CharacterManagerModal Component

**Files:**
- Create: `src/components/Header/CharacterManagerModal.jsx`
- Test: `src/components/Header/CharacterManagerModal.test.jsx`

- [ ] **Step 1: Write test for `CharacterManagerModal.test.jsx`**
  Verify characters listed, level sorting (ascending/descending/name), deletion confirmation dialog appears and deletes character, selection triggers `onSelect`.
- [ ] **Step 2: Implement `CharacterManagerModal.jsx`**
  Modal with search, sort by level (highest first / lowest first) or name, character cards showing level, classes, and spell count, Active badge, Select button, and Delete button with confirmation popup.
- [ ] **Step 3: Run tests and verify**
- [ ] **Step 4: Commit**

---

### Task 4: Integrate Modal into Header & Full Verification

**Files:**
- Modify: `src/components/Header/ProfileSelector.jsx`
- Modify: `src/components/Header/CharacterHeader.jsx`
- Modify: `src/components/Header/CharacterHeader.test.jsx`

- [ ] **Step 1: Update `ProfileSelector.jsx` and `CharacterHeader.jsx`**
  Add "Manage Characters" button next to quick dropdown to toggle `CharacterManagerModal`.
- [ ] **Step 2: Run all tests**
  `npm test`
- [ ] **Step 3: Run production build**
  `npm run build`
- [ ] **Step 4: Commit and push**
