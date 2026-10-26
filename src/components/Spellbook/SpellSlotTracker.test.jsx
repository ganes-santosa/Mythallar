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

  it('directly changes remaining slots to pip clicked via onSetSlotsUsed', () => {
    const handleSetSlotsUsed = vi.fn();
    render(
      <SpellSlotTracker
        character={mockCharacter}
        onUseSlot={vi.fn()}
        onRestoreSlot={vi.fn()}
        onSetSlotsUsed={handleSetSlotsUsed}
        onUpdateMaxSlot={vi.fn()}
        onLongRest={vi.fn()}
        onShortRest={vi.fn()}
      />
    );

    // Click 2nd pip on 1st level (max 4 slots, clicking index 1 -> targetRemaining 2 -> used 2)
    const pips = screen.getAllByLabelText(/Use 1st Level slot/i);
    fireEvent.click(pips[1]);
    expect(handleSetSlotsUsed).toHaveBeenCalledWith(1, 2);
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

  it('allows resetting max slots to rules default via reset button', () => {
    const handleResetMax = vi.fn();
    render(
      <SpellSlotTracker
        character={mockCharacter}
        onUseSlot={vi.fn()}
        onRestoreSlot={vi.fn()}
        onUpdateMaxSlot={vi.fn()}
        onResetMaxSlot={handleResetMax}
        onLongRest={vi.fn()}
        onShortRest={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^Edit$/i }));
    const resetBtn = screen.getByLabelText(/Reset max 1st Level slots to default/i);
    fireEvent.click(resetBtn);
    expect(handleResetMax).toHaveBeenCalledWith(1);
  });


  it('renders spell slots without prepared controls', () => {
    render(<SpellSlotTracker character={mockCharacter} onLongRest={vi.fn()} onShortRest={vi.fn()} />);
    expect(screen.queryByLabelText(/Edit Max Prepared/i)).not.toBeInTheDocument();
  });

  it('toggles hints for spell slot breakdown', () => {
    render(
      <SpellSlotTracker
        character={{
          id: 'char_2',
          name: 'Gandalf',
          classes: [
            { className: 'Wizard', level: 4 },
            { className: 'Cleric', level: 2 },
          ],
        }}
        onUseSlot={vi.fn()}
        onRestoreSlot={vi.fn()}
        onUpdateMaxSlot={vi.fn()}
        onLongRest={vi.fn()}
        onShortRest={vi.fn()}
      />
    );

    // Spell slot source breakdown hint
    const slotHintBtn = screen.getByLabelText(/Spell slots source breakdown/i);
    fireEvent.click(slotHintBtn);
    expect(screen.getByText(/Caster Level Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/Wizard \(Level 4\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Cleric \(Level 2\)/i)).toBeInTheDocument();

  });

  it('displays separate Pact Magic accordion when character has Warlock levels', () => {
    const handleShortRest = vi.fn();
    render(
      <SpellSlotTracker
        character={{
          id: 'char_3',
          name: 'Locky',
          classes: [
            { className: 'Sorcerer', level: 3 },
            { className: 'Warlock', level: 2 },
          ],
          pactSlotsUsed: 0,
        }}
        onUseSlot={vi.fn()}
        onRestoreSlot={vi.fn()}
        onUpdateMaxSlot={vi.fn()}
        onLongRest={vi.fn()}
        onShortRest={handleShortRest}
      />
    );

    expect(screen.getByText(/Pact Magic \(Short Rest\)/i)).toBeInTheDocument();

    // Short Rest button inside Pact Magic section
    const shortRestBtn = screen.getByRole('button', { name: /Short Rest/i });
    fireEvent.click(shortRestBtn);
    expect(handleShortRest).toHaveBeenCalled();
  });

  it('allows manual number input for max slots and clicking Done', () => {
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

    // Enter edit mode
    fireEvent.click(screen.getByRole('button', { name: /^Edit$/i }));

    // Manual input in SlotLevelRow
    const maxInput = screen.getByRole('spinbutton', { name: /^Max 1st Level slots$/i });
    expect(maxInput).toBeInTheDocument();
    fireEvent.change(maxInput, { target: { value: '6' } });
    expect(handleUpdateMax).toHaveBeenCalledWith(1, 6);

    // Done button exits edit mode
    const doneBtn = screen.getByRole('button', { name: /^Done$/i });
    fireEvent.click(doneBtn);
    expect(screen.queryByRole('spinbutton', { name: /^Max 1st Level slots$/i })).not.toBeInTheDocument();
  });

});


