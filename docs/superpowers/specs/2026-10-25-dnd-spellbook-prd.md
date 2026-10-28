# Product Requirements Document (PRD)
## D&D 5e Spellbook Web Application

**Date:** 2026-10-25  
**Status:** Approved for Implementation  
**Type:** Client-Side Single Page Application (SPA)

---

## 1. Overview & Goals
The **D&D 5e Spellbook App** is a fast, responsive, client-side web application designed for tabletop RPG players. It allows players and Dungeon Masters to search, filter, and reference the complete D&D 5e spell catalog, build and manage custom character spellbooks via intuitive drag-and-drop, track spell slot expenditure in combat, and persist character profiles locally.

### Key Objectives
- **Zero Latency Search**: In-memory search and multi-facet filtering across all spells.
- **Drag & Drop Workflow**: Drag spells from the catalog directly into the active character's spellbook.
- **Spell Slots Management**: Automated 5e progression calculation based on class and level, with manual override and rest resets.
- **Offline & Private**: 100% client-side data persistence (`localStorage`) with JSON backup/restore.

---

## 2. Target Users & Use Cases
1. **Spellcaster Players (Wizards, Clerics, Druids, Bards, Sorcerers, Warlocks, Paladins, Rangers)**:
   - Prepare spells during a long rest.
   - Track remaining spell slots round-by-round during combat encounters.
   - Click to read spell descriptions, range, and material components quickly.
2. **Dungeon Masters**:
   - Keep reference spell lists for NPC spellcasters.
   - Export and import monster/encounter spell lists as JSON.

---

## 3. Architecture & Tech Stack
- **Framework**: React 18 / 19 with Vite.
- **Styling**: Tailwind CSS (dark fantasy theme: slate/zinc slate base, amber/gold accents, crisp typography).
- **Icons**: Lucide-react (swords, book, spark, filter, trash, check, moon, sun).
- **Data Source**: Preprocessed 5etools spell dataset cleaned and parsed into structured JSON (`/public/data/spells.json`), stripped of raw 5etools markup tags (`{@spell ...}`, `{@dice ...}`).
- **Drag & Drop**: Native HTML5 Drag and Drop API (`draggable`, `onDragStart`, `onDragOver`, `onDrop`) for zero external bundle bloat.
- **Persistence**: Browser `localStorage` + JSON Import/Export file handler.

---

## 4. Feature Specifications

### 4.1 Left Segment: Spell Catalog & Reference
1. **Search Bar**:
   - Instant text search across spell names, descriptions, and school tags.
   - Clear search button.
2. **Filter Controls**:
   - **Level**: Cantrip, 1st - 9th.
   - **Class**: Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard, Artificer.
   - **School**: Abjuration, Conjuration, Divination, Enchantment, Evocation, Illusion, Necromancy, Transmutation.
   - **Toggles**: Ritual (`[R]`), Concentration (`[C]`), Verbal (`V`), Somatic (`S`), Material (`M`).
3. **Spell List Item**:
   - Displays: Name, Level, School icon/badge, Casting time, Range, Concentration/Ritual badges.
   - Draggable handle/card to drag directly into the Spellbook on the right.
   - Click anywhere on card (except drag handle) opens the **Spell Detail Slide-over Drawer**.
   - Visual indicator if spell is already in the active character's spellbook.

### 4.2 Right Segment: Active Character Spellbook
0. **Empty State & First Character Creation**:
   - New sessions/users start with no default character profile.
   - Right pane presents an onboarding prompt: "Create First Character".
   - Opens the Character Creation modal asking for character name and starting level 1 class (with roadmap for future expansion into full character creator).
1. **Character Header Bar**:
   - Character Name (editable).
   - Class selector (determines default slot progression).
   - Level selector (1-20).
   - Profile switcher (dropdown to switch between characters or create new).
   - Action buttons: "Long Rest" (resets all slots), "Short Rest" (resets Warlock pact slots), "Export JSON", "Import JSON".
2. **Spell Slot Tracker**:
   - Slot grid displaying Level 1 through Level 9 slots.
   - Visual slot pips/boxes (filled = available, empty = expended). Click to toggle slot use.
   - Number badge (e.g. `3 / 4`).
   - "Edit Max" toggle button enabling manual override of max slots per level.
3. **Spellbook Drop Zone & Level Groups**:
   - Drop zone accepts dragged spell cards from the catalog.
   - Automatically sorts spells into collapsible level sections: Cantrips, 1st Level, 2nd Level ... 9th Level.
   - Per-spell actions:
     - **Prepared Toggle**: Checkbox/star indicating whether spell is currently prepared (critical for Wizard/Cleric/Druid preparation limits).
     - **Quick-Cast Button**: Deducts one matching spell slot with feedback. If no slots remain, warns user and prompts for higher-level slot.
     - **Detail View**: Opens the Slide-over Drawer.
     - **Remove**: Deletes spell from the character's spellbook.

### 4.3 Spell Detail Slide-over Drawer
- Slides in from right (or modal overlay) without disrupting the split view.
- Complete spell breakdown:
  - Level & School, Casting Time, Range, Components (with cost details if specified), Duration & Concentration.
  - Formatted description paragraphs.
  - "At Higher Levels" scaling block.
  - "Add to Spellbook" action button if not already added.

---

## 5. Data Models

### 5.1 Spell (Catalog Object)
```json
{
  "id": "fireball",
  "name": "Fireball",
  "level": 3,
  "school": "evocation",
  "time": "1 action",
  "range": "150 feet",
  "components": { "v": true, "s": true, "m": "a tiny ball of bat guano and sulfur" },
  "duration": "Instantaneous",
  "concentration": false,
  "ritual": false,
  "classes": ["Sorcerer", "Wizard"],
  "entries": [
    "A bright streak flashes from your pointing finger to a point you choose within range..."
  ],
  "higherLevels": "When you cast this spell using a spell slot of 4th level or higher..."
}
```

### 5.2 Character Spellbook Profile
```json
{
  "id": "char_uuid",
  "name": "Mordenkainen",
  "className": "Wizard",
  "level": 9,
  "customSlots": {
    "1": 4,
    "2": 3,
    "3": 3,
    "4": 3,
    "5": 1
  },
  "slotsUsed": {
    "1": 1,
    "2": 0,
    "3": 2,
    "4": 0,
    "5": 0
  },
  "spells": [
    {
      "id": "fireball",
      "prepared": true
    },
    {
      "id": "shield",
      "prepared": true
    }
  ]
}
```

---

## 6. Non-Functional Requirements
- **Performance**: Instant filtering (< 16ms) across 500+ spells using standard browser memoization.
- **Responsiveness**: Optimized for desktop (split 50/50 or 45/55 columns), adaptable to tablet.
- **Reliability**: Fail-safe JSON import validation. Auto-saves every state change to `localStorage`.
- **Accessibility**: Keyboard navigable search, clean contrast ratios, clear ARIA labels for drag-and-drop targets.

---

## 7. Milestones & Implementation Phases
- **Phase 1**: Project scaffolding (Vite + React + Tailwind + Lucide).
- **Phase 2**: Spell data pipeline (Ingest and normalize 5etools spell catalog into clean static JSON).
- **Phase 3**: Spell Catalog UI (Search, multi-filter chips, spell card list, slide-over detail drawer).
- **Phase 4**: Character Spellbook & Drag-and-Drop (HTML5 drag-drop, level groups, prepare toggle, remove).
- **Phase 5**: Spell Slot Tracker & Progression (Automatic 5e slot rules, manual override mode, long/short rest, quick-cast).
- **Phase 6**: Persistence & Backup (LocalStorage sync, multi-profile manager, JSON import/export).
- **Phase 7**: Polish, verification, and end-to-end testing.
