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

    expect(screen.getByDisplayValue('Mordenkainen')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Wizard')).toBeInTheDocument();
    expect(screen.getByLabelText(/Character Level/i)).toHaveValue('5');
  });

  it('triggers onUpdateCharacter when name or class changed', () => {
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

    const nameInput = screen.getByDisplayValue('Mordenkainen');
    fireEvent.change(nameInput, { target: { value: 'Bigby' } });
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({ name: 'Bigby' }));

    const classSelect = screen.getByDisplayValue('Wizard');
    fireEvent.change(classSelect, { target: { value: 'Sorcerer' } });
    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({ className: 'Sorcerer' }));
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
