import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ShortRestModal from './ShortRestModal';

describe('ShortRestModal', () => {
  const mockCharacter = {
    id: 'char_1',
    name: 'Mordenkainen',
    className: 'Wizard',
    level: 5,
    slotsUsed: { 1: 2, 2: 1 },
    sheet: {
      vitals: {
        hpCurrent: 18,
        hpMax: 30,
        hpMaxBuff: 0,
        hpTemp: 0,
        hitDice: {
          current: 4,
          max: 5,
          die: 'd6',
          pools: {
            d6: { current: 4, max: 5, classNames: ['Wizard'] },
          },
        },
      },
      abilities: {
        con: 14, // +2 mod
      },
    },
  };

  it('renders Short Rest header, character HP status, CON mod, and available hit dice', () => {
    render(
      <ShortRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={mockCharacter}
        onRollHitDie={vi.fn()}
        onCompleteShortRest={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /Short Rest/i })).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('/ 30')).toBeInTheDocument();
    expect(screen.getByText('+2 CON Mod')).toBeInTheDocument();
    expect(screen.getByText(/4 \/ 5 d6/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Roll 1d6/i })).toBeInTheDocument();
  });

  it('calls onRollHitDie with dieSides when Roll button is clicked', () => {
    const handleRoll = vi.fn();
    render(
      <ShortRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={mockCharacter}
        onRollHitDie={handleRoll}
        onCompleteShortRest={vi.fn()}
      />
    );

    const rollBtn = screen.getByRole('button', { name: /Roll 1d6/i });
    fireEvent.click(rollBtn);
    expect(handleRoll).toHaveBeenCalledWith('d6');
  });

  it('allows entering manual physical die roll and submitting via onRollHitDie', () => {
    const handleRoll = vi.fn();
    render(
      <ShortRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={mockCharacter}
        onRollHitDie={handleRoll}
        onCompleteShortRest={vi.fn()}
      />
    );

    const manualInput = screen.getByLabelText('Physical Roll d6');
    fireEvent.change(manualInput, { target: { value: '5' } });

    const applyBtn = screen.getByRole('button', { name: /Apply d6/i });
    fireEvent.click(applyBtn);

    expect(handleRoll).toHaveBeenCalledWith('d6', 5);
  });

  it('disables roll actions when HP is already at maximum or pool is empty', () => {
    const fullHpChar = {
      ...mockCharacter,
      sheet: {
        ...mockCharacter.sheet,
        vitals: {
          ...mockCharacter.sheet.vitals,
          hpCurrent: 30,
        },
      },
    };

    const { rerender } = render(
      <ShortRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={fullHpChar}
        onRollHitDie={vi.fn()}
        onCompleteShortRest={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /Roll 1d6/i })).toBeDisabled();

    // Rerender with empty pool
    const emptyPoolChar = {
      ...mockCharacter,
      sheet: {
        ...mockCharacter.sheet,
        vitals: {
          ...mockCharacter.sheet.vitals,
          hpCurrent: 10,
          hitDice: {
            ...mockCharacter.sheet.vitals.hitDice,
            pools: {
              d6: { current: 0, max: 5, classNames: ['Wizard'] },
            },
          },
        },
      },
    };

    rerender(
      <ShortRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={emptyPoolChar}
        onRollHitDie={vi.fn()}
        onCompleteShortRest={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /Roll 1d6/i })).toBeDisabled();
  });

  it('renders embedded Arcane Recovery for Wizards and completes rest with staged slots', () => {
    const handleComplete = vi.fn();
    render(
      <ShortRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={mockCharacter}
        effectiveSlots={{ 1: 4, 2: 3, 3: 2 }}
        slotsUsed={{ 1: 2, 2: 1 }}
        onRollHitDie={vi.fn()}
        onCompleteShortRest={handleComplete}
      />
    );

    expect(screen.getByText('Arcane Recovery')).toBeInTheDocument();
    expect(screen.getByText(/Recovery budget:/i)).toBeInTheDocument();

    // Increment 1st-level recovery
    const incBtn = screen.getByLabelText(/Increase recovered level 1 slots/i);
    fireEvent.click(incBtn);

    const finishBtn = screen.getByRole('button', { name: /Finish Short Rest/i });
    fireEvent.click(finishBtn);

    expect(handleComplete).toHaveBeenCalledWith(expect.objectContaining({ 1: 1 }));
  });

  it('renders already-used notice when Wizard has already used Arcane Recovery', () => {
    const usedWizardChar = {
      ...mockCharacter,
      arcaneRecoveryUsed: true,
    };

    render(
      <ShortRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={usedWizardChar}
        effectiveSlots={{ 1: 4, 2: 3 }}
        slotsUsed={{ 1: 2 }}
        onRollHitDie={vi.fn()}
        onCompleteShortRest={vi.fn()}
      />
    );

    expect(screen.getByText(/Arcane Recovery already used today/i)).toBeInTheDocument();
  });

  it('renders Pact Magic restoration notice for Warlocks', () => {
    const warlockChar = {
      id: 'char_warlock',
      name: 'Wyll',
      className: 'Warlock',
      level: 5,
      sheet: {
        vitals: {
          hpCurrent: 25,
          hpMax: 40,
          hitDice: {
            pools: {
              d8: { current: 3, max: 5, classNames: ['Warlock'] },
            },
          },
        },
        abilities: { con: 12 },
      },
    };

    render(
      <ShortRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={warlockChar}
        onRollHitDie={vi.fn()}
        onCompleteShortRest={vi.fn()}
      />
    );

    expect(screen.getByText(/Pact Magic slots will be restored/i)).toBeInTheDocument();
    // Non-wizard should not render Arcane Recovery
    expect(screen.queryByText('Arcane Recovery')).not.toBeInTheDocument();
  });
});
