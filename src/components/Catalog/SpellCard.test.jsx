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
    expect(screen.getByText('Evocation')).toBeInTheDocument();
  });

  it('triggers onSelect when card clicked', () => {
    const handleSelect = vi.fn();
    render(<SpellCard spell={mockSpell} onSelect={handleSelect} isInSpellbook={false} />);
    fireEvent.click(screen.getByText('Fireball'));
    expect(handleSelect).toHaveBeenCalledWith(mockSpell);
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
});
