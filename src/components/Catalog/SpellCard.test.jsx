import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import SpellCard from './SpellCard';

const mockSpell = {
  id: 'fireball',
  name: 'Fireball',
  level: 3,
  school: 'Evocation',
  time: '1 action',
  range: '150 feet',
  concentration: false,
  ritual: false,
};

describe('SpellCard', () => {
  it('renders spell name and metadata badges', () => {
    render(<SpellCard spell={mockSpell} onSelect={vi.fn()} isInSpellbook={false} />);
    expect(screen.getByText('Fireball')).toBeInTheDocument();
    expect(screen.getByText('Lvl 3')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Evocation' })).toBeInTheDocument();
  });

  it('toggles accordion dropdown with spell details on click', () => {
    const spellWithDetails = {
      ...mockSpell,
      entries: ['A bright streak flashes from your finger.'],
      higherLevels: 'Damage increases by 1d6.',
    };
    render(<SpellCard spell={spellWithDetails} onSelect={vi.fn()} isInSpellbook={false} />);
    
    // Initially accordion details are hidden
    expect(screen.queryByText(/A bright streak flashes/i)).not.toBeInTheDocument();

    // Click card to expand accordion
    fireEvent.click(screen.getByText('Fireball'));
    expect(screen.getByText(/A bright streak flashes/i)).toBeInTheDocument();
    expect(screen.getByText(/Damage increases by 1d6/i)).toBeInTheDocument();
    expect(screen.getByText('Evocation')).toBeInTheDocument();

    // Click card again to collapse
    fireEvent.click(screen.getByText('Fireball'));
    expect(screen.queryByText(/A bright streak flashes/i)).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Evocation' })).toBeInTheDocument();
  });

  it('shows in-spellbook indicator when added', () => {
    render(<SpellCard spell={mockSpell} onSelect={vi.fn()} isInSpellbook={true} />);
    expect(screen.getByText(/In Book/i)).toBeInTheDocument();
  });

  it('sets drag transfer data on drag start', () => {
    const { container } = render(<SpellCard spell={mockSpell} onSelect={vi.fn()} isInSpellbook={false} />);
    const card = container.firstChild;
    const setData = vi.fn();
    fireEvent.dragStart(card, {
      dataTransfer: { setData, effectAllowed: '' },
    });
    expect(setData).toHaveBeenCalledWith('text/plain', 'fireball');
  });

  it('renders legacy badge with neutral container and theme accent text for legacy spells matching spellbook dimensions', () => {
    const legacySpell = {
      ...mockSpell,
      id: 'fireball-legacy',
      name: 'Fireball',
      isLegacy: true,
    };
    render(<SpellCard spell={legacySpell} onSelect={vi.fn()} isInSpellbook={false} />);
    const badge = screen.getByText('Legacy');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-dnd-panel/80');
    expect(badge).toHaveClass('text-dnd-pewter');
    expect(badge).toHaveClass('text-[9px]');
    expect(badge).toHaveClass('h-4');
    expect(badge).toHaveClass('inline-flex');
    expect(badge).toHaveClass('items-center');
    expect(badge).toHaveClass('justify-center');
    expect(badge).toHaveClass('leading-none');
    expect(badge).toHaveClass('px-1.5');
    expect(badge).toHaveClass('pb-0.5');
  });

  it('renders and invokes delete button for homebrew spells', () => {
    const handleDelete = vi.fn();
    const homebrewSpell = {
      ...mockSpell,
      id: 'hb_spell_1',
      name: 'Void Dart',
      source: 'Homebrew',
    };
    render(
      <SpellCard
        spell={homebrewSpell}
        onSelect={vi.fn()}
        onDeleteHomebrew={handleDelete}
        isInSpellbook={false}
      />
    );

    // Expand
    fireEvent.click(screen.getByText('Void Dart'));
    const deleteBtn = screen.getByRole('button', { name: /Delete homebrew spell Void Dart/i });
    expect(deleteBtn).toBeInTheDocument();
    fireEvent.click(deleteBtn);
    // After first click, button is armed with two-click confirmation
    const armedBtn = screen.getByRole('button', { name: /Click again to delete Void Dart/i });
    expect(armedBtn).toHaveClass('text-red-500', 'bg-red-950/70');
    fireEvent.click(armedBtn);
    expect(handleDelete).toHaveBeenCalledWith('hb_spell_1');
  });
});
