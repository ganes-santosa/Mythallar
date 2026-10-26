# Interface Contrast and Scrollbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make scrollbars theme-aware, remove Settings footer label, increase pane contrast, and prevent selected spell outline clipping.

**Architecture:** Add one global scrollbar rule to existing app stylesheet using current CSS theme variables. Make minimal class/text changes in existing components. No new dependency or abstraction.

**Tech Stack:** React, Tailwind CSS, CSS, Vitest, Vite.

**Spec:** `docs/superpowers/specs/2026-10-26-interface-contrast-scrollbars-design.md`

## Global Constraints

- No behavior changes.
- No new dependencies.
- Preserve current palette system.
- Scrollbar must use dark track and theme-aware thumb.
- Do not deploy.

## Review Focus

- Scrollbars remain readable across all palettes.
- Settings modal keeps logo/title/subtitle while removing only requested footer text.
- Pane contrast stays subtle, not harsh.
- Selected spell outline has space on both left and right edges.
- Existing overflow behavior remains intact.

---

### Task 1: Apply interface visual fixes

**Files:**
- Modify: `src/index.css` or existing global stylesheet containing app-wide styles.
- Modify: `src/components/Header/SettingsModal.jsx`
- Modify: `src/App.jsx`
- Modify: `src/components/Catalog/SpellList.jsx`
- Test: Existing full suite.

**Interfaces:**
- Consumes: Existing theme CSS variables, pane classes, Settings modal markup, SpellList overflow wrapper.
- Produces: Theme-aware scrollbars, stronger pane separation, untrimmed selected spell outline, and no `Mythallar Grimoire` text.

- [ ] **Step 1: Record current selectors and boundaries**

Confirm global stylesheet location, Settings footer text, App pane classes, and SpellList scrolling wrapper before edits.

- [ ] **Step 2: Add scrollbar styling**

Add global WebKit scrollbar rules plus Firefox `scrollbar-color`/`scrollbar-width` using existing dark/gold/pewter theme variables. Keep scrollbar narrow and non-white.

- [ ] **Step 3: Remove Settings footer label**

Remove only the `Mythallar Grimoire` text node from `SettingsModal`; preserve surrounding version/footer layout unless empty wrapper becomes unnecessary.

- [ ] **Step 4: Increase pane contrast**

Change left pane from `bg-dnd-panel/30` to `bg-dnd-panel/40`. Change right pane from `bg-dnd-panel/10` to `bg-dnd-panel/5`.

- [ ] **Step 5: Prevent selected spell outline clipping**

Add minimal horizontal padding to the left SpellList scroll content/wrapper, preserving vertical overflow and existing spacing.

- [ ] **Step 6: Run verification**

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path; & "C:\Program Files\nodejs\npm.cmd" test -- --run
$env:Path = "C:\Program Files\nodejs;" + $env:Path; & "C:\Program Files\nodejs\npm.cmd" run build
```

Expected: 19 test files and 100 tests pass; Vite build succeeds.

- [ ] **Step 7: Visual review**

Check all scrollable regions, Settings modal, pane contrast, and selected spell outline at left edge.
