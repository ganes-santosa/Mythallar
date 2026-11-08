# Inventory Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernize the inventory section with ARC Raiders style rarity gradients, compact attunement indicator icons, real-time item search, category-inline detail viewer placement, and smooth height transitions.

**Architecture:**
- `src/components/CharacterSheet/ItemsCard.jsx`:
  1. Add real-time item search bar at the top of the inventory section.
  2. Overhaul item chip styling to ARC Raiders loot box look: remove colored circles, apply neutral dark container with rarity bottom accent and gradient bloom.
  3. Replace text badges on item chips with compact attunement icon (glowing amber spark/ring for Attuned, dim outline for Attunable). Keep explicit Attune/Attuned buttons in the detail viewer.
  4. Move persistent item detail viewer from card top to inside the active category subsection (between category header and items grid).
  5. Refactor viewer height animation to smooth CSS grid rows (`grid-rows-[0fr]` to `grid-rows-[1fr]`) and content fade.
- `src/components/CharacterSheet/ItemsCard.test.jsx`: Update and expand test suite covering search filtering, compact attunement icon, and inline viewer rendering.

**Tech Stack:** React 18, Tailwind CSS, Lucide icons, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-08-inventory-modernization-design.md`

## Global Constraints
- Zero-outline visual guidelines preserved (minimal, flat, borderless with contrast/shadows).
- All 5e initialisms (AC, HP, DEX, etc.) remain uppercase, labels Title Case.
- Full Vitest suite (319 tests) must stay green.

## Review Focus
- Item search: Case-insensitive matching on item name and description/notes. Clear button clears text and restores full list.
- Attunement state toggle: Clicking attune mode or attuning in viewer must update the compact icon immediately without layout breakage.
- Category switching with open viewer: If viewing item in "Gear", clicking an item in "Magic Items" moves the viewer smoothly to "Magic Items".
- Empty search state: Displays helpful "No items found" message when search query has no matches.

---

### Task 1: Compact Attunement Icon & ARC Raiders Rarity Styling

**Files:**
- Modify: `src/components/CharacterSheet/ItemsCard.jsx`
- Test: `src/components/CharacterSheet/ItemsCard.test.jsx`

- [ ] **Step 1: Write failing tests in `src/components/CharacterSheet/ItemsCard.test.jsx`**
  - Verify item chip has compact attunement indicator (`aria-label` or test id) instead of text `(attunable)` or `Attuned`.
  - Verify ARC Raiders container gradient classes exist on item chips.
  - Verify detail viewer still contains the explicit `Attuned` / `Attune` text button.

- [ ] **Step 2: Run test to verify it fails**
  `npm.cmd test -- src/components/CharacterSheet/ItemsCard.test.jsx --run`

- [ ] **Step 3: Implement compact attunement icon and ARC Raiders container styling**
  - Update `ITEM_COLORS` or helper with container rarity gradient definitions:
    - Slate/Common: `from-slate-700/20 via-transparent border-b border-slate-700/40`
    - Emerald/Uncommon: `from-emerald-500/20 via-transparent border-b border-emerald-500/50 shadow-[0_4px_12px_-4px_rgba(16,185,129,0.15)]`
    - Sky/Rare: `from-sky-500/20 via-transparent border-b border-sky-500/50 shadow-[0_4px_12px_-4px_rgba(14,165,233,0.15)]`
    - Purple/Very Rare: `from-purple-500/20 via-transparent border-b border-purple-500/50 shadow-[0_4px_12px_-4px_rgba(168,85,247,0.15)]`
    - Amber/Legendary: `from-amber-500/25 via-transparent border-b border-amber-500/50 shadow-[0_4px_12px_-4px_rgba(245,158,11,0.2)]`
    - Rose/Artifact: `from-rose-500/25 via-transparent border-b border-rose-500/50 shadow-[0_4px_12px_-4px_rgba(244,63,94,0.2)]`
  - Remove colored circle dot and left bookmark strip from item chips.
  - Add compact attunement icon (e.g. `Sparkle` or `Radio` / `CircleDot`):
    - When `isAttuned`: `text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]` with `title="Attuned"` and `aria-label="Attuned"`.
    - When `requiresAttunement && !isAttuned`: `text-slate-600 group-hover:text-slate-400` with `title="Requires Attunement"` and `aria-label="Requires attunement"`.

- [ ] **Step 4: Run test to verify it passes**
  `npm.cmd test -- src/components/CharacterSheet/ItemsCard.test.jsx --run`

---

### Task 2: Real-Time Item Search Bar

**Files:**
- Modify: `src/components/CharacterSheet/ItemsCard.jsx`
- Test: `src/components/CharacterSheet/ItemsCard.test.jsx`

- [ ] **Step 1: Write failing tests in `src/components/CharacterSheet/ItemsCard.test.jsx`**
  - Test searching filters visible items across categories by name and notes.
  - Test clicking clear button resets search input and restores full inventory.
  - Test empty state when search matches nothing.

- [ ] **Step 2: Run test to verify it fails**
  `npm.cmd test -- src/components/CharacterSheet/ItemsCard.test.jsx --run`

- [ ] **Step 3: Implement search bar in `src/components/CharacterSheet/ItemsCard.jsx`**
  - Add `searchQuery` state.
  - Render search input in the top actions/toolbar row beside or under filter accordion toggle.
  - Filter items in `groupedItems` calculation: matching `name` or `note`/`description`.
  - Add clear button when `searchQuery` is non-empty.

- [ ] **Step 4: Run test to verify it passes**
  `npm.cmd test -- src/components/CharacterSheet/ItemsCard.test.jsx --run`

---

### Task 3: Category-Inline Item Detail Viewer & Smooth Animation

**Files:**
- Modify: `src/components/CharacterSheet/ItemsCard.jsx`
- Test: `src/components/CharacterSheet/ItemsCard.test.jsx`

- [ ] **Step 1: Write failing tests in `src/components/CharacterSheet/ItemsCard.test.jsx`**
  - Test clicking an item in a specific category renders the detail viewer inside that category's section.
  - Test selecting an item in a different category shifts the viewer to that category.

- [ ] **Step 2: Run test to verify it fails**
  `npm.cmd test -- src/components/CharacterSheet/ItemsCard.test.jsx --run`

- [ ] **Step 3: Implement category-inline viewer & smooth transitions**
  - Extract `ItemDetailViewer` sub-component to eliminate duplicate code.
  - Remove fixed top-level viewer.
  - In each category section loop: if `viewingItem` belongs to `group.id`, render `ItemDetailViewer` between category header and items grid.
  - Apply smooth CSS grid animation `grid transition-[grid-template-rows,opacity] duration-300 ease-out` with `grid-rows-[1fr]` when open and `grid-rows-[0fr]` when closed.

- [ ] **Step 4: Run test to verify it passes**
  `npm.cmd test -- src/components/CharacterSheet/ItemsCard.test.jsx --run`

---

### Task 4: Full Suite Verification & Build

- [ ] **Step 1: Run complete test suite**
  `npm.cmd test -- --run`
- [ ] **Step 2: Run production build**
  `npm.cmd run build`
