import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NotesCard, { normalizeNotes } from './NotesCard';

describe('normalizeNotes', () => {
  it('converts legacy string notes into structured notes array', () => {
    const res = normalizeNotes('Legacy session log');
    expect(res).toHaveLength(1);
    expect(res[0].title).toBe('General');
    expect(res[0].content).toBe('Legacy session log');
  });

  it('provides default note when empty or invalid', () => {
    expect(normalizeNotes('')).toHaveLength(1);
    expect(normalizeNotes([])).toHaveLength(1);
    expect(normalizeNotes(null)).toHaveLength(1);
  });

  it('prunes empty clutter notes that have no content or custom title', () => {
    const raw = [
      { id: 'n1', title: 'Quests', content: 'Find the relic', updatedAt: '2026-11-04T10:00:00.000Z', pinned: false },
      { id: 'n2', title: 'New Note', content: '', updatedAt: '2026-11-04T10:00:00.000Z', pinned: false },
      { id: 'n3', title: '', content: '   ', updatedAt: '2026-11-04T10:00:00.000Z', pinned: false },
    ];
    const res = normalizeNotes(raw);
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('n1');
  });

  it('preserves valid array of notes', () => {
    const raw = [
      { id: 'n1', title: 'Quests', content: 'Find the relic', updatedAt: '2026-11-04T10:00:00.000Z', pinned: false },
      { id: 'n2', title: 'NPCs', content: 'Durnan', updatedAt: '2026-11-04T11:00:00.000Z', pinned: true },
    ];
    const res = normalizeNotes(raw);
    expect(res).toEqual(raw);
  });
});

describe('NotesCard', () => {
  const mockNotes = [
    { id: 'n1', title: 'Quests', content: 'Find the crystal', updatedAt: '2026-11-04T10:00:00.000Z', pinned: false },
    { id: 'n2', title: 'NPCs', content: 'Elminster at Shadowdale', updatedAt: '2026-11-04T11:00:00.000Z', pinned: false },
  ];

  it('renders active note in unified document canvas with title and content', () => {
    render(<NotesCard notes={mockNotes} onUpdateNotes={() => {}} />);

    const titleInput = screen.getByLabelText('Note Title');
    expect(titleInput).toBeInTheDocument();
    expect(titleInput).toHaveValue('Quests');

    const contentArea = screen.getByLabelText('Note Content');
    expect(contentArea).toBeInTheDocument();
    expect(contentArea).toHaveValue('Find the crystal');
  });

  it('updates note content on edit', () => {
    const handleUpdate = vi.fn();
    render(<NotesCard notes={mockNotes} onUpdateNotes={handleUpdate} />);

    fireEvent.change(screen.getByLabelText('Note Content'), {
      target: { value: 'Find the crystal in Netheril' },
    });

    expect(handleUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 'n1', content: 'Find the crystal in Netheril' }),
        mockNotes[1],
      ])
    );
  });

  it('allows selecting entire title and backspacing to empty without deleting note or exiting editor', () => {
    const handleUpdate = vi.fn();
    render(<NotesCard notes={mockNotes} onUpdateNotes={handleUpdate} />);

    const titleInput = screen.getByLabelText('Note Title');
    expect(titleInput).toHaveValue('Quests');

    // User selects all and presses backspace (clearing title)
    fireEvent.change(titleInput, { target: { value: '' } });

    // Note should NOT be deleted, and editor remains open
    expect(handleUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 'n1', title: '' }),
        mockNotes[1],
      ])
    );
    expect(screen.getByLabelText('Note Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Note Content')).toBeInTheDocument();
  });

  it('does not save new note if user inputs nothing and returns to list', () => {
    const handleUpdate = vi.fn();
    render(<NotesCard notes={mockNotes} onUpdateNotes={handleUpdate} />);

    // Switch to list view
    fireEvent.click(screen.getByRole('button', { name: /All Notes/i }));

    const newBtn = screen.getByRole('button', { name: /New Note/i });
    fireEvent.click(newBtn);

    // Editor is open with blank title
    expect(screen.getByLabelText('Note Title')).toHaveValue('');
    expect(handleUpdate).not.toHaveBeenCalled();

    // User navigates back without typing anything
    fireEvent.click(screen.getByRole('button', { name: /All Notes/i }));

    // Still in list view, onUpdateNotes was never called with empty note
    expect(handleUpdate).not.toHaveBeenCalled();
    expect(screen.queryByRole('heading', { name: 'New Note' })).not.toBeInTheDocument();
  });

  it('saves new note as soon as user types title or content', () => {
    const handleUpdate = vi.fn();
    render(<NotesCard notes={mockNotes} onUpdateNotes={handleUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /All Notes/i }));
    fireEvent.click(screen.getByRole('button', { name: /New Note/i }));

    fireEvent.change(screen.getByLabelText('Note Title'), {
      target: { value: 'Secret Door' },
    });

    expect(handleUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([
        ...mockNotes,
        expect.objectContaining({ title: 'Secret Door' }),
      ])
    );
  });

  it('deletes note with two-click confirmation', () => {
    const handleUpdate = vi.fn();
    render(<NotesCard notes={mockNotes} onUpdateNotes={handleUpdate} />);

    const deleteBtn = screen.getByRole('button', { name: 'Delete note Quests' });
    fireEvent.click(deleteBtn);
    expect(handleUpdate).not.toHaveBeenCalled();

    const armedBtn = screen.getByRole('button', { name: 'Click again to delete Quests' });
    fireEvent.click(armedBtn);

    expect(handleUpdate).toHaveBeenCalledWith([mockNotes[1]]);
  });

  it('navigates between list view and note editor view', () => {
    render(<NotesCard notes={mockNotes} onUpdateNotes={() => {}} />);

    // Switch to All Notes list view
    const allNotesBtn = screen.getByRole('button', { name: /All Notes/i });
    fireEvent.click(allNotesBtn);

    // List view shows note titles and preview snippets
    expect(screen.getByText('Quests')).toBeInTheDocument();
    expect(screen.getByText('Find the crystal')).toBeInTheDocument();
    expect(screen.getByText('NPCs')).toBeInTheDocument();
    expect(screen.getByText('Elminster at Shadowdale')).toBeInTheDocument();

    // Clicking a note card in list view opens it in note editor
    fireEvent.click(screen.getByText('NPCs'));
    expect(screen.getByLabelText('Note Title')).toHaveValue('NPCs');
    expect(screen.getByLabelText('Note Content')).toHaveValue('Elminster at Shadowdale');
  });

  it('filters notes in list view via search bar', () => {
    render(<NotesCard notes={mockNotes} onUpdateNotes={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /All Notes/i }));

    const searchInput = screen.getByLabelText('Search notes');
    fireEvent.change(searchInput, { target: { value: 'Elminster' } });

    expect(screen.getByText('NPCs')).toBeInTheDocument();
    expect(screen.queryByText('Find the crystal')).not.toBeInTheDocument();
  });

  it('allows pinning note to the top of the list view', () => {
    const handleUpdate = vi.fn();
    render(<NotesCard notes={mockNotes} onUpdateNotes={handleUpdate} />);

    // Switch to list view
    fireEvent.click(screen.getByRole('button', { name: /All Notes/i }));

    // Click pin button on second note (NPCs)
    const pinBtn = screen.getByRole('button', { name: 'Pin note NPCs' });
    expect(pinBtn).toBeInTheDocument();
    fireEvent.click(pinBtn);

    expect(handleUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([
        mockNotes[0],
        expect.objectContaining({ id: 'n2', pinned: true }),
      ])
    );
  });

  it('renders pinned notes at the top of the list view', () => {
    const notesWithPin = [
      { id: 'n1', title: 'Unpinned Note A', content: 'AAA', pinned: false },
      { id: 'n2', title: 'Pinned Note B', content: 'BBB', pinned: true },
      { id: 'n3', title: 'Unpinned Note C', content: 'CCC', pinned: false },
    ];

    render(<NotesCard notes={notesWithPin} onUpdateNotes={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /All Notes/i }));

    const titles = screen.getAllByRole('heading', { level: 4 }).map((el) => el.textContent);
    expect(titles[0]).toBe('Pinned Note B');
    expect(titles[1]).toBe('Unpinned Note A');
    expect(titles[2]).toBe('Unpinned Note C');
  });
});
