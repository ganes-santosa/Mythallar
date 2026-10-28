import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import SpellNoteSection from './SpellNoteSection';

describe('SpellNoteSection', () => {
  it('renders "Add Note" button when note is empty', () => {
    render(<SpellNoteSection note="" spellName="Fireball" onSaveNote={vi.fn()} />);

    const addBtn = screen.getByRole('button', { name: /Add note for Fireball/i });
    expect(addBtn).toBeInTheDocument();
  });

  it('opens textarea on "Add Note" click and submits new note', () => {
    const handleSave = vi.fn();
    render(<SpellNoteSection note="" spellName="Fireball" onSaveNote={handleSave} />);

    fireEvent.click(screen.getByRole('button', { name: /Add note for Fireball/i }));

    const textarea = screen.getByPlaceholderText(/Add a note for this spell/i);
    expect(textarea).toBeInTheDocument();

    fireEvent.change(textarea, { target: { value: 'Good for crowd control' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Note/i }));

    expect(handleSave).toHaveBeenCalledWith('Good for crowd control');
  });

  it('renders existing note with Edit and Delete options', () => {
    const handleSave = vi.fn();
    render(
      <SpellNoteSection
        note="Components: bat guano in left pouch"
        spellName="Fireball"
        onSaveNote={handleSave}
      />
    );

    expect(screen.getByText('Note:')).toBeInTheDocument();
    expect(screen.getByText('Components: bat guano in left pouch')).toBeInTheDocument();

    // Edit note
    fireEvent.click(screen.getByRole('button', { name: /Edit note for Fireball/i }));
    const textarea = screen.getByPlaceholderText(/Add a note for this spell/i);
    expect(textarea.value).toBe('Components: bat guano in left pouch');

    // Delete note
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    fireEvent.click(screen.getByRole('button', { name: /Delete note for Fireball/i }));
    expect(handleSave).toHaveBeenCalledWith('');
  });
});
