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

    const { getByRole, getByTestId, queryByText } = render(<SpellList spells={spells} />);

    // Initially all levels open
    expect(queryByText('Fire Bolt')).toBeInTheDocument();
    expect(queryByText('Shield')).toBeInTheDocument();
    expect(queryByText('Misty Step')).toBeInTheDocument();

    // Toggle Cantrips closed
    const cantripsBtn = getByRole('button', { name: /Cantrips/i });
    expect(cantripsBtn).toHaveAttribute('aria-expanded', 'true');
    expect(getByTestId('level-content-0')).toHaveClass('grid-rows-[1fr]');

    fireEvent.click(cantripsBtn);

    // Cantrip collapsed with animation classes, but 1st and 2nd level spells remain open
    expect(cantripsBtn).toHaveAttribute('aria-expanded', 'false');
    expect(getByTestId('level-content-0')).toHaveClass('grid-rows-[0fr]');
    expect(getByTestId('level-content-1')).toHaveClass('grid-rows-[1fr]');
    expect(getByTestId('level-content-2')).toHaveClass('grid-rows-[1fr]');

    // Toggle 1st Level closed
    const lvl1Btn = getByRole('button', { name: /1st Level Spells/i });
    expect(lvl1Btn).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(lvl1Btn);

    expect(cantripsBtn).toHaveAttribute('aria-expanded', 'false');
    expect(lvl1Btn).toHaveAttribute('aria-expanded', 'false');
    expect(getByTestId('level-content-0')).toHaveClass('grid-rows-[0fr]');
    expect(getByTestId('level-content-1')).toHaveClass('grid-rows-[0fr]');
    expect(getByTestId('level-content-2')).toHaveClass('grid-rows-[1fr]');

    // Toggle Cantrips back open
    fireEvent.click(cantripsBtn);
    expect(cantripsBtn).toHaveAttribute('aria-expanded', 'true');
    expect(lvl1Btn).toHaveAttribute('aria-expanded', 'false');
    expect(getByTestId('level-content-0')).toHaveClass('grid-rows-[1fr]');
    expect(getByTestId('level-content-1')).toHaveClass('grid-rows-[0fr]');
    expect(getByTestId('level-content-2')).toHaveClass('grid-rows-[1fr]');
  });
});
