import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import SpellList from './SpellList';

describe('SpellList', () => {
  it('fills remaining pane height instead of 100% so the scroll track is not clipped', () => {
    const { container } = render(<SpellList spells={[]} />);
    const root = container.firstChild;
    expect(root).toHaveClass('flex-1', 'min-h-0');
    expect(root).not.toHaveClass('h-full');
  });

  it('allows collapsing and expanding individual level accordions independently', () => {
    const spells = [
      { id: 'fire-bolt', name: 'Fire Bolt', level: 0 },
      { id: 'shield', name: 'Shield', level: 1 },
      { id: 'misty-step', name: 'Misty Step', level: 2 },
    ];

    const { getByRole, queryByText } = render(<SpellList spells={spells} />);

    // Initially all levels open
    expect(queryByText('Fire Bolt')).toBeInTheDocument();
    expect(queryByText('Shield')).toBeInTheDocument();
    expect(queryByText('Misty Step')).toBeInTheDocument();

    // Toggle Cantrips closed
    const cantripsBtn = getByRole('button', { name: /Cantrips/i });
    fireEvent.click(cantripsBtn);

    // Cantrip hidden, but 1st and 2nd level spells remain visible (not mutually exclusive!)
    expect(queryByText('Fire Bolt')).not.toBeInTheDocument();
    expect(queryByText('Shield')).toBeInTheDocument();
    expect(queryByText('Misty Step')).toBeInTheDocument();

    // Toggle 1st Level closed
    const lvl1Btn = getByRole('button', { name: /1st Level Spells/i });
    fireEvent.click(lvl1Btn);

    expect(queryByText('Fire Bolt')).not.toBeInTheDocument();
    expect(queryByText('Shield')).not.toBeInTheDocument();
    expect(queryByText('Misty Step')).toBeInTheDocument();

    // Toggle Cantrips back open
    fireEvent.click(cantripsBtn);
    expect(queryByText('Fire Bolt')).toBeInTheDocument();
    expect(queryByText('Shield')).not.toBeInTheDocument();
    expect(queryByText('Misty Step')).toBeInTheDocument();
  });
});
