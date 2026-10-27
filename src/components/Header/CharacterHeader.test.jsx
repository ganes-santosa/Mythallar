import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import CharacterHeader from './CharacterHeader';

const mockProfiles = [
  { id: 'c1', name: 'Mordenkainen', className: 'Wizard', level: 5 },
  { id: 'c2', name: 'Jareth', className: 'Warlock', level: 3 },
];

describe('CharacterHeader', () => {
  it('renders active character details and character level badge with edit button', () => {
    render(
      <CharacterHeader
        activeCharacter={mockProfiles[0]}
        profiles={mockProfiles}
        onUpdateCharacter={vi.fn()}
        onSelectProfile={vi.fn()}
        onCreateProfile={vi.fn()}
        onExport={vi.fn()}
        onImport={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Mordenkainen' })).toBeInTheDocument();
    expect(screen.getByText('Wizard')).toBeInTheDocument();
    expect(screen.getByText(/Character Level/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Edit Profile')).toBeInTheDocument();
  });

  it('triggers onUpdateCharacter when name is edited and saved', () => {
    const handleUpdate = vi.fn();
    render(
      <CharacterHeader
        activeCharacter={mockProfiles[0]}
        profiles={mockProfiles}
        onUpdateCharacter={handleUpdate}
        onSelectProfile={vi.fn()}
        onCreateProfile={vi.fn()}
        onExport={vi.fn()}
        onImport={vi.fn()}
      />
    );

    // Click single Edit Profile button
    fireEvent.click(screen.getByLabelText('Edit Profile'));

    const nameInput = screen.getByPlaceholderText('Character Name');
    fireEvent.change(nameInput, { target: { value: 'Bigby' } });

    // Click Done (Save Profile) button
    const saveBtn = screen.getByLabelText('Save Profile');
    fireEvent.click(saveBtn);
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({ name: 'Bigby' }));
  });

  it('allows editing class and level when card edit button is clicked', () => {
    const handleUpdate = vi.fn();
    render(
      <CharacterHeader
        activeCharacter={mockProfiles[0]}
        profiles={mockProfiles}
        onUpdateCharacter={handleUpdate}
        onSelectProfile={vi.fn()}
        onCreateProfile={vi.fn()}
        onExport={vi.fn()}
        onImport={vi.fn()}
      />
    );

    // Click single Edit Profile button
    fireEvent.click(screen.getByLabelText('Edit Profile'));

    // Class dropdown is now visible
    const classSelect = screen.getByLabelText('Character Class 1');
    fireEvent.change(classSelect, { target: { value: 'Sorcerer' } });
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({ className: 'Sorcerer' }));

    // Level dropdown is now visible
    const levelSelect = screen.getByLabelText('Level for Wizard');
    fireEvent.change(levelSelect, { target: { value: '8' } });
    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 8,
        classes: [{ className: 'Wizard', level: 8 }],
      })
    );

    // Click Done to finish editing
    fireEvent.click(screen.getByLabelText('Save Profile'));
    expect(screen.queryByLabelText('Level for Wizard')).not.toBeInTheDocument();
  });

  it('levels up character using Level Up modal popup', () => {
    const handleUpdate = vi.fn();
    render(
      <CharacterHeader
        activeCharacter={mockProfiles[0]}
        profiles={mockProfiles}
        onUpdateCharacter={handleUpdate}
        onSelectProfile={vi.fn()}
        onCreateProfile={vi.fn()}
        onExport={vi.fn()}
        onImport={vi.fn()}
      />
    );

    // Click Level Up button on card
    const levelUpBtn = screen.getByRole('button', { name: /^Level Up$/i });
    fireEvent.click(levelUpBtn);

    expect(screen.getByText(/Choose class for Level 6:/i)).toBeInTheDocument();

    // Submit Level Up button inside modal
    const modalLevelUpBtn = screen.getAllByRole('button', { name: /^Level Up$/i })[1];
    fireEvent.click(modalLevelUpBtn);

    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 6,
        classes: [{ className: 'Wizard', level: 6 }],
      })
    );
  });

  it('allows multiclassing into a new class via Level Up modal popup', () => {
    const handleUpdate = vi.fn();
    render(
      <CharacterHeader
        activeCharacter={mockProfiles[0]}
        profiles={mockProfiles}
        onUpdateCharacter={handleUpdate}
        onSelectProfile={vi.fn()}
        onCreateProfile={vi.fn()}
        onExport={vi.fn()}
        onImport={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^Level Up$/i }));

    // Select + New Class (Multiclass)
    const newClassRadio = screen.getByDisplayValue('__new_class__');
    fireEvent.click(newClassRadio);

    const multiclassSelect = screen.getByLabelText('Select new multiclass');
    fireEvent.change(multiclassSelect, { target: { value: 'Paladin' } });

    // Submit Level Up
    const modalLevelUpBtn = screen.getAllByRole('button', { name: /^Level Up$/i })[1];
    fireEvent.click(modalLevelUpBtn);

    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 6,
        classes: [
          { className: 'Wizard', level: 5 },
          { className: 'Paladin', level: 1 },
        ],
      })
    );
  });

  it('supports adding and removing multiclass entries in edit mode', () => {
    const handleUpdate = vi.fn();
    const multiclassChar = {
      id: 'c3',
      name: 'Elminster',
      className: 'Wizard',
      level: 6,
      classes: [
        { className: 'Wizard', level: 4 },
        { className: 'Cleric', level: 2 },
      ],
    };

    const { rerender } = render(
      <CharacterHeader
        activeCharacter={multiclassChar}
        profiles={[multiclassChar]}
        onUpdateCharacter={handleUpdate}
        onSelectProfile={vi.fn()}
        onCreateProfile={vi.fn()}
        onExport={vi.fn()}
        onImport={vi.fn()}
      />
    );

    // Click single Edit Profile button
    fireEvent.click(screen.getByLabelText('Edit Profile'));

    // Remove button uses two-click confirmation
    const removeBtn = screen.getByLabelText('Remove Cleric');
    fireEvent.click(removeBtn);
    expect(handleUpdate).not.toHaveBeenCalled();
    const armedBtn = screen.getByLabelText('Click again to remove Cleric');
    expect(armedBtn).toHaveClass('text-red-500', 'bg-red-950/70', 'ring-1', 'ring-red-500/60');
    fireEvent.click(armedBtn);
    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 4,
        classes: [{ className: 'Wizard', level: 4 }],
      })
    );

    // Test add class button
    const singleClassChar = {
      id: 'c4',
      name: 'Single',
      className: 'Wizard',
      level: 4,
      classes: [{ className: 'Wizard', level: 4 }],
    };

    rerender(
      <CharacterHeader
        activeCharacter={singleClassChar}
        profiles={[singleClassChar]}
        onUpdateCharacter={handleUpdate}
        onSelectProfile={vi.fn()}
        onCreateProfile={vi.fn()}
        onExport={vi.fn()}
        onImport={vi.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText('Edit Profile'));
    const addClassBtn = screen.getByRole('button', { name: /Add Class/i });
    fireEvent.click(addClassBtn);
    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 5,
        classes: expect.arrayContaining([
          { className: 'Wizard', level: 4 },
          expect.objectContaining({ level: 1 }),
        ]),
      })
    );
  });

  it('triggers onExport when export button clicked', () => {
    const handleExport = vi.fn();
    render(
      <CharacterHeader
        activeCharacter={mockProfiles[0]}
        profiles={mockProfiles}
        onUpdateCharacter={vi.fn()}
        onSelectProfile={vi.fn()}
        onCreateProfile={vi.fn()}
        onExport={handleExport}
        onImport={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Export/i }));
    expect(handleExport).toHaveBeenCalled();
  });

  it('opens CharacterManagerModal when manage characters button is clicked', () => {
    const handleSelect = vi.fn();
    const handleDelete = vi.fn();
    render(
      <CharacterHeader
        activeCharacter={mockProfiles[0]}
        profiles={mockProfiles}
        onUpdateCharacter={vi.fn()}
        onSelectProfile={handleSelect}
        onCreateProfile={vi.fn()}
        onDeleteProfile={handleDelete}
        onExport={vi.fn()}
        onImport={vi.fn()}
      />
    );

    // Click button to open character manager modal
    const manageBtn = screen.getByRole('button', { name: /Manage Characters/i });
    fireEvent.click(manageBtn);

    // Modal is now open
    expect(screen.getByRole('heading', { level: 3, name: /Character Grimoires/i })).toBeInTheDocument();

    // Can select other character from modal
    const switchBtn = screen.getByRole('button', { name: /Switch to Jareth/i });
    fireEvent.click(switchBtn);
    expect(handleSelect).toHaveBeenCalledWith('c2');
  });
});
