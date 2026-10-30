import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ArcaneRecoveryModal from './ArcaneRecoveryModal';

describe('ArcaneRecoveryModal', () => {
  const wizardCharacter = {
    className: 'Wizard',
    level: 5,
    slotsUsed: { 1: 2, 2: 2, 3: 1 },
  };

  const effectiveSlots = { 1: 4, 2: 3, 3: 2 };

  it('renders modal with recovery budget based on wizard level', () => {
    render(
      <ArcaneRecoveryModal
        isOpen={true}
        onClose={vi.fn()}
        character={wizardCharacter}
        effectiveSlots={effectiveSlots}
        slotsUsed={wizardCharacter.slotsUsed}
        onRecoverSlots={vi.fn()}
      />
    );

    expect(screen.getByText(/Arcane Recovery/i)).toBeInTheDocument();
    // Wizard 5 -> ceil(5/2) = 3 levels
    expect(screen.getByText(/Max 3 slot levels/i)).toBeInTheDocument();
    expect(screen.getByText(/0 \/ 3 levels/i)).toBeInTheDocument();
  });

  it('allows incrementing and decrementing slot recovery within budget', () => {
    const handleRecover = vi.fn();
    render(
      <ArcaneRecoveryModal
        isOpen={true}
        onClose={vi.fn()}
        character={wizardCharacter}
        effectiveSlots={effectiveSlots}
        slotsUsed={wizardCharacter.slotsUsed}
        onRecoverSlots={handleRecover}
      />
    );

    const incLvl1 = screen.getByLabelText(/Increase recovered level 1 slots/i);
    const incLvl2 = screen.getByLabelText(/Increase recovered level 2 slots/i);
    const decLvl1 = screen.getByLabelText(/Decrease recovered level 1 slots/i);

    // Clickable plus button has theme color bg-dnd-gold; minus button stays bg-dnd-card
    expect(incLvl1).toHaveClass('bg-dnd-gold');
    expect(decLvl1).toHaveClass('bg-dnd-card');

    fireEvent.click(incLvl1); // 1 point used (cost 1)
    expect(decLvl1).toHaveClass('bg-dnd-card');

    fireEvent.click(incLvl2); // 2 points used (cost 1 + 2 = 3)

    expect(screen.getByText(/3 \/ 3 levels/i)).toBeInTheDocument();
    // Budget exhausted, incLvl1 should be disabled and have bg-dnd-card
    expect(incLvl1).toBeDisabled();
    expect(incLvl1).toHaveClass('bg-dnd-card');

    // Confirm recovery
    const recoverBtn = screen.getByRole('button', { name: /Recover Slots/i });
    fireEvent.click(recoverBtn);

    expect(handleRecover).toHaveBeenCalledWith({
      1: 1,
      2: 1,
    });
  });

  it('shows warning when already used today', () => {
    const charUsed = { ...wizardCharacter, arcaneRecoveryUsed: true };
    const handleReset = vi.fn();
    render(
      <ArcaneRecoveryModal
        isOpen={true}
        onClose={vi.fn()}
        character={charUsed}
        effectiveSlots={effectiveSlots}
        slotsUsed={wizardCharacter.slotsUsed}
        onRecoverSlots={vi.fn()}
        onResetUsedFlag={handleReset}
      />
    );

    expect(screen.getByText(/Already used today/i)).toBeInTheDocument();
    const resetBtn = screen.getByRole('button', { name: /Reset/i });
    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalled();
  });
});
