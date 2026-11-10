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

    // Identity metadata fields displayed as static text when not editing
    expect(screen.getByText('High Elf')).toBeInTheDocument();
    expect(screen.getByText('Divination')).toBeInTheDocument();
    expect(screen.getByText('Sage')).toBeInTheDocument();
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

  it('updates identity metadata field when user is editing and types in input', () => {
    const handleUpdate = vi.fn();
    render(
      <CharacterSheetHeader
        character={mockCharacter}
        profiles={[mockCharacter]}
        onUpdateCharacter={handleUpdate}
      />
    );

    // Enter edit mode
    const editBtn = screen.getByLabelText('Edit Profile');
    fireEvent.click(editBtn);

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

  it('renders Character Lore sub-accordion and allows editing text', () => {
    const handleUpdate = vi.fn();
    const charWithLore = {
      ...mockCharacter,
      sheet: {
        ...mockCharacter.sheet,
        identity: {
          ...mockCharacter.sheet.identity,
          lore: 'Born in Silverymoon under an eclipse.',
        },
      },
    };

    render(
      <CharacterSheetHeader
        character={charWithLore}
        profiles={[charWithLore]}
        onUpdateCharacter={handleUpdate}
      />
    );

    // Header exists
    expect(screen.getByText('Character Lore')).toBeInTheDocument();

    // Click Edit Character Lore opens editor and expands
    const editLoreBtn = screen.getByLabelText('Edit Character Lore');
    fireEvent.click(editLoreBtn);

    const textarea = screen.getByLabelText('Character Lore Text Editor');
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe('Born in Silverymoon under an eclipse.');

    fireEvent.change(textarea, { target: { value: 'Exiled scholar seeking Netherese relics.' } });

    // Click Save Character Lore
    const saveLoreBtn = screen.getByLabelText('Save Character Lore');
    fireEvent.click(saveLoreBtn);

    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        sheet: expect.objectContaining({
          identity: expect.objectContaining({
            lore: 'Exiled scholar seeking Netherese relics.',
          }),
        }),
      })
    );
  });

  it('allows expanding and collapsing Character Lore sub-accordion', () => {
    const charWithLore = {
      ...mockCharacter,
      sheet: {
        ...mockCharacter.sheet,
        identity: {
          ...mockCharacter.sheet.identity,
          lore: 'Born in Silverymoon under an eclipse.',
        },
      },
    };

    render(
      <CharacterSheetHeader
        character={charWithLore}
        profiles={[charWithLore]}
        onUpdateCharacter={() => {}}
      />
    );

    // Starts slim and collapsed
    const expandBtn = screen.getByLabelText('Expand Character Lore');
    expect(expandBtn).toBeInTheDocument();

    // Click to expand
    fireEvent.click(expandBtn);
    expect(screen.getByLabelText('Collapse Character Lore')).toBeInTheDocument();
    expect(screen.getByText('Born in Silverymoon under an eclipse.')).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(screen.getByLabelText('Collapse Character Lore'));
    expect(screen.getByLabelText('Expand Character Lore')).toBeInTheDocument();
  });

  it('renders background inside Character Lore section and updates background on edit', () => {
    const handleUpdate = vi.fn();
    render(
      <CharacterSheetHeader
        character={mockCharacter}
        profiles={[mockCharacter]}
        onUpdateCharacter={handleUpdate}
      />
    );

    // Expand lore
    const expandBtn = screen.getByLabelText('Expand Character Lore');
    fireEvent.click(expandBtn);

    // Background label is inside lore
    expect(screen.getByText('Background')).toBeInTheDocument();
    expect(screen.getByText('Sage')).toBeInTheDocument();

    // Enter edit mode
    const editBtn = screen.getByLabelText('Edit Profile');
    fireEvent.click(editBtn);

    const bgInput = screen.getByLabelText('Background');
    fireEvent.change(bgInput, { target: { value: 'Cloistered Scholar' } });

    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        sheet: expect.objectContaining({
          identity: expect.objectContaining({
            background: 'Cloistered Scholar',
          }),
        }),
      })
    );
  });

  it('renders speed horizontally below race and subclass and allows updating walking speed and optional speeds', () => {
    const handleUpdate = vi.fn();
    const charWithSpeeds = {
      ...mockCharacter,
      sheet: {
        ...mockCharacter.sheet,
        vitals: {
          ...mockCharacter.sheet.vitals,
          speed: 30,
          speeds: { walk: 30, fly: 60 },
        },
      },
    };

    render(
      <CharacterSheetHeader
        character={charWithSpeeds}
        profiles={[charWithSpeeds]}
        onUpdateCharacter={handleUpdate}
      />
    );

    expect(screen.getByText('Walking Speed')).toBeInTheDocument();
    expect(screen.getByText('30 ft')).toBeInTheDocument();
    expect(screen.getByText('Fly:')).toBeInTheDocument();
    expect(screen.getByText('60 ft')).toBeInTheDocument();

    // Enter edit mode
    const editBtn = screen.getByLabelText('Edit Profile');
    fireEvent.click(editBtn);

    // Walking speed input
    const walkInput = screen.getByLabelText('Walking Speed');
    fireEvent.change(walkInput, { target: { value: '35' } });

    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        sheet: expect.objectContaining({
          vitals: expect.objectContaining({
            speed: 35,
            speeds: expect.objectContaining({ walk: 35 }),
          }),
        }),
      })
    );

    // Remove flying speed
    const removeFlyBtn = screen.getByLabelText('Remove Fly speed');
    fireEvent.click(removeFlyBtn);
    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        sheet: expect.objectContaining({
          vitals: expect.objectContaining({
            speeds: { walk: 30 },
          }),
        }),
      })
    );
  });

  it('allows adding optional speed types like swim or custom speed types via + Speed button', () => {
    const handleUpdate = vi.fn();
    render(
      <CharacterSheetHeader
        character={mockCharacter}
        profiles={[mockCharacter]}
        onUpdateCharacter={handleUpdate}
      />
    );

    // Click + Speed button
    const addSpeedBtn = screen.getByLabelText('+ Add Speed');
    fireEvent.click(addSpeedBtn);

    // Select custom speed
    const select = screen.getByLabelText('Movement Type');
    fireEvent.change(select, { target: { value: 'custom' } });

    const customNameInput = screen.getByLabelText('Custom Speed Name');
    fireEvent.change(customNameInput, { target: { value: 'Hover' } });

    const distInput = screen.getByLabelText('Speed Distance');
    fireEvent.change(distInput, { target: { value: '25' } });

    const submitBtn = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(submitBtn);

    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        sheet: expect.objectContaining({
          vitals: expect.objectContaining({
            speeds: expect.objectContaining({
              hover: 25,
            }),
          }),
        }),
      })
    );
  });

  it('applies uniform Level 3 bg-dnd-panel/70 to race, subclass, and secondary speed chips', () => {
    const charWithDetails = {
      ...mockCharacter,
      sheet: {
        ...mockCharacter.sheet,
        identity: {
          race: 'Elf',
          subclass: 'Evocation',
        },
        vitals: {
          ...mockCharacter.sheet.vitals,
          speeds: { walk: 30, fly: 60 },
        },
      },
    };

    render(
      <CharacterSheetHeader
        character={charWithDetails}
        profiles={[charWithDetails]}
        onUpdateCharacter={vi.fn()}
      />
    );

    const raceEl = screen.getByText('Elf');
    expect(raceEl.className).toContain('bg-dnd-panel/70');

    const subclassEl = screen.getByText('Evocation');
    expect(subclassEl.className).toContain('bg-dnd-panel/70');

    const flyEl = screen.getByText('Fly:').closest('div');
    expect(flyEl.className).toContain('bg-dnd-panel/70');
  });

  it('opens Level-Up Checklist modal when exclamation badge on name is clicked', () => {
    render(
      <CharacterSheetHeader
        character={mockCharacter}
        profiles={[mockCharacter]}
        onUpdateCharacter={vi.fn()}
      />
    );

    const actionBadge = screen.getByRole('button', { name: 'Level-Up Checklist' });
    expect(actionBadge).toBeInTheDocument();
    fireEvent.click(actionBadge);

    expect(screen.getByRole('heading', { name: /Level-Up Checklist/i })).toBeInTheDocument();
  });
});
