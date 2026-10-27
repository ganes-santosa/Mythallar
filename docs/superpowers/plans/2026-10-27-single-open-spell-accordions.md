# Single-Open Spell Accordions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow only one expanded spell per section while keeping Spell List and Spellbook accordion state independent.

**Architecture:** Lift expanded spell ID from each card into its section parent. Cards receive controlled `isExpanded` plus an `onToggle` callback. Each section owns separate state, so opening one section never changes the other.

**Tech Stack:** React, Vitest, Testing Library.

**Spec:** User request in conversation; no separate design document.

## Global Constraints

- Clicking open spell closes it.
- Opening another spell closes prior spell in same section.
- Spell List and Spellbook states remain independent.
- Preserve existing `onSelect`, prepare, cast, remove, drag, and delete behavior.

## Review Focus

- Re-clicking open card clears section state.
- Opening second card leaves exactly second card expanded.
- Cross-section cards can remain expanded simultaneously.
- Keyboard Enter/Space follows same toggle behavior.
- Empty list or changing spell data does not crash.

### Task 1: Controlled Spell List Accordion

**Files:**
- Modify: `src/components/Catalog/SpellCard.jsx`
- Modify: Spell List parent that maps `SpellCard` (locate current map in `src/components`)
- Test: `src/components/Catalog/SpellCard.test.jsx` and/or parent test

**Interfaces:**
- `SpellCard` consumes `isExpanded` and `onToggleExpand` props.
- Spell List parent owns `expandedSpellId` state and passes `isExpanded={expandedSpellId === spell.id}`.

- [ ] Add failing coverage for opening one card, switching cards, and closing active card.
- [ ] Remove card-local expansion state; call parent toggle while preserving `onSelect`.
- [ ] Add Spell List parent state: `expandedSpellId`, toggled to `spell.id` or `null`.
- [ ] Run focused tests.

### Task 2: Controlled Spellbook Accordion

**Files:**
- Modify: `src/components/Spellbook/SpellbookCard.jsx`
- Modify: Spellbook parent that maps `SpellbookCard` (locate current map in `src/components`)
- Test: relevant Spellbook test file

**Interfaces:**
- `SpellbookCard` consumes `isExpanded` and `onToggleExpand` props.
- Spellbook parent owns independent `expandedSpellId` state.

- [ ] Add failing coverage for switching, closing, and cross-section independence.
- [ ] Remove card-local expansion state; preserve `onSelect`, prepare, cast, and remove actions.
- [ ] Add independent Spellbook state and controlled props.
- [ ] Run focused tests.

### Task 3: Full Verification

- [ ] Run `npm test -- --run`.
- [ ] Run `npm run build`.
- [ ] Inspect diff for accidental behavior or formatting changes.
