import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import CharacterHeader from './CharacterHeader';

const mockProfiles = [
  { id: 'c1', name: 'Mordenkainen', className: 'Wizard', level: 5 },
  { id: 'c2', name: 'Jareth', className: 'Warlock', level: 3 },
];

describe('CharacterHeader', () => {
  it('renders active character details and selectors', () => {
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
    expect(screen.getByDisplayValue('Wizard')).toBeInTheDocument();
    expect(screen.getByText('Lvl 5')).toBeInTheDocument();
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

    // Click edit name button
    const editBtn = screen.getByLabelText(/Edit Name/i);
    fireEvent.click(editBtn);

    const nameInput = screen.getByPlaceholderText('Character Name');
    fireEvent.change(nameInput, { target: { value: 'Bigby' } });

    // Save name
    const saveBtn = screen.getByLabelText(/Save Name/i);
    fireEvent.click(saveBtn);
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({ name: 'Bigby' }));

    const classSelect = screen.getByDisplayValue('Wizard');
    fireEvent.change(classSelect, { target: { value: 'Sorcerer' } });
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({ className: 'Sorcerer' }));
  });

  it('levels up with confirmation prompt and allows direct editing of level', () => {
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

    // Direct editing level via edit pencil button
    fireEvent.click(screen.getByLabelText(/Edit Level/i));
    const levelInput = screen.getByRole('spinbutton');
    fireEvent.change(levelInput, { target: { value: '8' } });
    fireEvent.click(screen.getByLabelText(/Save Level/i));
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({ level: 8 }));

    // Click Level Up plus button directly next to it
    fireEvent.click(screen.getByLabelText(/Level Up/i));
    expect(screen.getByText(/Level Up\?/i)).toBeInTheDocument();

    // Confirm Level Up
    fireEvent.click(screen.getByLabelText(/Confirm Level Up/i));
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({ level: 6 }));
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

    const exportBtn = screen.getByRole('button', { name: /Export/i });
    fireEvent.click(exportBtn);
    expect(handleExport).toHaveBeenCalled();
  });
});
