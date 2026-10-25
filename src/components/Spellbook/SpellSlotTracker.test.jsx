import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import SpellSlotTracker from './SpellSlotTracker';

const mockCharacter = {
  id: 'char_1',
  name: 'Mordenkainen',
  className: 'Wizard',
  level: 5,
  slotsUsed: {
    1: 1, // 1 used out of 4 (3 left)
    2: 0,
    3: 2, // 2 used out of 2 (0 left)
  },
  customSlots: {},
};

describe('SpellSlotTracker', () => {
  it('renders active spell levels and remaining slot counters', () => {
    render(
      <SpellSlotTracker
        character={mockCharacter}
        onUseSlot={vi.fn()}
        onRestoreSlot={vi.fn()}
        onUpdateMaxSlot={vi.fn()}
        onLongRest={vi.fn()}
        onShortRest={vi.fn()}
      />
    );

    expect(screen.getByText('1st Level')).toBeInTheDocument();
    expect(screen.getByText('2nd Level')).toBeInTheDocument();
    expect(screen.getByText('3rd Level')).toBeInTheDocument();
    expect(screen.getByText('3 / 4')).toBeInTheDocument();
  });

  it('handles slot pip click to use an available slot', () => {
    const handleUse = vi.fn();
    render(
      <SpellSlotTracker
        character={mockCharacter}
        onUseSlot={handleUse}
        onRestoreSlot={vi.fn()}
        onUpdateMaxSlot={vi.fn()}
        onLongRest={vi.fn()}
        onShortRest={vi.fn()}
      />
    );

    // Level 1 has 3 remaining pips
    const availablePip = screen.getAllByLabelText(/Use 1st Level slot/i)[0];
    fireEvent.click(availablePip);
    expect(handleUse).toHaveBeenCalledWith(1);
  });

  it('handles slot pip click to restore an expended slot', () => {
    const handleRestore = vi.fn();
    render(
      <SpellSlotTracker
        character={mockCharacter}
        onUseSlot={vi.fn()}
        onRestoreSlot={handleRestore}
        onUpdateMaxSlot={vi.fn()}
        onLongRest={vi.fn()}
        onShortRest={vi.fn()}
      />
    );

    // Level 1 has 1 expended pip
    const usedPip = screen.getByLabelText(/Restore 1st Level slot/i);
    fireEvent.click(usedPip);
    expect(handleRestore).toHaveBeenCalledWith(1);
  });

  it('calls onLongRest with confirmation prompt when Long Rest button is clicked', () => {
    const handleLongRest = vi.fn();
    render(
      <SpellSlotTracker
        character={mockCharacter}
        onUseSlot={vi.fn()}
        onRestoreSlot={vi.fn()}
        onUpdateMaxSlot={vi.fn()}
        onLongRest={handleLongRest}
        onShortRest={vi.fn()}
      />
    );

    const restBtn = screen.getByRole('button', { name: /Long Rest/i });
    fireEvent.click(restBtn);
    expect(screen.getByText(/Long Rest\?/i)).toBeInTheDocument();

    const confirmBtn = screen.getByLabelText(/Confirm Long Rest/i);
    fireEvent.click(confirmBtn);
    expect(handleLongRest).toHaveBeenCalled();
  });

  it('allows editing max slots when Edit is toggled', () => {
    const handleUpdateMax = vi.fn();
    render(
      <SpellSlotTracker
        character={mockCharacter}
        onUseSlot={vi.fn()}
        onRestoreSlot={vi.fn()}
        onUpdateMaxSlot={handleUpdateMax}
        onLongRest={vi.fn()}
        onShortRest={vi.fn()}
      />
    );

    const editToggle = screen.getByRole('button', { name: /^Edit$/i });
    fireEvent.click(editToggle);

    const plusBtn = screen.getByLabelText(/Increase max 1st Level slots/i);
    fireEvent.click(plusBtn);
    expect(handleUpdateMax).toHaveBeenCalledWith(1, 5); // 4 + 1 = 5
  });

  it('allows editing max prepared spells', () => {
    const handleUpdate = vi.fn();
    render(
      <SpellSlotTracker
        character={mockCharacter}
        onUseSlot={vi.fn()}
        onRestoreSlot={vi.fn()}
        onUpdateMaxSlot={vi.fn()}
        onLongRest={vi.fn()}
        onShortRest={vi.fn()}
        onUpdateCharacter={handleUpdate}
      />
    );

    fireEvent.click(screen.getByLabelText(/Edit Max Prepared/i));
    const prepInput = screen.getByPlaceholderText('Max');
    fireEvent.change(prepInput, { target: { value: '12' } });
    fireEvent.click(screen.getByLabelText(/Save Max Prepared/i));

    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ customMaxPrepared: 12 })
    );
  });
});
