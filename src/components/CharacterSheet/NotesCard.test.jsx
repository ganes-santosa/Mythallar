import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  it('renders notes list view on initial load and opens note editor when selecting a note', () => {
    render(<NotesCard notes={mockNotes} onUpdateNotes={() => {}} />);

    expect(screen.getByLabelText('Search notes')).toBeInTheDocument();
    expect(screen.getByText('Quests')).toBeInTheDocument();
    expect(screen.getByText('NPCs')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Quests'));

    const titleInput = screen.getByLabelText('Note Title');
    expect(titleInput).toBeInTheDocument();
    expect(titleInput).toHaveValue('Quests');

    const contentArea = screen.getByLabelText('Note Content');
    expect(contentArea).toBeInTheDocument();
    expect(contentArea.innerHTML).toBe('Find the crystal');
  });

  it('updates note content on edit and moves edited note to top', () => {
    const handleUpdate = vi.fn();
    render(<NotesCard notes={mockNotes} onUpdateNotes={handleUpdate} />);

    fireEvent.click(screen.getByText('NPCs'));
    const contentArea = screen.getByLabelText('Note Content');
    contentArea.innerHTML = 'Elminster at Waterdeep';
    fireEvent.input(contentArea);

    expect(handleUpdate).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'n2', content: 'Elminster at Waterdeep' }),
      mockNotes[0],
    ]);
  });

  it('allows selecting entire title and backspacing to empty without deleting note or exiting editor', () => {
    const handleUpdate = vi.fn();
    render(<NotesCard notes={mockNotes} onUpdateNotes={handleUpdate} />);

    fireEvent.click(screen.getByText('Quests'));
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

  it('saves new note at the top of the list as soon as user types title or content', () => {
    const handleUpdate = vi.fn();
    render(<NotesCard notes={mockNotes} onUpdateNotes={handleUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /New Note/i }));

    fireEvent.change(screen.getByLabelText('Note Title'), {
      target: { value: 'Secret Door' },
    });

    expect(handleUpdate).toHaveBeenCalledWith([
      expect.objectContaining({ title: 'Secret Door' }),
      ...mockNotes,
    ]);
  });

  it('deletes note with two-click confirmation', () => {
    const handleUpdate = vi.fn();
    render(<NotesCard notes={mockNotes} onUpdateNotes={handleUpdate} />);

    fireEvent.click(screen.getByText('Quests'));
    const deleteBtn = screen.getByRole('button', { name: 'Delete note Quests' });
    fireEvent.click(deleteBtn);
    expect(handleUpdate).not.toHaveBeenCalled();

    const armedBtn = screen.getByRole('button', { name: 'Click again to delete Quests' });
    fireEvent.click(armedBtn);

    expect(handleUpdate).toHaveBeenCalledWith([mockNotes[1]]);
  });

  it('navigates between list view and note editor view', () => {
    render(<NotesCard notes={mockNotes} onUpdateNotes={() => {}} />);

    // List view shows note titles and preview snippets on initial load
    expect(screen.getByText('Quests')).toBeInTheDocument();
    expect(screen.getByText('Find the crystal')).toBeInTheDocument();
    expect(screen.getByText('NPCs')).toBeInTheDocument();
    expect(screen.getByText('Elminster at Shadowdale')).toBeInTheDocument();

    // Clicking a note card in list view opens it in note editor
    fireEvent.click(screen.getByText('NPCs'));
    expect(screen.getByLabelText('Note Title')).toHaveValue('NPCs');
    expect(screen.getByLabelText('Note Content').innerHTML).toBe('Elminster at Shadowdale');

    // Switch back to All Notes list view
    const allNotesBtn = screen.getByRole('button', { name: /All Notes/i });
    fireEvent.click(allNotesBtn);
    expect(screen.getByLabelText('Search notes')).toBeInTheDocument();
  });

  it('filters notes in list view via search bar', () => {
    render(<NotesCard notes={mockNotes} onUpdateNotes={() => {}} />);

    const searchInput = screen.getByLabelText('Search notes');
    fireEvent.change(searchInput, { target: { value: 'Elminster' } });

    expect(screen.getByText('NPCs')).toBeInTheDocument();
    expect(screen.queryByText('Find the crystal')).not.toBeInTheDocument();
  });

  it('allows pinning note to the top of the list view', () => {
    const handleUpdate = vi.fn();
    render(<NotesCard notes={mockNotes} onUpdateNotes={handleUpdate} />);

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
      { id: 'n1', title: 'Unpinned Note A', content: 'AAA', updatedAt: '2026-11-04T12:00:00.000Z', pinned: false },
      { id: 'n2', title: 'Pinned Note B', content: 'BBB', updatedAt: '2026-11-04T10:00:00.000Z', pinned: true },
      { id: 'n3', title: 'Unpinned Note C', content: 'CCC', updatedAt: '2026-11-04T11:00:00.000Z', pinned: false },
    ];

    render(<NotesCard notes={notesWithPin} onUpdateNotes={() => {}} />);

    const titles = screen.getAllByRole('heading', { level: 4 }).map((el) => el.textContent);
    expect(titles[0]).toBe('Pinned Note B');
    expect(titles[1]).toBe('Unpinned Note A');
    expect(titles[2]).toBe('Unpinned Note C');
  });

  it('sorts notes by Recent, Date, and Alphabetical in ascending and descending order via left direction button and right Sort By dropdown', () => {
    const sortableNotes = [
      { id: 'n1', title: 'B-Quest', content: '1', createdAt: '2026-11-02T10:00:00.000Z', updatedAt: '2026-11-05T10:00:00.000Z', pinned: false },
      { id: 'n2', title: 'A-Lore', content: '2', createdAt: '2026-11-03T10:00:00.000Z', updatedAt: '2026-11-04T10:00:00.000Z', pinned: false },
      { id: 'n3', title: 'C-NPCs', content: '3', createdAt: '2026-11-01T10:00:00.000Z', updatedAt: '2026-11-06T10:00:00.000Z', pinned: false },
    ];

    render(<NotesCard notes={sortableNotes} onUpdateNotes={() => {}} />);

    const getTitles = () => screen.getAllByRole('heading', { level: 4 }).map((el) => el.textContent);

    // Default: Recent descending (updatedAt newest first: C-NPCs, B-Quest, A-Lore) and button reads "Sort By" all the time
    expect(screen.getByRole('button', { name: 'Sort By' })).toBeInTheDocument();
    expect(getTitles()).toEqual(['C-NPCs', 'B-Quest', 'A-Lore']);

    // Toggle left sort direction button to ascending (Recent oldest first: A-Lore, B-Quest, C-NPCs)
    fireEvent.click(screen.getByRole('button', { name: /Toggle sort direction/i }));
    expect(getTitles()).toEqual(['A-Lore', 'B-Quest', 'C-NPCs']);

    // Open right Sort By dropdown and select Date; button label stays "Sort By"
    fireEvent.click(screen.getByRole('button', { name: 'Sort By' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sort by Date' }));
    expect(screen.getByRole('button', { name: 'Sort By' })).toBeInTheDocument();
    expect(getTitles()).toEqual(['C-NPCs', 'B-Quest', 'A-Lore']);

    // Toggle left sort direction button back to descending (Date newest first: A-Lore (Nov 3), B-Quest (Nov 2), C-NPCs (Nov 1))
    fireEvent.click(screen.getByRole('button', { name: /Toggle sort direction/i }));
    expect(getTitles()).toEqual(['A-Lore', 'B-Quest', 'C-NPCs']);

    // Open right Sort By dropdown and select Alphabetical; button label stays "Sort By"
    fireEvent.click(screen.getByRole('button', { name: 'Sort By' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sort by Alphabetical' }));
    expect(screen.getByRole('button', { name: 'Sort By' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Toggle sort direction \(Descending\)/i })).toBeInTheDocument();
    expect(getTitles()).toEqual(['A-Lore', 'B-Quest', 'C-NPCs']);

    // Toggle left sort direction button to Z-A
    fireEvent.click(screen.getByRole('button', { name: /Toggle sort direction/i }));
    expect(screen.getByRole('button', { name: /Toggle sort direction \(Ascending\)/i })).toBeInTheDocument();
    expect(getTitles()).toEqual(['C-NPCs', 'B-Quest', 'A-Lore']);
  });

  it('restores both the parent character sheet scroll position and inner notes list scroll position when returning to list view from editor', async () => {
    const manyNotes = Array.from({ length: 10 }, (_, i) => ({
      id: `n_${i}`,
      title: `Note ${i}`,
      content: `Content ${i}`,
      updatedAt: `2026-11-0${(i % 9) + 1}T10:00:00.000Z`,
      pinned: false,
    }));

    const { container } = render(
      <div className="overflow-y-auto" data-testid="mock-sheet-scroller">
        <NotesCard notes={manyNotes} onUpdateNotes={() => {}} />
      </div>
    );

    const sheetScroller = screen.getByTestId('mock-sheet-scroller');
    const innerListScroller = container.querySelector('.max-h-\\[420px\\]');

    // Simulate scrolling down the left pane and the inner notes list before opening a note
    sheetScroller.scrollTop = 650;
    innerListScroller.scrollTop = 180;

    // Enter note editor
    fireEvent.click(screen.getByText('Note 2'));
    expect(screen.getByLabelText('Note Title')).toHaveValue('Note 2');

    // Simulate user scrolling while in editor
    sheetScroller.scrollTop = 920;

    // Exit editor back to All Notes list
    fireEvent.click(screen.getByRole('button', { name: /All Notes/i }));

    // Restore animates over ~300ms in sync with the list's grid expansion
    await waitFor(() => expect(sheetScroller.scrollTop).toBe(650));
    const restoredInnerScroller = container.querySelector('.max-h-\\[420px\\]');
    expect(restoredInnerScroller.scrollTop).toBe(180);
  });

  it('renders Bold, Italic, Underline, and Strikethrough formatting buttons', () => {
    const handleUpdate = vi.fn();
    render(<NotesCard notes={mockNotes} onUpdateNotes={handleUpdate} />);
    fireEvent.click(screen.getByText('Quests'));

    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Italic' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Underline' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Strikethrough' })).toBeInTheDocument();
  });

  it('sanitizes pasted rich HTML into bold, italic, underline, strikethrough tags without dangerous attributes', () => {
    const handleUpdate = vi.fn();
    render(<NotesCard notes={mockNotes} onUpdateNotes={handleUpdate} />);
    fireEvent.click(screen.getByText('Quests'));

    const editor = screen.getByLabelText('Note Content');
    fireEvent.paste(editor, {
      clipboardData: {
        getData: (type) =>
          type === 'text/html'
            ? '<b>Clean</b> <u>Line</u> <s>Strike</s><script>alert(1)</script>'
            : 'Clean Line Strike',
      },
    });

    expect(handleUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          content: expect.stringMatching(/<b>Clean<\/b>.*<u>Line<\/u>.*<s>Strike<\/s>/),
        }),
      ])
    );
  });
});
