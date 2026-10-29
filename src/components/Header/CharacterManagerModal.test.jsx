import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import CharacterManagerModal from './CharacterManagerModal';

const mockProfiles = [
  { id: 'c1', name: 'Mordenkainen', className: 'Wizard', level: 9, spells: [{ id: 's1' }] },
  { id: 'c2', name: 'Astarion', className: 'Rogue', level: 3, spells: [] },
  { id: 'c3', name: 'Gale of Waterdeep', className: 'Wizard', level: 12, spells: [{ id: 's1' }, { id: 's2' }] },
];

describe('CharacterManagerModal', () => {
  it('renders all characters with names, levels, and classes', () => {
    render(
      <CharacterManagerModal
        isOpen={true}
        onClose={vi.fn()}
        profiles={mockProfiles}
        activeId="c1"
        onSelectProfile={vi.fn()}
        onCreateProfile={vi.fn()}
        onDeleteProfile={vi.fn()}
      />
    );

    expect(screen.getByText('Mordenkainen')).toBeInTheDocument();
    expect(screen.getByText('Astarion')).toBeInTheDocument();
    expect(screen.getByText('Gale of Waterdeep')).toBeInTheDocument();
  });

  it('sorts characters by level descending by default', () => {
    render(
      <CharacterManagerModal
        isOpen={true}
        onClose={vi.fn()}
        profiles={mockProfiles}
        activeId="c1"
        onSelectProfile={vi.fn()}
        onCreateProfile={vi.fn()}
        onDeleteProfile={vi.fn()}
      />
    );

    const characterHeadings = screen.getAllByRole('heading', { level: 4 }).map((h) => h.textContent);
    // Highest level first: Gale (12), Mordenkainen (9), Astarion (3)
    expect(characterHeadings[0]).toBe('Gale of Waterdeep');
    expect(characterHeadings[1]).toBe('Mordenkainen');
    expect(characterHeadings[2]).toBe('Astarion');
  });

  it('allows sorting by name ascending', () => {
    render(
      <CharacterManagerModal
        isOpen={true}
        onClose={vi.fn()}
        profiles={mockProfiles}
        activeId="c1"
        onSelectProfile={vi.fn()}
        onCreateProfile={vi.fn()}
        onDeleteProfile={vi.fn()}
      />
    );

    const sortSelect = screen.getByLabelText(/Sort Characters/i);
    fireEvent.change(sortSelect, { target: { value: 'name-asc' } });

    const characterHeadings = screen.getAllByRole('heading', { level: 4 }).map((h) => h.textContent);
    // Name asc: Astarion, Gale, Mordenkainen
    expect(characterHeadings[0]).toBe('Astarion');
    expect(characterHeadings[1]).toBe('Gale of Waterdeep');
    expect(characterHeadings[2]).toBe('Mordenkainen');
  });

  it('triggers onSelectProfile and closes when selecting a character', () => {
    const handleSelect = vi.fn();
    const handleClose = vi.fn();

    render(
      <CharacterManagerModal
        isOpen={true}
        onClose={handleClose}
        profiles={mockProfiles}
        activeId="c1"
        onSelectProfile={handleSelect}
        onCreateProfile={vi.fn()}
        onDeleteProfile={vi.fn()}
      />
    );

    const selectAstarionBtn = screen.getByRole('button', { name: /Switch to Astarion/i });
    fireEvent.click(selectAstarionBtn);

    expect(handleSelect).toHaveBeenCalledWith('c2');
    expect(handleClose).toHaveBeenCalled();
  });

  it('requires confirmation before calling onDeleteProfile', () => {
    const handleDelete = vi.fn();

    render(
      <CharacterManagerModal
        isOpen={true}
        onClose={vi.fn()}
        profiles={mockProfiles}
        activeId="c1"
        onSelectProfile={vi.fn()}
        onCreateProfile={vi.fn()}
        onDeleteProfile={handleDelete}
      />
    );

    const deleteBtn = screen.getByRole('button', { name: /Delete Astarion/i });
    fireEvent.click(deleteBtn);

    const armedBtn = screen.getByRole('button', { name: /Click again to delete Astarion/i });
    expect(armedBtn).toHaveClass('text-red-500', 'bg-red-950/70');

    fireEvent.click(armedBtn);
    expect(handleDelete).toHaveBeenCalledWith('c2');
  });

  it('creates character and closes modal on single click', () => {
    const handleCreate = vi.fn();
    const handleClose = vi.fn();
    render(
      <CharacterManagerModal
        isOpen={true}
        onClose={handleClose}
        profiles={mockProfiles}
        activeId="c1"
        onSelectProfile={vi.fn()}
        onCreateProfile={handleCreate}
        onDeleteProfile={vi.fn()}
      />
    );

    const createBtn = screen.getByRole('button', { name: /New Character/i });
    fireEvent.click(createBtn);
    expect(handleCreate).toHaveBeenCalledOnce();
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('allows deleting character when only one profile exists and closes modal', () => {
    const handleDelete = vi.fn();
    const handleClose = vi.fn();
    const singleProfile = [{ id: 'c1', name: 'Lone Adventurer', className: 'Wizard', level: 1 }];

    render(
      <CharacterManagerModal
        isOpen={true}
        onClose={handleClose}
        profiles={singleProfile}
        activeId="c1"
        onSelectProfile={vi.fn()}
        onCreateProfile={vi.fn()}
        onDeleteProfile={handleDelete}
      />
    );

    const deleteBtn = screen.getByRole('button', { name: /Delete Lone Adventurer/i });
    expect(deleteBtn).toBeInTheDocument();

    fireEvent.click(deleteBtn);
    const armedBtn = screen.getByRole('button', { name: /Click again to delete Lone Adventurer/i });
    fireEvent.click(armedBtn);

    expect(handleDelete).toHaveBeenCalledWith('c1');
    expect(handleClose).toHaveBeenCalled();
  });
});
