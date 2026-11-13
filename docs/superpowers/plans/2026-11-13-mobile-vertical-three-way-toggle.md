# Mobile Vertical Three-Way View Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide an intuitive 3-way view toggle (`Sheet` | `Spellbook` | `Catalog`) and full-width single-pane layout for mobile vertical screens (< md / 768px) while preserving exact 50/50 desktop dual-pane functionality.

**Architecture:** Extend view state management in `App.jsx` so mobile screens (< md) can toggle between 3 full-width views: Character Sheet, Spellbook & Slots, and Spell Catalog. Ensure the top navigation bar with branding, auth, view switcher, and settings remains accessible at the top on mobile, showing the 3-button pill on `< md` and the existing 2-button hover pill on `md:`.

**Tech Stack:** React 18, Tailwind CSS, Lucide icons (`UserRound`, `BookOpen`, `LibraryBig`), Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-13-mobile-vertical-three-way-toggle-design.md`

## Global Constraints
- Preserve exact desktop (>= md) 50/50 dual-pane layout, interactions, and styling bit-for-bit.
- Zero new runtime dependencies.
- No outline borders or boxes-in-boxes; follow visual guidelines.
- Suite must remain green (`npm.cmd test -- --run`).

## Review Focus
- View switcher on `< md`: all three buttons (`Sheet`, `Spellbook`, `Catalog`) visible and operable without requiring hover (touch screens have no hover).
- Pane display on mobile: exactly one pane visible at a time (`w-full`), hiding the inactive pane without breaking scroll or layout.
- No character active state: switching to `Sheet` or `Spellbook` on mobile properly shows empty state with create/import character options.
- Desktop view toggle: remains 2 buttons (`Spell Library` | `Character Sheet`) with existing hover expand behavior.
- Transition back to desktop: resizing window above 768px immediately restores 50/50 dual pane layout seamlessly.

---

### Task 1: View State & Mobile 3-Way Switcher in `App.jsx`

**Files:**
- Modify: `src/App.jsx`
- Test: `src/App.test.jsx`

**Interfaces:**
- Consumes: `leftPaneView` (`'spells' | 'sheet'`), Lucide icons (`BookOpen`, `LibraryBig`, `UserRound`)
- Produces: `mobileView` (`'sheet' | 'spellbook' | 'catalog'`), synchronized with `leftPaneView` when on desktop

- [ ] **Step 1: Write failing test in `App.test.jsx` for mobile view toggle**

```javascript
it('renders 3-way toggle buttons on mobile and switches visible view', async () => {
  render(<App />);
  // Look for mobile toggle buttons: Sheet, Spellbook, Catalog
  const mobileSheetBtn = screen.getByRole('button', { name: /mobile sheet|character sheet/i });
  const mobileSpellbookBtn = screen.getByRole('button', { name: /mobile spellbook|spellbook/i });
  const mobileCatalogBtn = screen.getByRole('button', { name: /mobile catalog|spell library/i });
  expect(mobileSheetBtn).toBeInTheDocument();
  expect(mobileSpellbookBtn).toBeInTheDocument();
  expect(mobileCatalogBtn).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- --run -t "renders 3-way toggle"`
Expected: FAIL

- [ ] **Step 3: Implement 3-way switcher pill and state in `App.jsx`**

- Add `mobileView` state defaulting to `'spellbook'` (if character exists) or `'catalog'` (if empty), or sync `mobileView` with `leftPaneView`.
- Render the 3-button pill for mobile (`flex md:hidden items-center bg-dnd-card/90 rounded-lg p-0.5 shadow-md`) alongside the existing desktop pill (`hidden md:flex`).
- Buttons on mobile:
  - `Sheet`: `UserRound` icon, label `Sheet`
  - `Spellbook`: `BookOpen` icon, label `Spellbook`
  - `Catalog`: `LibraryBig` icon, label `Catalog`
- Ensure active tab uses `bg-dnd-gold text-slate-950 font-bold`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- --run -t "renders 3-way toggle"`
Expected: PASS

- [ ] **Step 5: Verify full test suite passes**

Run: `npm.cmd test -- --run`
Expected: 47 passed

---

### Task 2: Responsive Pane Visibility on Mobile (< md)

**Files:**
- Modify: `src/App.jsx`
- Test: `src/App.test.jsx`

**Interfaces:**
- Consumes: `mobileView` state (`'sheet' | 'spellbook' | 'catalog'`)
- Produces: Dynamic responsive classes on Left Pane and Right Pane `<section>` tags

- [ ] **Step 1: Write failing test in `App.test.jsx` verifying pane visibility classes**

```javascript
it('toggles pane visibility according to active mobile view', async () => {
  render(<App />);
  // When mobileView is 'spellbook', right pane is visible, catalog/sheet content in left pane is hidden on mobile
  // Test clicking mobile tabs updates which container is displayed
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- --run -t "toggles pane visibility"`
Expected: FAIL

- [ ] **Step 3: Apply responsive visibility classes in `App.jsx`**

- Ensure header is accessible across all mobile views (or rendered persistent above the main body on mobile).
- Left Pane Section:
  - On desktop: `w-full md:w-1/2 flex flex-col min-h-0`
  - On mobile: visible when `mobileView === 'sheet' || mobileView === 'catalog'`, hidden when `mobileView === 'spellbook'` (`hidden md:flex`).
- Right Pane Section:
  - On desktop: `w-full md:w-1/2 flex flex-col min-h-0`
  - On mobile: visible when `mobileView === 'spellbook'`, hidden when `mobileView !== 'spellbook'` (`hidden md:flex`).
- When `mobileView === 'spellbook'`, Right Character Header accordion stays expanded (`grid-rows-[1fr] opacity-100 mb-2.5`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- --run -t "toggles pane visibility"`
Expected: PASS

- [ ] **Step 5: Verify full suite and build**

Run: `npm.cmd test -- --run`
Run: `npm.cmd run build`
Expected: All 47 test files pass, production build succeeds.

---

### Task 3: Mobile UX & Touch Polish

**Files:**
- Modify: `src/App.jsx`
- Test: `src/App.test.jsx`

**Interfaces:**
- Consumes: Mobile viewport padding and touch target sizes (min 32px height for switcher buttons)
- Produces: Polished mobile layout without horizontal overflow

- [ ] **Step 1: Review mobile spacing, margins, and empty states**
- Confirm mobile switcher button targets are comfortable for touch (h-7 or h-8, clear active gold highlight).
- Confirm empty state when no character exists works smoothly across all 3 views.
- [ ] **Step 2: Run all tests and verify production build**

Run: `npm.cmd test -- --run`
Run: `npm.cmd run build`
Expected: PASS
