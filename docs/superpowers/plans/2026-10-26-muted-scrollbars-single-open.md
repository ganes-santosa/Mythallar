# Muted Scrollbars and Single-Open Spell Accordions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make scrollbars neutral and visible, prevent Spellbook clipping, and allow only one spell level accordion open per list.

**Architecture:** Keep existing component structure. Use one active level state in each list owner, pass controlled open state to level groups, and add minimal right padding to scroll content. Change global scrollbar colors to muted neutral variables.

**Tech Stack:** React, Tailwind CSS, CSS, Vitest, Vite.

**Spec:** `docs/superpowers/specs/2026-10-26-muted-scrollbars-single-open-accordions-design.md`

## Global Constraints

- Use muted neutral scrollbar thumb, not gold.
- Keep scrollbar track visibly distinct.
- At most one level accordion open in each spell list.
- No new dependency or shared abstraction.
- Preserve spell preparation, casting, selection, and filtering behavior.

## Review Focus

- Opening second left level closes first.
- Opening second right level closes first.
- Closing active level leaves all levels closed.
- Prepared spell controls remain visible beside scrollbar.
- Scrollbar remains visible against Spellbook panel.

---

### Task 1: Neutral scrollbar and Spellbook spacing

**Files:**
- Modify: `src/index.css`
- Modify: `src/components/Spellbook/SpellbookView.jsx`

- [ ] Change thumb from gold to `var(--color-muted)` and keep track `var(--color-panel)` with enough contrast.
- [ ] Add right padding to Spellbook scroll content, preserving vertical overflow.
- [ ] Run existing Spellbook tests.

### Task 2: Single-open catalog accordions

**Files:**
- Modify: `src/components/Catalog/SpellList.jsx`
- Modify: `src/components/Catalog/CatalogLevelGroup.jsx`
- Test: `src/components/Catalog/SpellList.test.jsx` or existing catalog tests.

- [ ] Add failing test proving opening one level closes previously open level.
- [ ] Run test and confirm expected failure.
- [ ] Replace per-group independent open state with one owner-controlled active level.
- [ ] Run focused test, then full suite.

### Task 3: Single-open Spellbook accordions

**Files:**
- Modify: `src/components/Spellbook/SpellbookView.jsx`
- Modify: `src/components/Spellbook/SpellbookLevelGroup.jsx`
- Test: `src/components/Spellbook/SpellbookView.test.jsx` or existing level-group tests.

- [ ] Add failing test proving opening one Spellbook level closes previously open level.
- [ ] Run test and confirm expected failure.
- [ ] Add owner-controlled active level state and pass it into groups.
- [ ] Run focused test, full suite, and production build.
