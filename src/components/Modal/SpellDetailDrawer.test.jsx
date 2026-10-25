import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import SpellDetailDrawer from './SpellDetailDrawer';

const mockSpell = {
  id: 'fireball',
  name: 'Fireball',
  level: 3,
  school: 'Evocation',
  time: '1 action',
  range: '150 feet',
  components: { v: true, s: true, m: 'a tiny ball of bat guano and sulfur' },
  duration: 'Instantaneous',
  concentration: false,
  ritual: false,
  classes: ['Sorcerer', 'Wizard'],
  entries: [
    'A bright streak flashes from your pointing finger to a point you choose.',
    'The fire spreads around corners.',
  ],
  higherLevels: 'When you cast this spell using a spell slot of 4th level or higher...',
};

describe('SpellDetailDrawer', () => {
  it('renders complete spell statistics and text', () => {
    render(
      <SpellDetailDrawer
        spell={mockSpell}
        isInSpellbook={false}
        onAddToSpellbook={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Fireball')).toBeInTheDocument();
    expect(screen.getByText('3rd Level Evocation')).toBeInTheDocument();
    expect(screen.getByText('1 action')).toBeInTheDocument();
    expect(screen.getByText('150 feet')).toBeInTheDocument();
    expect(screen.getByText(/a tiny ball of bat guano/i)).toBeInTheDocument();
    expect(screen.getByText(/A bright streak flashes/i)).toBeInTheDocument();
    expect(screen.getByText(/At Higher Levels/i)).toBeInTheDocument();
  });

  it('triggers onAddToSpellbook when Add button clicked', () => {
    const handleAdd = vi.fn();
    render(
      <SpellDetailDrawer
        spell={mockSpell}
        isInSpellbook={false}
        onAddToSpellbook={handleAdd}
        onClose={vi.fn()}
      />
    );

    const addBtn = screen.getByRole('button', { name: /Add to Spellbook/i });
    fireEvent.click(addBtn);
    expect(handleAdd).toHaveBeenCalledWith(mockSpell.id);
  });

  it('indicates when spell is already in spellbook', () => {
    render(
      <SpellDetailDrawer
        spell={mockSpell}
        isInSpellbook={true}
        onAddToSpellbook={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/Already in Spellbook/i)).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const handleClose = vi.fn();
    render(
      <SpellDetailDrawer
        spell={mockSpell}
        isInSpellbook={false}
        onAddToSpellbook={vi.fn()}
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByLabelText(/Close/i);
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });
});
