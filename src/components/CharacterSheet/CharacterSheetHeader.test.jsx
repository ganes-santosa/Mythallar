import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CharacterSheetHeader from './CharacterSheetHeader';

const mockCharacter = {
  id: 'char-test-1',
  name: 'Aethelgard',
  className: 'Wizard',
  level: 5,
  classes: [
    { className: 'Wizard', level: 3 },
    { className: 'Cleric', level: 2 },
  ],
  sheet: {
    identity: {
      race: 'High Elf',
      subclass: 'Divination',
      background: 'Sage',
      portrait: 'data:image/webp;base64,mockWebpData',
    },
  },
};

describe('CharacterSheetHeader', () => {
  it('renders prominent portrait on the left and identity fields on the right', () => {
    render(
      <CharacterSheetHeader
        character={mockCharacter}
        profiles={[mockCharacter]}
        onUpdateCharacter={() => {}}
      />
    );

    // Portrait image exists
    const img = screen.getByRole('img', { name: 'Aethelgard' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'data:image/webp;base64,mockWebpData');

    // Right-side info
    expect(screen.getByRole('heading', { level: 2, name: 'Aethelgard' })).toBeInTheDocument();
    expect(screen.getByText(/Character Level/i)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    // Multiclass pills
    expect(screen.getByText('Wizard')).toBeInTheDocument();
    expect(screen.getByText(/Lvl 3/i)).toBeInTheDocument();
    expect(screen.getByText('Cleric')).toBeInTheDocument();
    expect(screen.getByText(/Lvl 2/i)).toBeInTheDocument();

    // Identity metadata fields
    expect(screen.getByDisplayValue('High Elf')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Divination')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Sage')).toBeInTheDocument();
  });

  it('renders placeholder avatar button when character has no portrait', () => {
    const noPortraitChar = {
      ...mockCharacter,
      sheet: {
        ...mockCharacter.sheet,
        identity: {
          race: 'Human',
          subclass: '',
          background: '',
          portrait: '',
        },
      },
    };

    render(
      <CharacterSheetHeader
        character={noPortraitChar}
        profiles={[noPortraitChar]}
        onUpdateCharacter={() => {}}
      />
    );

    expect(screen.getByText('Add Portrait')).toBeInTheDocument();
    const uploadBtn = screen.getByRole('button', { name: /Upload character portrait/i });
    expect(uploadBtn).toBeInTheDocument();
  });

  it('updates identity metadata field when user types in input', () => {
    const handleUpdate = vi.fn();
    render(
      <CharacterSheetHeader
        character={mockCharacter}
        profiles={[mockCharacter]}
        onUpdateCharacter={handleUpdate}
      />
    );

    const raceInput = screen.getByLabelText(/Race \/ Species/i);
    fireEvent.change(raceInput, { target: { value: 'Wood Elf' } });

    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        sheet: expect.objectContaining({
          identity: expect.objectContaining({
            race: 'Wood Elf',
          }),
        }),
      })
    );
  });

  it('allows inline editing of character name and classes', () => {
    const handleUpdate = vi.fn();
    render(
      <CharacterSheetHeader
        character={mockCharacter}
        profiles={[mockCharacter]}
        onUpdateCharacter={handleUpdate}
      />
    );

    const editBtn = screen.getByLabelText('Edit Profile');
    fireEvent.click(editBtn);

    const nameInput = screen.getByPlaceholderText('Character Name');
    fireEvent.change(nameInput, { target: { value: 'Aethelgard the Wise' } });

    const saveBtn = screen.getByLabelText('Save Profile');
    fireEvent.click(saveBtn);

    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Aethelgard the Wise',
      })
    );
  });
});
