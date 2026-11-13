# Spellbook Compact View — Design

Date: 2026-11-13
Status: Awaiting approval
Size: Small change

## Intent

A spellbook can hold dozens of spells, and the full cards (name, time, range, actions)
are heavy for scanning. A compact, title-only 2-column layout lets a player see the
whole list at a glance and prepare/unprepare with one click. The full view remains the
place for casting, copying, notes and details.

## Goals

- Icon-only toggle in the Spellbook accordion header, immediately left of Filters.
- Compact mode: 2-column grid of title-only cards.
- Clicking a compact card prepares/unprepares the spell.
- Keep the left bookmark strip and its prepared/unprepared behaviour exactly as now.
- Same colours, surfaces and hover treatment as the normal card.
- Normal (list) view is unchanged.

## Non-goals

- No copy/expand/cast/remove actions in compact mode.
- No per-spell colours or inventory-style gradients.
- No change to search, filters, level collapse, prepared counts, or the empty state.
- Copying spells are greyed out and inert in compact mode; copying is handled in the
  normal view.

## Behaviour

- Level headers (`Cantrips`, `1st Level Spells`, …) stay, each with its prepared count
  and its existing collapse state. A 2-column grid of compact cards sits under each.
- Compact card = spell title only, truncated to one line.
- Prepared: same ivory left strip with glow, `ring-1 ring-white/30` and soft shadow.
  Unprepared: faint white strip, `bg-dnd-card` with `hover:bg-dnd-hover/80`.
- Copying: title greyed to `text-slate-500`, card not clickable.
- Cantrips (level 0): rendered, but not clickable — they have no prepared state.
- View mode is component state; it resets on reload.

## Approaches considered

1. **Separate `SpellbookCompactCard` component, reused strip (chosen).** Small, testable,
   keeps `SpellbookCard` untouched, and lets the compact markup stay minimal. Trade-off:
   a little duplication of the strip markup, avoided by exporting one strip component.
2. **A `compact` prop on `SpellbookCard`.** No new file, but the component already has
   expand/copy/remove logic and hooks; a compact branch would complicate every render path.
3. **Inline compact markup inside `SpellbookLevelGroup`.** Fewest files, but the level
   group would own presentation for two different card shapes.

## Implementation outline

- `SpellbookCard.jsx`: export `PreparedBookmarkStrip` (the existing strip markup and
  classes) and use it in the full card.
- New `SpellbookCompactCard.jsx`: title-only button using `PreparedBookmarkStrip`.
- `SpellbookLevelGroup.jsx`: accept `compact`; render a `grid grid-cols-2 gap-1.5`
  of compact cards instead of the `space-y-1` list when set.
- `SpellbookView.jsx`: `isCompact` state, toggle button before Filters with
  `StretchHorizontal` (list) / `Table` (compact) at 13px, `aria-label`
  `Switch to compact spellbook view` / `Switch to list spellbook view`, and pass
  `compact` down.

## Constraints

- No new dependencies; Lucide icons already installed.
- Title Case for any label; the toggle is icon-only with an accessible name.
- No borders on nested elements; prepared emphasis uses rings and shadows only.
- TDD: tests first, suite green, build clean.
