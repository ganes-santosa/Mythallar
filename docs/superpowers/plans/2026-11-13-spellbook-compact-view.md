# Spellbook Compact View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a title-only, 2-column compact mode to the Spellbook accordion, toggled from its header, where clicking a card prepares or unprepares the spell.

**Architecture:** Extract the prepared bookmark strip from `SpellbookCard` into a shared component, build a minimal `SpellbookCompactCard` on top of it, and let `SpellbookLevelGroup` render either the existing list or a 2-column grid. `SpellbookView` owns the view-mode state and the header toggle.

**Tech Stack:** React 18, Tailwind 3, Lucide icons, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-13-spellbook-compact-view-design.md`

## Global Constraints

- No new dependencies.
- Normal (list) view must render exactly as today.
- Copying spells are greyed out and inert in compact mode.
- Cantrips (level 0) are rendered but inert in compact mode.
- No borders on nested cards; prepared emphasis uses rings and shadows only.
- Files use CRLF line endings.
- Tests first; full suite green and `npm.cmd run build` clean at the end.

## Review Focus

- Copying spell clicked in compact mode: must not call `onTogglePrepare`.
- Cantrip clicked in compact mode: must not call `onTogglePrepare`.
- Prepared spell in compact mode: same ivory strip and prepared ring as the full card.
- Toggling compact keeps each level's collapse state and prepared count.
- A long spell name truncates inside its grid cell instead of widening the column.

---

### Task 1: Shared `PreparedBookmarkStrip`

**Files:**
- Modify: `src/components/Spellbook/SpellbookCard.jsx:85-94`
- Test: `src/components/Spellbook/SpellbookCard.test.jsx` (create)

**Interfaces:**
- Consumes: nothing.
- Produces: `export function PreparedBookmarkStrip({ isPrepared })` from `src/components/Spellbook/SpellbookCard.jsx`. Renders the existing `data-testid="prepared-bookmark-strip"` div; `isPrepared` is a boolean.

- [ ] **Step 1: Write the failing test**

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import SpellbookCard, { PreparedBookmarkStrip } from './SpellbookCard';

const spell = { id: 'fireball', name: 'Fireball', level: 3, time: '1 action', range: '150 feet' };

describe('PreparedBookmarkStrip', () => {
  it('glows ivory when prepared', () => {
    render(<PreparedBookmarkStrip isPrepared />);
    expect(screen.getByTestId('prepared-bookmark-strip')).toHaveClass('bg-[#EFE9E0]');
  });

  it('stays faint when unprepared', () => {
    render(<PreparedBookmarkStrip isPrepared={false} />);
    expect(screen.getByTestId('prepared-bookmark-strip')).toHaveClass('bg-white/10');
  });

  it('is used by the full spell card', () => {
    render(<SpellbookCard spell={spell} isPrepared onTogglePrepare={vi.fn()} onCast={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByTestId('prepared-bookmark-strip')).toHaveClass('bg-[#EFE9E0]');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- --run src/components/Spellbook/SpellbookCard.test.jsx`
Expected: FAIL, `PreparedBookmarkStrip` is not exported.

- [ ] **Step 3: Extract the strip**

In `SpellbookCard.jsx`, add above the default export:

```jsx
export function PreparedBookmarkStrip({ isPrepared }) {
  return (
    <div
      data-testid="prepared-bookmark-strip"
      aria-hidden="true"
      className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg transition-all duration-300 z-10 ${
        isPrepared ? 'bg-[#EFE9E0] shadow-[0_0_8px_rgba(239,233,224,0.65)]' : 'bg-white/10'
      }`}
    />
  );
}
```

Replace the inline strip in the card body with `<PreparedBookmarkStrip isPrepared={effectivePrepared} />`. Delete the old markup; keep everything else identical.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- --run src/components/Spellbook/SpellbookCard.test.jsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Spellbook/SpellbookCard.jsx src/components/Spellbook/SpellbookCard.test.jsx
git commit -m "refactor: extract PreparedBookmarkStrip from SpellbookCard"
```

---

### Task 2: `SpellbookCompactCard`

**Files:**
- Create: `src/components/Spellbook/SpellbookCompactCard.jsx`
- Test: `src/components/Spellbook/SpellbookCompactCard.test.jsx` (create)

**Interfaces:**
- Consumes: `PreparedBookmarkStrip` from Task 1.
- Produces: default export `SpellbookCompactCard({ spell, isPrepared, isCopying = false, onTogglePrepare })`. Renders one `<button type="button">` with `data-testid={`spellbook-compact-card-${spell.id}`}` and `aria-label={`Toggle Prepared for ${spell.name}`}`.

- [ ] **Step 1: Write the failing tests**

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import SpellbookCompactCard from './SpellbookCompactCard';

const spell = { id: 'fireball', name: 'Fireball', level: 3 };
const base = { spell, isPrepared: false, onTogglePrepare: vi.fn() };

describe('SpellbookCompactCard', () => {
  it('shows only the title and toggles prepared on click', () => {
    const onTogglePrepare = vi.fn();
    render(<SpellbookCompactCard {...base} onTogglePrepare={onTogglePrepare} />);
    const card = screen.getByTestId('spellbook-compact-card-fireball');
    expect(card).toHaveTextContent('Fireball');
    expect(card).not.toHaveTextContent('1 action');
    expect(card).toHaveClass('min-w-0');
    expect(card.querySelector('span')).toHaveClass('truncate');
    fireEvent.click(card);
    expect(onTogglePrepare).toHaveBeenCalledWith('fireball');
  });

  it('shows the prepared strip and ring when prepared', () => {
    render(<SpellbookCompactCard {...base} isPrepared />);
    expect(screen.getByTestId('prepared-bookmark-strip')).toHaveClass('bg-[#EFE9E0]');
    expect(screen.getByTestId('spellbook-compact-card-fireball')).toHaveClass('ring-1', 'ring-white/30');
  });

  it('greys out and ignores a copying spell', () => {
    const onTogglePrepare = vi.fn();
    render(<SpellbookCompactCard {...base} isCopying onTogglePrepare={onTogglePrepare} />);
    const card = screen.getByTestId('spellbook-compact-card-fireball');
    expect(card).toHaveTextContent('Fireball');
    expect(card.querySelector('span')).toHaveClass('text-slate-500');
    fireEvent.click(card);
    expect(onTogglePrepare).not.toHaveBeenCalled();
  });

  it('ignores cantrips', () => {
    const onTogglePrepare = vi.fn();
    render(<SpellbookCompactCard spell={{ id: 'acid-splash', name: 'Acid Splash', level: 0 }} isPrepared={false} onTogglePrepare={onTogglePrepare} />);
    fireEvent.click(screen.getByTestId('spellbook-compact-card-acid-splash'));
    expect(onTogglePrepare).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm.cmd test -- --run src/components/Spellbook/SpellbookCompactCard.test.jsx`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement the component**

```jsx
import React from 'react';
import { PreparedBookmarkStrip } from './SpellbookCard';

function SpellbookCompactCard({ spell, isPrepared, isCopying = false, onTogglePrepare }) {
  const interactive = spell.level > 0 && !isCopying;
  const effectivePrepared = isPrepared && !isCopying;

  return (
    <button
      type="button"
      data-testid={`spellbook-compact-card-${spell.id}`}
      aria-label={`Toggle Prepared for ${spell.name}`}
      onClick={() => interactive && onTogglePrepare?.(spell.id)}
      disabled={!interactive}
      title={
        isCopying
          ? `${spell.name} is being copied`
          : spell.level === 0
          ? `${spell.name} is always available`
          : effectivePrepared
          ? 'Click to unprepare spell'
          : 'Click to prepare spell'
      }
      className={`relative flex w-full min-w-0 items-center rounded-lg bg-dnd-card py-1.5 pl-3.5 pr-2 text-left transition-[box-shadow,background-color] duration-150 select-none overflow-hidden ${
        effectivePrepared
          ? 'ring-1 ring-white/30 shadow-[0_0_14px_rgba(255,255,255,0.09)]'
          : interactive
          ? 'hover:bg-dnd-hover/80 cursor-pointer'
          : 'cursor-default'
      }`}
    >
      <PreparedBookmarkStrip isPrepared={effectivePrepared} />
      <span
        className={`min-w-0 truncate text-xs font-semibold ${
          isCopying ? 'text-slate-500' : 'text-slate-100'
        }`}
      >
        {spell.name}
      </span>
    </button>
  );
}

export default React.memo(SpellbookCompactCard);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm.cmd test -- --run src/components/Spellbook/SpellbookCompactCard.test.jsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Spellbook/SpellbookCompactCard.jsx src/components/Spellbook/SpellbookCompactCard.test.jsx
git commit -m "feat: add title-only SpellbookCompactCard"
```

---

### Task 3: Compact mode in the level groups and header toggle

**Files:**
- Modify: `src/components/Spellbook/SpellbookLevelGroup.jsx`
- Modify: `src/components/Spellbook/SpellbookView.jsx`
- Test: `src/components/Spellbook/SpellbookView.test.jsx`

**Interfaces:**
- Consumes: `SpellbookCompactCard` from Task 2.
- Produces: `SpellbookLevelGroup` accepts `compact = false`. `SpellbookView` renders a header button with `aria-label` `Switch to compact spellbook view` (list mode) or `Switch to list spellbook view` (compact mode), and a `data-testid="spellbook-compact-grid-{level}"` wrapper.

- [ ] **Step 1: Write the failing integration tests**

Append inside the existing `describe('SpellbookView')` in `SpellbookView.test.jsx`:

```jsx
it('toggles between the list and a 2-column compact view from the header', () => {
  render(
    <SpellbookView character={mockCharacter} catalog={mockCatalog} onTogglePrepare={vi.fn()} />
  );

  expect(screen.getByTestId('spellbook-level-content-3')).toBeInTheDocument();
  expect(screen.queryByTestId('spellbook-compact-grid-3')).not.toBeInTheDocument();

  fireEvent.click(screen.getByLabelText('Switch to compact spellbook view'));

  expect(screen.getByTestId('spellbook-compact-grid-3')).toHaveClass('grid-cols-2');
  expect(screen.getByTestId('spellbook-compact-grid-0')).toHaveClass('grid-cols-2');
  expect(screen.getByLabelText('Switch to list spellbook view')).toBeInTheDocument();
  expect(screen.getByText(/3rd Level Spells/i)).toBeInTheDocument();
});

it('prepares a spell by clicking its compact card', () => {
  const handleToggle = vi.fn();
  render(
    <SpellbookView character={mockCharacter} catalog={mockCatalog} onTogglePrepare={handleToggle} />
  );

  fireEvent.click(screen.getByLabelText('Switch to compact spellbook view'));
  fireEvent.click(screen.getByTestId('spellbook-compact-card-fireball'));

  expect(handleToggle).toHaveBeenCalledWith('fireball');
});

it('keeps level collapse state when switching views', () => {
  render(
    <SpellbookView character={mockCharacter} catalog={mockCatalog} onTogglePrepare={vi.fn()} />
  );

  fireEvent.click(screen.getByRole('button', { name: /3rd Level Spells/i }));
  fireEvent.click(screen.getByLabelText('Switch to compact spellbook view'));

  expect(screen.getByRole('button', { name: /3rd Level Spells/i })).toHaveAttribute('aria-expanded', 'false');
  expect(screen.getByTestId('spellbook-level-content-3')).toHaveClass('grid-rows-[0fr]');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm.cmd test -- --run src/components/Spellbook/SpellbookView.test.jsx`
Expected: FAIL, `Switch to compact spellbook view` not found.

- [ ] **Step 3: Implement `compact` in `SpellbookLevelGroup`**

Import `SpellbookCompactCard`. Add `compact = false` to the props. Replace the `space-y-1 pt-1.5` list with:

```jsx
{compact ? (
  <div className="grid grid-cols-2 gap-1.5 pt-1.5" data-testid={`spellbook-compact-grid-${level}`}>
    {spells.map((spell) => (
      <SpellbookCompactCard
        key={spell.id}
        spell={spell}
        isPrepared={Boolean(preparedMap[spell.id])}
        isCopying={Boolean(copyingMap[spell.id])}
        onTogglePrepare={onTogglePrepare}
      />
    ))}
  </div>
) : (
  <div className="space-y-1 pt-1.5">
    {/* existing SpellbookCard map unchanged */}
  </div>
)}
```

- [ ] **Step 4: Implement the toggle in `SpellbookView`**

Add `StretchHorizontal` and `Table` to the lucide import. Add `const [isCompact, setIsCompact] = useState(false);` beside the other view state. Insert before the Filters button in the header actions cluster:

```jsx
<button
  type="button"
  aria-label={isCompact ? 'Switch to list spellbook view' : 'Switch to compact spellbook view'}
  onClick={() => setIsCompact((prev) => !prev)}
  className="p-1 rounded text-slate-400 hover:text-dnd-gold hover:bg-white/5 transition-colors"
  title={isCompact ? 'Switch to list spellbook view' : 'Switch to compact spellbook view'}
>
  {isCompact ? <Table size={13} /> : <StretchHorizontal size={13} />}
</button>
```

Pass `compact={isCompact}` to every `SpellbookLevelGroup`.

- [ ] **Step 5: Run the targeted tests**

Run: `npm.cmd test -- --run src/components/Spellbook/SpellbookView.test.jsx src/components/Spellbook/SpellbookCompactCard.test.jsx src/components/Spellbook/SpellbookCard.test.jsx`
Expected: PASS.

- [ ] **Step 6: Run the full suite and build**

Run: `npm.cmd test -- --run` then `npm.cmd run build`
Expected: all test files pass; build clean.

- [ ] **Step 7: Commit**

```bash
git add src/components/Spellbook/SpellbookLevelGroup.jsx src/components/Spellbook/SpellbookView.jsx src/components/Spellbook/SpellbookView.test.jsx docs/superpowers/specs/2026-11-13-spellbook-compact-view-design.md docs/superpowers/plans/2026-11-13-spellbook-compact-view.md
git commit -m "feat: add compact 2-column spellbook view with header toggle"
```
