import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LevelUpModal from './LevelUpModal';
import { buildLevel1Character } from '../../utils/characterGenerator';

const mockCharacter = {
  id: 'c1',
  name: 'Mordenkainen',
  className: 'Wizard',
  level: 4,
  classes: [{ className: 'Wizard', level: 4 }],
  abilities: { con: 14, int: 18 },
  levelUpChecklist: {},
};

describe('LevelUpModal', () => {
  it('renders class selection in levelup mode', () => {
    render(
      <LevelUpModal
        isOpen={true}
        onClose={vi.fn()}
        character={mockCharacter}
        initialMode="levelup"
        onConfirmLevelUp={vi.fn()}
        onUpdateCharacter={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /Level Up!/i })).toBeInTheDocument();
    expect(screen.getByText(/Choose Class for Level 5/i)).toBeInTheDocument();
    expect(screen.getByText('Wizard')).toBeInTheDocument();
  });

  it('confirms level up and closes modal without auto-opening guide', () => {
    const handleConfirmLevelUp = vi.fn();
    const handleClose = vi.fn();

    render(
      <LevelUpModal
        isOpen={true}
        onClose={handleClose}
        character={mockCharacter}
        initialMode="levelup"
        onConfirmLevelUp={handleConfirmLevelUp}
        onUpdateCharacter={vi.fn()}
      />
    );

    const levelUpBtn = screen.getByRole('button', { name: 'Level Up' });
    fireEvent.click(levelUpBtn);

    expect(handleConfirmLevelUp).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 5,
        classes: [{ className: 'Wizard', level: 5 }],
      })
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it('renders Level-Up Checklist in guide mode and allows checking off tasks', () => {
    const handleUpdate = vi.fn();

    render(
      <LevelUpModal
        isOpen={true}
        onClose={vi.fn()}
        character={mockCharacter}
        initialMode="guide"
        onConfirmLevelUp={vi.fn()}
        onUpdateCharacter={handleUpdate}
      />
    );

    expect(screen.getByRole('heading', { name: /Level-Up Checklist/i })).toBeInTheDocument();
    expect(screen.getByText(/Pending choices for your character sheet from your recent level-up:/i)).toBeInTheDocument();
    expect(screen.getByText(/Wizard Lvl 4/i)).toBeInTheDocument();
    const hpCheckbox = screen.getByLabelText(/Hit Points & Hit Dice/i);
    expect(hpCheckbox).not.toBeChecked();

    fireEvent.click(hpCheckbox);
    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        levelUpChecklist: expect.objectContaining({
          'hp-Wizard-4': true,
        }),
      })
    );
  });

  it('allows Dismiss All to mark all current tasks as done and close modal', () => {
    const handleUpdate = vi.fn();
    const handleClose = vi.fn();

    render(
      <LevelUpModal
        isOpen={true}
        onClose={handleClose}
        character={mockCharacter}
        initialMode="guide"
        onConfirmLevelUp={vi.fn()}
        onUpdateCharacter={handleUpdate}
      />
    );

    const dismissBtn = screen.getByRole('button', { name: 'Dismiss All' });
    fireEvent.click(dismissBtn);

    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        levelUpChecklist: expect.objectContaining({
          'hp-Wizard-4': true,
          'asi-Wizard-4': true,
          'spells-wizard-4': true,
        }),
      })
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it('renders passive notices without checkbox and with passive styling', () => {
    const lvl5Char = {
      ...mockCharacter,
      level: 5,
      classes: [{ className: 'Wizard', level: 5 }],
    };

    render(
      <LevelUpModal
        isOpen={true}
        onClose={vi.fn()}
        character={lvl5Char}
        initialMode="guide"
        onConfirmLevelUp={vi.fn()}
        onUpdateCharacter={vi.fn()}
      />
    );

    // Cantrip damage scaling should exist as text, but have no checkbox
    expect(screen.getByText('Cantrip Damage Scaling')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Cantrip Damage Scaling' })).not.toBeInTheDocument();
    expect(screen.getByText('Passive Rule')).toBeInTheDocument();

    // Action items should have checkboxes
    expect(screen.getByRole('checkbox', { name: 'Hit Points & Hit Dice' })).toBeInTheDocument();
    expect(screen.getByText('Vitals')).toBeInTheDocument();
  });

  it('allows multiclass characters to switch class guides in guide mode', () => {
    const multiChar = {
      ...mockCharacter,
      level: 5,
      classes: [
        { className: 'Wizard', level: 4 },
        { className: 'Fighter', level: 1 },
      ],
    };

    render(
      <LevelUpModal
        isOpen={true}
        onClose={vi.fn()}
        character={multiChar}
        initialMode="guide"
        onConfirmLevelUp={vi.fn()}
        onUpdateCharacter={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /Level-Up Checklist/i })).toBeInTheDocument();
    expect(screen.getByText(/Wizard Lvl 4/i)).toBeInTheDocument();

    const fighterTab = screen.getByRole('button', { name: /Fighter/i });
    fireEvent.click(fighterTab);

    expect(screen.getByText(/Fighter Lvl 1/i)).toBeInTheDocument();
  });

  it('levels up a builder-generated Level 1 character to Level 2', () => {
    const builderChar = buildLevel1Character({
      name: 'Bruenor',
      ruleset: '2024',
      selectedClass: { name: 'Fighter', hitDie: 10, hitDieString: 'd10' },
      selectedSpecies: { name: 'Dwarf' },
      selectedBackground: { name: 'Soldier', eligibleAbilities: ['str', 'con'] },
      baseScores: { str: 15, dex: 13, con: 14, int: 10, wis: 12, cha: 8 },
    });

    const handleConfirm = vi.fn();
    render(
      <LevelUpModal
        isOpen={true}
        onClose={vi.fn()}
        character={builderChar}
        initialMode="levelup"
        onConfirmLevelUp={handleConfirm}
        onUpdateCharacter={vi.fn()}
      />
    );

    expect(screen.getByText(/Choose Class for Level 2/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Level Up' }));

    expect(handleConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 2,
        className: 'Fighter',
        classes: [{ className: 'Fighter', level: 2 }],
      })
    );
  });
});
