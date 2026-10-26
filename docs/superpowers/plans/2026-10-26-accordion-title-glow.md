# Accordion Title Glow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add barely visible white glow to all accordion title containers without changing layout or behavior.

**Architecture:** Reuse existing title-container class lists. Add one Tailwind arbitrary shadow utility to Character, Filters, Spellbook, and Spell Slots title containers. No new component, dependency, state, or CSS file.

**Tech Stack:** React, Tailwind CSS, Vitest, Vite.

**Spec:** Approved design in conversation: `shadow-[0_0_6px_rgba(255,255,255,0.08)]` on title containers only; preserve current no-glow state for rollback.

## Global Constraints

- Glow value must be exactly `shadow-[0_0_6px_rgba(255,255,255,0.08)]`.
- Apply glow only to accordion title containers.
- Do not alter spacing, scrolling, collapse behavior, colors, or content.
- Do not deploy without user approval.

## Review Focus

- Collapsed accordions retain glow on title container and no content appears.
- Expanded Spellbook keeps title persistent while spell-list scrollbar remains below title.
- Character expanded layout remains one row structure.
- Filters title retains `text-xs font-semibold` typography.
- Spell Slots remains visual reference and receives same glow.

---

### Task 1: Add subtle glow to accordion title containers

**Files:**
- Modify: `src/components/Header/CharacterHeader.jsx`
- Modify: `src/components/Catalog/FilterBar.jsx`
- Modify: `src/components/Spellbook/SpellbookView.jsx`
- Modify: `src/components/Spellbook/SpellSlotTracker.jsx`
- Test: Existing component tests and full test suite.

**Interfaces:**
- Consumes: Existing accordion title container class names and collapse layout.
- Produces: Identical accordion behavior with exact approved shadow utility on all four title containers.

- [ ] **Step 1: Record rollback baseline**

Confirm current title-container classes in all four files. Rollback is removing only `shadow-[0_0_6px_rgba(255,255,255,0.08)]` from each modified class list.

- [ ] **Step 2: Add exact glow utility**

Add `shadow-[0_0_6px_rgba(255,255,255,0.08)]` to the existing title-container class in Character, Filters, Spellbook, and Spell Slots. Keep all other classes unchanged.

- [ ] **Step 3: Run tests**

Run:

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path; & "C:\Program Files\nodejs\npm.cmd" test -- --run
```

Expected: all existing tests pass.

- [ ] **Step 4: Run production build**

Run:

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path; & "C:\Program Files\nodejs\npm.cmd" run build
```

Expected: Vite build succeeds.

- [ ] **Step 5: Review visual scope**

Verify glow appears only around accordion title containers. Confirm Spellbook header remains persistent and scrollbar/content stays below it.

- [ ] **Step 6: Stop for user review**

Do not deploy or commit glow as final product until user confirms result. If rejected, remove only the four shadow utilities and rerun verification.
