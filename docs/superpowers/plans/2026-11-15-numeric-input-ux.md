# Numeric Input UX Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow natural clearing and editing of numeric inputs without forced zeros/calculated values or leading zeroes.

**Architecture:** Introduce a small reusable draft-state hook for controlled numeric fields. Draft text is local to the input; numeric values/defaults are committed on blur. Reuse the hook in affected character sheet and spellbook fields.

**Tech Stack:** React 18, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-15-numeric-input-ux.md`

## Tasks

### Task 1: Currency Leading Zeroes
- [x] Add failing test in `ItemsCard.test.jsx`: changing GP to `0340` displays `340`, CP `0023` displays `23`, empty input remains clear until blur.
- [x] Run test; confirm RED.
- [x] Normalize nonnegative integer drafts in `CurrencyTracker.handleChange`.
- [x] Run test; confirm GREEN.

### Task 2: Ability, Darkvision, And Passive Drafts
- [x] Add failing tests in `AbilitiesCard.test.jsx` and `SkillsCard.test.jsx` for clearing and replacing each named field without forced intermediate values.
- [x] Run tests; confirm RED.
- [x] Add local draft strings, reset on edit-mode exit, commit defaults on blur. Passive empty blur removes override and displays calculated value.
- [x] Run tests; confirm GREEN.

### Task 3: Remaining Immediate-Coercion Numeric Inputs
- [x] Add failing tests for clearing combat settings HP/AC fields, walking speed, and maximum spell slots.
- [x] Run tests; confirm RED.
- [x] Apply draft-state editing to those fields and inspect item/resource numeric fields for the same issue; use local draft commit behavior where needed.
- [x] Run all focused tests, full suite, and production build.
