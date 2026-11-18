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

  it('prompts for subclass selection when leveling to subclass level', async () => {
    const lvl2Fighter = {
      id: 'c2',
      name: 'Fighter Guy',
      className: 'Fighter',
      level: 2,
      ruleset: '2024',
      classes: [{ className: 'Fighter', level: 2 }],
      abilities: { con: 14 },
    };

    const handleConfirm = vi.fn();
    render(
      <LevelUpModal
        isOpen={true}
        onClose={vi.fn()}
        character={lvl2Fighter}
        initialMode="levelup"
        onConfirmLevelUp={handleConfirm}
        onUpdateCharacter={vi.fn()}
      />
    );

    // Wait for async class/subclass dataset to load options into select
    await screen.findAllByRole('option', { name: /Battle Master/i });

    const subclassSelect = screen.getByLabelText(/Select Martial Archetype/i);
    expect(subclassSelect).toBeInTheDocument();

    fireEvent.change(subclassSelect, { target: { value: 'Battle Master' } });
    fireEvent.click(screen.getByRole('button', { name: 'Level Up' }));

    expect(handleConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 3,
        className: 'Fighter',
        classes: [{ className: 'Fighter', level: 3, subclass: 'Battle Master' }],
      })
    );
  });

  it('preserves distinct per-class subclasses when leveling a multiclass character', async () => {
    const multiChar = {
      id: 'c3',
      name: 'Eldritch Scholar',
      className: 'Wizard',
      level: 5,
      ruleset: '2024',
      classes: [
        { className: 'Wizard', level: 3, subclass: 'Diviner' },
        { className: 'Fighter', level: 2 },
      ],
      abilities: { con: 12 },
    };

    const handleConfirm = vi.fn();
    render(
      <LevelUpModal
        isOpen={true}
        onClose={vi.fn()}
        character={multiChar}
        initialMode="levelup"
        onConfirmLevelUp={handleConfirm}
        onUpdateCharacter={vi.fn()}
      />
    );

    // Pick Fighter radio button to level Fighter 2 -> 3
    const fighterRadio = screen.getByRole('radio', { name: /Fighter/i });
    fireEvent.click(fighterRadio);

    // Wait for async class/subclass options for Fighter to appear
    await screen.findAllByRole('option', { name: /Eldritch Knight/i });

    const subclassSelect = screen.getByLabelText(/Select Martial Archetype/i);
    expect(subclassSelect).toBeInTheDocument();
    fireEvent.change(subclassSelect, { target: { value: 'Eldritch Knight' } });

    fireEvent.click(screen.getByRole('button', { name: 'Level Up' }));

    expect(handleConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 6,
        classes: [
          { className: 'Wizard', level: 3, subclass: 'Diviner' },
          { className: 'Fighter', level: 3, subclass: 'Eldritch Knight' },
        ],
      })
    );
  });

  it('supports custom subclass text input in subclass prompt', async () => {
    const lvl2Barbarian = {
      id: 'c4',
      name: 'Rage Monster',
      className: 'Barbarian',
      level: 2,
      ruleset: '2024',
      classes: [{ className: 'Barbarian', level: 2 }],
      abilities: { con: 16 },
    };

    const handleConfirm = vi.fn();
    render(
      <LevelUpModal
        isOpen={true}
        onClose={vi.fn()}
        character={lvl2Barbarian}
        initialMode="levelup"
        onConfirmLevelUp={handleConfirm}
        onUpdateCharacter={vi.fn()}
      />
    );

    const subclassSelect = await screen.findByLabelText(/Select Primal Path/i);
    expect(subclassSelect).toBeInTheDocument();
    fireEvent.change(subclassSelect, { target: { value: '__custom__' } });

    const customInput = screen.getByLabelText(/Custom Subclass Name/i);
    fireEvent.change(customInput, { target: { value: 'Path of the Stormherald Homebrew' } });

    fireEvent.click(screen.getByRole('button', { name: 'Level Up' }));

    expect(handleConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 3,
        classes: [{ className: 'Barbarian', level: 3, subclass: 'Path of the Stormherald Homebrew' }],
      })
    );
  });

  it('automatically adds a formatted note with subclass features when picking a subclass', async () => {
    const lvl1Wizard = {
      id: 'c4',
      name: 'Evocation Apprentice',
      className: 'Wizard',
      level: 1,
      ruleset: '2014',
      classes: [{ className: 'Wizard', level: 1 }],
      sheet: {
        notes: [{ id: 'n1', title: 'Spellbook Recipe', content: 'Ink and parchment' }],
      },
    };

    const handleConfirm = vi.fn();
    const handleShowToast = vi.fn();
    render(
      <LevelUpModal
        isOpen={true}
        onClose={vi.fn()}
        character={lvl1Wizard}
        initialMode="levelup"
        onConfirmLevelUp={handleConfirm}
        onUpdateCharacter={vi.fn()}
        onShowToast={handleShowToast}
      />
    );

    // Wait for async options to load
    await screen.findAllByRole('option', { name: /School of Evocation/i });

    const subclassSelect = screen.getByLabelText(/Select Arcane Tradition/i);
    fireEvent.change(subclassSelect, { target: { value: 'School of Evocation' } });

    fireEvent.click(screen.getByRole('button', { name: 'Level Up' }));

    expect(handleConfirm).toHaveBeenCalledTimes(1);
    const confirmedChar = handleConfirm.mock.calls[0][0];

    expect(confirmedChar.classes[0].subclass).toBe('School of Evocation');
    expect(confirmedChar.sheet.notes).toHaveLength(2);
    expect(confirmedChar.levelUpChecklist['subclass-Wizard-2']).toBe(true);
    expect(handleShowToast).toHaveBeenCalledWith('Added School of Evocation features to Notes', 'success');

    const subclassNote = confirmedChar.sheet.notes[0];
    expect(subclassNote.title).toBe('School of Evocation');
    expect(subclassNote.content).toContain('Source:');
    expect(subclassNote.content).toContain('Evocation Savant');
    expect(subclassNote.content).toContain('Sculpt Spells');
  });

  it('keeps Choose Subclass checklist entry active and does not toast if user ignores subclass dropdown', async () => {
    const lvl1Wizard = {
      id: 'c-wiz-1',
      name: 'Raistlin',
      className: 'Wizard',
      level: 1,
      ruleset: '2014',
      classes: [{ className: 'Wizard', level: 1 }],
      sheet: {
        notes: [{ id: 'n1', title: 'Spellbook Recipe', content: 'Ink and parchment' }],
      },
    };

    const handleConfirm = vi.fn();
    const handleShowToast = vi.fn();
    const { rerender } = render(
      <LevelUpModal
        isOpen={true}
        onClose={vi.fn()}
        character={lvl1Wizard}
        initialMode="levelup"
        onConfirmLevelUp={handleConfirm}
        onUpdateCharacter={vi.fn()}
        onShowToast={handleShowToast}
      />
    );

    await screen.findAllByRole('option', { name: /School of Evocation/i });

    // User does not change subclass dropdown and clicks Level Up
    fireEvent.click(screen.getByRole('button', { name: 'Level Up' }));

    expect(handleConfirm).toHaveBeenCalledTimes(1);
    const confirmedChar = handleConfirm.mock.calls[0][0];

    expect(confirmedChar.classes[0].subclass).toBeFalsy();
    expect(confirmedChar.sheet.notes).toHaveLength(1);
    expect(confirmedChar.levelUpChecklist?.['subclass-Wizard-2']).toBeFalsy();
    expect(handleShowToast).not.toHaveBeenCalled();

    // In Guide mode, Choose Subclass is active and NOT crossed out
    rerender(
      <LevelUpModal
        isOpen={true}
        onClose={vi.fn()}
        character={{
          ...confirmedChar,
          classes: [{ className: 'Wizard', level: 2 }],
        }}
        initialMode="guide"
        onConfirmLevelUp={vi.fn()}
        onUpdateCharacter={vi.fn()}
      />
    );

    const subclassCheckbox = screen.getByRole('checkbox', { name: /Choose Subclass/i });
    expect(subclassCheckbox).not.toBeChecked();
    const subclassLabel = screen.getByText(/Choose Subclass/i);
    expect(subclassLabel).not.toHaveClass('line-through');
  });

  it('renders Choose Subclass crossed out in Guide mode when user picked subclass via prompt', async () => {
    const leveledChar = {
      id: 'c-wiz-2',
      name: 'Raistlin',
      className: 'Wizard',
      level: 2,
      ruleset: '2014',
      classes: [{ className: 'Wizard', level: 2, subclass: 'School of Evocation' }],
      levelUpChecklist: {
        'subclass-Wizard-2': true,
      },
      sheet: {
        notes: [],
      },
    };

    render(
      <LevelUpModal
        isOpen={true}
        onClose={vi.fn()}
        character={leveledChar}
        initialMode="guide"
        onConfirmLevelUp={vi.fn()}
        onUpdateCharacter={vi.fn()}
      />
    );

    const subclassCheckbox = screen.getByRole('checkbox', { name: /Choose Subclass/i });
    expect(subclassCheckbox).toBeChecked();
    const subclassLabel = screen.getByText(/Choose Subclass/i);
    expect(subclassLabel).toHaveClass('line-through');
  });
});
