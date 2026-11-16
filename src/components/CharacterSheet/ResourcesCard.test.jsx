import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ResourcesCard from './ResourcesCard';
import { resetFeatsCatalogueCache } from '../../utils/featsCatalogue';

describe('ResourcesCard', () => {
  const mockResources = [
    { id: 'res_1', name: 'Lucky', current: 2, max: 3, resetOn: 'LR', note: 'Eldritch Adept' },
  ];

  it('renders tracked resources and increments counter on click', () => {
    const handleUpdate = vi.fn();
    render(
      <ResourcesCard
        trackedResources={mockResources}
        featuresNotes="Sample feature notes"
        onUpdateResources={handleUpdate}
        onUpdateNotes={() => {}}
      />
    );
    expect(screen.getByText('Lucky')).toBeInTheDocument();
    expect(screen.getByText((_, el) => el?.textContent?.replace(/\s+/g, ' ').trim() === '2 / 3')).toBeInTheDocument();

    const incBtn = screen.getByLabelText('Increment Lucky');
    fireEvent.click(incBtn);
    expect(handleUpdate).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'res_1', current: 3 }),
    ]);
  });

  it('decrements counter on click and clamps to 0', () => {
    const handleUpdate = vi.fn();
    render(
      <ResourcesCard
        trackedResources={[{ id: 'res_1', name: 'Lucky', current: 0, max: 3, resetOn: 'LR' }]}
        featuresNotes=""
        onUpdateResources={handleUpdate}
        onUpdateNotes={() => {}}
      />
    );
    const decBtn = screen.getByLabelText('Decrement Lucky');
    fireEvent.click(decBtn);
    expect(handleUpdate).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'res_1', current: 0 }),
    ]);
  });

  it('updates freeform feature notes on change', () => {
    const handleNotes = vi.fn();
    render(
      <ResourcesCard
        trackedResources={mockResources}
        featuresNotes="Existing notes"
        onUpdateResources={() => {}}
        onUpdateNotes={handleNotes}
      />
    );
    const textarea = screen.getByLabelText(/Features/i);
    fireEvent.change(textarea, { target: { value: 'New features note' } });
    expect(handleNotes).toHaveBeenCalledWith('New features note');
  });

  it('hides delete controls when isEditing is false, but shows add controls', () => {
    render(
      <ResourcesCard
        trackedResources={mockResources}
        featuresNotes=""
        feats={['War Caster']}
        isEditing={false}
        onUpdateResources={() => {}}
        onUpdateNotes={() => {}}
        onUpdateFeats={() => {}}
      />
    );

    // Delete buttons should not be present
    expect(screen.queryByLabelText('Delete Lucky')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Remove feat War Caster')).not.toBeInTheDocument();
    // Add buttons should be drawn outside editing state
    expect(screen.getByRole('button', { name: /\+ Add Tracked Resource/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^\+ Add$/i })).toBeInTheDocument();
  });

  it('allows adding a new resource via inline form when isEditing is true', () => {
    const handleUpdate = vi.fn();
    render(
      <ResourcesCard
        trackedResources={mockResources}
        featuresNotes=""
        isEditing={true}
        onUpdateResources={handleUpdate}
        onUpdateNotes={() => {}}
      />
    );
    const openAddBtn = screen.getByRole('button', { name: /\+ Add Tracked Resource/i });
    fireEvent.click(openAddBtn);

    const nameInput = screen.getByLabelText('Resource Name');
    const maxInput = screen.getByLabelText('Max Uses');
    fireEvent.change(nameInput, { target: { value: 'Chronal Shift' } });
    fireEvent.change(maxInput, { target: { value: '2' } });

    const saveBtn = screen.getByRole('button', { name: /save resource/i });
    fireEvent.click(saveBtn);

    expect(handleUpdate).toHaveBeenCalledWith([
      ...mockResources,
      expect.objectContaining({ name: 'Chronal Shift', max: 2, current: 2 }),
    ]);
  });

  it('allows dragging to reorder tracked resources when isEditing is true', () => {
    const handleUpdate = vi.fn();
    const twoResources = [
      { id: 'res_1', name: 'Lucky', current: 2, max: 3, resetOn: 'LR', note: 'Eldritch Adept' },
      { id: 'res_2', name: 'Arcane Recovery', current: 1, max: 1, resetOn: 'SR', note: '' },
    ];
    render(
      <ResourcesCard
        trackedResources={twoResources}
        featuresNotes=""
        isEditing={true}
        onUpdateResources={handleUpdate}
        onUpdateNotes={() => {}}
      />
    );

    // Grip icons rendered in edit mode
    const grips = screen.getAllByTestId('resource-drag-handle');
    expect(grips).toHaveLength(2);

    const cards = screen.getAllByTestId('tracked-resource-item');
    expect(cards[0]).toHaveAttribute('draggable', 'true');

    // Simulate drag start on first item ("Lucky")
    fireEvent.dragStart(cards[0], {
      dataTransfer: { setData: vi.fn(), effectAllowed: 'move' },
    });

    // Simulate drag over and drop onto second item ("Arcane Recovery")
    fireEvent.dragOver(cards[1], {
      dataTransfer: { dropEffect: 'move' },
    });
    fireEvent.drop(cards[1]);

    // Order should be swapped: Arcane Recovery first, then Lucky
    expect(handleUpdate).toHaveBeenCalledWith([
      twoResources[1],
      twoResources[0],
    ]);
  });

  it('does not allow dragging or render grip handles when isEditing is false', () => {
    render(
      <ResourcesCard
        trackedResources={mockResources}
        featuresNotes=""
        isEditing={false}
        onUpdateResources={() => {}}
        onUpdateNotes={() => {}}
      />
    );

    expect(screen.queryByTestId('resource-drag-handle')).not.toBeInTheDocument();
    const cards = screen.getAllByTestId('tracked-resource-item');
    expect(cards[0]).toHaveAttribute('draggable', 'false');
  });

  it('renders Feats subdivision, normalizes legacy string feats, and allows adding and two-click deleting feats', () => {
    const handleUpdateFeats = vi.fn();
    render(
      <ResourcesCard
        trackedResources={mockResources}
        featuresNotes=""
        feats={['War Caster', 'Alert']}
        isEditing={true}
        onUpdateResources={() => {}}
        onUpdateNotes={() => {}}
        onUpdateFeats={handleUpdateFeats}
      />
    );

    // Displays existing feats
    expect(screen.getByText('Feats:')).toBeInTheDocument();
    expect(screen.getByText('War Caster')).toBeInTheDocument();
    expect(screen.getByText('Alert')).toBeInTheDocument();

    // Click + Add to toggle form
    const addBtn = screen.getByRole('button', { name: /^\+ Add$/i });
    fireEvent.click(addBtn);

    const input = screen.getByPlaceholderText(/War Caster, Alert/i);
    fireEvent.change(input, { target: { value: 'Fey Touched' } });
    fireEvent.change(screen.getByLabelText('Feat Description'), {
      target: { value: 'Learn Misty Step.' },
    });

    const submitBtn = screen.getByRole('button', { name: /^Save Feat$/i });
    fireEvent.click(submitBtn);

    expect(handleUpdateFeats).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'War Caster' }),
      expect.objectContaining({ name: 'Alert' }),
      expect.objectContaining({ name: 'Fey Touched', note: 'Learn Misty Step.' }),
    ]);

    // Two-click delete feat from chip
    const removeBtn = screen.getByLabelText('Delete Alert');
    fireEvent.click(removeBtn);
    expect(removeBtn).toHaveAttribute('aria-label', 'Click again to delete Alert');
    fireEvent.click(removeBtn);
    expect(handleUpdateFeats).toHaveBeenLastCalledWith([
      expect.objectContaining({ name: 'War Caster' }),
    ]);
  });

  it('opens feat viewer pane above Feats when clicking a feat chip and closes resource viewer if open', () => {
    const handleUpdateFeats = vi.fn();
    const handleUpdateResources = vi.fn();
    const sampleFeats = [
      { id: 'feat_wc', name: 'War Caster', note: 'Advantage on Concentration saves.', color: 'sky' },
    ];
    render(
      <ResourcesCard
        trackedResources={mockResources}
        featuresNotes=""
        feats={sampleFeats}
        onUpdateResources={handleUpdateResources}
        onUpdateFeats={handleUpdateFeats}
      />
    );

    // Open Tracked Resource viewer first
    fireEvent.click(screen.getByText('Lucky').closest('[data-testid="tracked-resource-item"]'));
    expect(screen.getByTestId('resource-viewer-card')).toBeInTheDocument();

    // Click War Caster feat chip -> opens feat viewer and closes resource viewer
    fireEvent.click(screen.getByTestId('feat-chip-feat_wc'));
    expect(screen.getByTestId('feat-viewer-card')).toBeInTheDocument();
    expect(screen.getByText('Advantage on Concentration saves.')).toBeInTheDocument();

    // Delete feat from inside feat viewer via two-click confirm
    const viewer = screen.getByTestId('feat-viewer-card');
    const delBtn = viewer.querySelector('button[aria-label="Delete War Caster"]');
    fireEvent.click(delBtn);
    expect(delBtn).toHaveAttribute('aria-label', 'Click again to delete War Caster');
    fireEvent.click(delBtn);
    expect(handleUpdateFeats).toHaveBeenCalledWith([]);
  });

  it('renders delete icon button next to X in FeatForm editing mode with two-click confirm and cancels via X', () => {
    const handleUpdateFeats = vi.fn();
    render(
      <ResourcesCard
        trackedResources={[]}
        featuresNotes=""
        feats={[{ id: 'feat_wc', name: 'War Caster', note: 'Advantage on saves.' }]}
        onUpdateFeats={handleUpdateFeats}
      />
    );

    // Open viewer
    fireEvent.click(screen.getByTestId('feat-chip-feat_wc'));
    // Click edit button
    fireEvent.click(screen.getByLabelText('Edit War Caster'));

    const editForm = screen.getByTestId('feat-edit-form');
    expect(editForm).toBeInTheDocument();

    // Verify Cancel button in footer is removed
    expect(screen.queryByText('Cancel')).toBeNull();

    // Delete icon button is present in the header next to X
    const delBtn = editForm.querySelector('button[aria-label="Delete War Caster"]');
    expect(delBtn).toBeInTheDocument();

    // Close button (X) is present and cancels edit mode
    const closeBtn = editForm.querySelector('button[aria-label="Close"]');
    expect(closeBtn).toBeInTheDocument();

    // First click arms delete button
    fireEvent.click(delBtn);
    expect(delBtn).toHaveAttribute('aria-label', 'Click again to delete War Caster');
    expect(handleUpdateFeats).not.toHaveBeenCalled();

    // Second click triggers delete
    fireEvent.click(delBtn);
    expect(handleUpdateFeats).toHaveBeenCalledWith([]);
  });

  it('autofills feat from catalogue suggestion and creates linked tracked resource when Track Resource is checked', async () => {
    resetFeatsCatalogueCache();
    const handleUpdateFeats = vi.fn();
    const handleUpdateResources = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          name: 'Fey Touched',
          source: 'TCE',
          typeLine: 'Feat • +1 INT/WIS/CHA',
          trackedResource: { max: 1, resetOn: 'LR' },
          description: 'Feat • +1 INT/WIS/CHA\n\nLearn Misty Step and one 1st-level spell.',
        },
      ],
    });

    render(
      <ResourcesCard
        trackedResources={[]}
        featuresNotes=""
        feats={[]}
        onUpdateResources={handleUpdateResources}
        onUpdateFeats={handleUpdateFeats}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^\+ Add$/i }));

    // Wait for catalogue load
    const nameInput = screen.getByLabelText('Feat Name');
    fireEvent.focus(nameInput);
    fireEvent.change(nameInput, { target: { value: 'Fey' } });

    const option = await screen.findByText('Fey Touched');
    expect(option).toBeInTheDocument();

    fireEvent.mouseDown(option);

    expect(nameInput).toHaveValue('Fey Touched');
    expect(screen.getByLabelText('Feat Description')).toHaveValue(
      'Feat • +1 INT/WIS/CHA\n\nLearn Misty Step and one 1st-level spell.'
    );
    expect(screen.getByLabelText('Track Resource')).toBeChecked();
    expect(screen.getByLabelText('Tracked Resource Max')).toHaveValue(1);

    const saveBtn = screen.getByRole('button', { name: /^Save Feat$/i });
    fireEvent.click(saveBtn);

    expect(handleUpdateFeats).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'Fey Touched',
        note: 'Feat • +1 INT/WIS/CHA\n\nLearn Misty Step and one 1st-level spell.',
        statModifiers: { int: 1 },
      }),
    ]);
    expect(handleUpdateResources).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'Fey Touched',
        max: 1,
        current: 1,
        resetOn: 'LR',
      }),
    ]);
  });

  it('defaults feat stat boost to the first allowed ability on autofill, renders +1 STAT badge on feat chip and viewer, and lets user change or disable it', async () => {
    resetFeatsCatalogueCache();
    const handleUpdateFeats = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          name: 'Fey Touched',
          source: 'XPHB',
          typeLine: 'General Feat (Prerequisite: Level 4+) • +1 INT/WIS/CHA',
          description: 'General Feat (Prerequisite: Level 4+) • +1 INT/WIS/CHA\n\nLearn Misty Step.',
        },
      ],
    });

    const { rerender } = render(
      <ResourcesCard
        trackedResources={[]}
        featuresNotes=""
        feats={[]}
        onUpdateFeats={handleUpdateFeats}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^\+ Add$/i }));
    const nameInput = screen.getByLabelText('Feat Name');
    fireEvent.focus(nameInput);
    fireEvent.change(nameInput, { target: { value: 'Fey' } });

    const option = await screen.findByText('Fey Touched');
    fireEvent.mouseDown(option);

    // Defaults to first allowed ability (+1 INT)
    const statSelect = screen.getByLabelText('ASI');
    expect(statSelect).toHaveValue('int:1');

    // Switch to +1 WIS
    fireEvent.change(statSelect, { target: { value: 'wis:1' } });
    fireEvent.click(screen.getByRole('button', { name: /^Save Feat$/i }));

    expect(handleUpdateFeats).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'Fey Touched',
        statModifiers: { wis: 1 },
      }),
    ]);

    // Render saved feat with statModifiers and verify +1 WIS chip badge appears on card and viewer
    const savedFeat = handleUpdateFeats.mock.calls[0][0][0];
    rerender(
      <ResourcesCard
        trackedResources={[]}
        featuresNotes=""
        feats={[savedFeat]}
        onUpdateFeats={handleUpdateFeats}
      />
    );

    const featChip = screen.getByTestId(`feat-chip-${savedFeat.id}`);
    expect(featChip).toHaveTextContent('+1 WIS');
    expect(screen.getByTestId('feat-stat-badge')).toHaveTextContent('+1 WIS');

    // Open viewer and check badge there too
    fireEvent.click(featChip);
    const viewerCard = screen.getByTestId('feat-viewer-card');
    expect(viewerCard).toHaveTextContent('+1 WIS');
  });

  it('does not autofill, submit form, or exit editing state when pressing Enter in Feat Name', async () => {
    resetFeatsCatalogueCache();
    const handleUpdateFeats = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          name: 'Lucky',
          source: 'XPHB',
          typeLine: 'General Feat',
          description: 'You have luck points.',
        },
      ],
    });

    render(
      <ResourcesCard
        trackedResources={[]}
        featuresNotes=""
        feats={[]}
        onUpdateFeats={handleUpdateFeats}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^\+ Add$/i }));
    const form = screen.getByTestId('feat-add-form');
    expect(form).toBeInTheDocument();

    const nameInput = screen.getByLabelText('Feat Name');
    fireEvent.focus(nameInput);
    fireEvent.change(nameInput, { target: { value: 'Lucky' } });

    // Press Enter in input
    fireEvent.keyDown(nameInput, { key: 'Enter' });

    // Form remains open, no submission, no autofill of description
    expect(handleUpdateFeats).not.toHaveBeenCalled();
    expect(screen.getByTestId('feat-add-form')).toBeInTheDocument();
    expect(nameInput.value).toBe('Lucky');
    expect(screen.getByLabelText('Feat Description').value).toBe('');
  });

  it('also deletes linked tracked resource when deleting a linked feat, displays subtle linked icons on both cards, and requires two clicks on tracked resource delete button in editing mode', () => {
    const handleUpdateFeats = vi.fn();
    const handleUpdateResources = vi.fn();
    render(
      <ResourcesCard
        trackedResources={[
          { id: 'res_lucky', linkedFeatId: 'feat_lucky', name: 'Lucky', current: 3, max: 3, resetOn: 'LR' },
          { id: 'res_arcane', name: 'Arcane Recovery', current: 1, max: 1, resetOn: 'SR' },
        ]}
        featuresNotes=""
        feats={[
          { id: 'feat_lucky', name: 'Lucky', note: 'You have 3 luck points.' },
          { id: 'feat_alert', name: 'Alert', note: '+5 initiative.' },
        ]}
        isEditing={true}
        onUpdateResources={handleUpdateResources}
        onUpdateFeats={handleUpdateFeats}
      />
    );

    // Subtle linked icon appears on both the linked Tracked Resource card and the linked Feat chip (1 each)
    expect(screen.getAllByTestId('resource-linked-icon')).toHaveLength(1);
    expect(screen.getAllByTestId('feat-linked-icon')).toHaveLength(1);

    // Tracked Resource delete button in editing mode uses Trash2 and two-click confirm
    const resDelBtn = screen.getByLabelText('Delete Arcane Recovery');
    fireEvent.click(resDelBtn);
    expect(handleUpdateResources).not.toHaveBeenCalled();
    expect(resDelBtn).toHaveAttribute('aria-label', 'Click again to delete Arcane Recovery');
    fireEvent.click(resDelBtn);
    expect(handleUpdateResources).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'res_lucky' }),
    ]);

    // Deleting the linked feat deletes both the feat and the linked tracked resource
    const featChip = screen.getByTestId('feat-chip-feat_lucky');
    const delBtn = featChip.querySelector('button[aria-label="Delete Lucky"]');
    fireEvent.click(delBtn);
    fireEvent.click(delBtn);

    expect(handleUpdateFeats).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'feat_alert' }),
    ]);
    expect(handleUpdateResources).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: 'res_arcane' }),
    ]);
  });

  it('renders freeform notes with 2 rows initially and auto-adjusts height style when content changes', () => {
    const { rerender } = render(<ResourcesCard featuresNotes="" />);
    const textarea = screen.getByLabelText(/Features/i);
    expect(textarea).toHaveAttribute('rows', '2');
    expect(textarea.className).toContain('min-h-[59px]');
    expect(textarea.className).toContain('max-h-[215px]');
    expect(textarea.style.height).toBe('auto');

    Object.defineProperty(textarea, 'scrollHeight', { value: 150, configurable: true });
    rerender(<ResourcesCard featuresNotes={'Line 1\nLine 2\nLine 3\nLine 4\nLine 5'} />);
    expect(textarea.style.height).toBe('150px');
  });

  it('renders resource counter stepper with Level 3 bg-dnd-panel/70', () => {
    render(
      <ResourcesCard
        trackedResources={mockResources}
        featuresNotes=""
        onUpdateResources={() => {}}
      />
    );
    const counterPill = screen.getByText((_, el) => el?.textContent?.replace(/\s+/g, ' ').trim() === '2 / 3').closest('div');
    expect(counterPill.className).toContain('bg-dnd-panel/70');
  });

  it('opens resource detail viewer on clicking a resource chip and shows description', () => {
    render(
      <ResourcesCard
        trackedResources={mockResources}
        featuresNotes=""
        onUpdateResources={() => {}}
      />
    );

    // Initial state: viewer not open
    expect(screen.queryByTestId('resource-viewer-card')).not.toBeInTheDocument();

    // Click resource chip
    const chip = screen.getByText('Lucky').closest('[data-testid="tracked-resource-item"]');
    fireEvent.click(chip);

    // Detail viewer should open
    expect(screen.getByTestId('resource-viewer-card')).toBeInTheDocument();
    expect(screen.getByTestId('resource-viewer-wrapper')).toHaveClass('animate-accordion-down');
    expect(screen.getByText('Eldritch Adept')).toBeInTheDocument();
    expect(screen.getByText(/Recovers @ Long Rest/i)).toBeInTheDocument();

    // Close button works
    const closeBtn = screen.getByLabelText('Close Lucky details');
    fireEvent.click(closeBtn);
    expect(screen.queryByTestId('resource-viewer-card')).not.toBeInTheDocument();
  });

  it('toggles detail viewer closed when clicking the same resource chip again', () => {
    render(
      <ResourcesCard
        trackedResources={mockResources}
        featuresNotes=""
        onUpdateResources={() => {}}
      />
    );

    const chip = screen.getByText('Lucky').closest('[data-testid="tracked-resource-item"]');
    fireEvent.click(chip);
    const viewerCard = screen.getByTestId('resource-viewer-card');
    expect(viewerCard).toBeInTheDocument();
    // Airplane helix icon renders inside viewer header
    const icon = viewerCard.querySelector('svg');
    expect(icon).toBeInTheDocument();

    fireEvent.click(chip);
    expect(screen.queryByTestId('resource-viewer-card')).not.toBeInTheDocument();
  });

  it('allows editing a resource inside detail viewer and saves changes', () => {
    const handleUpdate = vi.fn();
    render(
      <ResourcesCard
        trackedResources={mockResources}
        featuresNotes=""
        onUpdateResources={handleUpdate}
      />
    );

    const chip = screen.getByText('Lucky').closest('[data-testid="tracked-resource-item"]');
    fireEvent.click(chip);

    const editBtn = screen.getByLabelText('Edit Lucky');
    fireEvent.click(editBtn);

    const nameInput = screen.getByLabelText('Edit Resource Name');
    const descInput = screen.getByLabelText('Edit Resource Description');
    fireEvent.change(nameInput, { target: { value: 'Lucky (Feat)' } });
    fireEvent.change(descInput, { target: { value: 'Roll an extra d20 when attacking or saving.' } });

    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveBtn);

    expect(handleUpdate).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'res_1',
        name: 'Lucky (Feat)',
        note: 'Roll an extra d20 when attacking or saving.',
      }),
    ]);
  });

  it('deletes a resource directly from the detail viewer using two-click confirmation', () => {
    const handleUpdate = vi.fn();
    render(
      <ResourcesCard
        trackedResources={mockResources}
        featuresNotes=""
        onUpdateResources={handleUpdate}
      />
    );

    const chip = screen.getByText('Lucky').closest('[data-testid="tracked-resource-item"]');
    fireEvent.click(chip);

    const deleteBtn = screen.getByRole('button', { name: 'Delete Lucky' });
    expect(deleteBtn).toHaveAttribute('aria-label', 'Delete Lucky');

    // First click arms the button
    fireEvent.click(deleteBtn);
    expect(deleteBtn).toHaveAttribute('aria-label', 'Click again to delete Lucky');
    expect(handleUpdate).not.toHaveBeenCalled();

    // Second click deletes the resource
    fireEvent.click(deleteBtn);
    expect(handleUpdate).toHaveBeenCalledWith([]);
  });

  it('deletes a resource from inside the edit form using two-click confirmation', () => {
    const handleUpdate = vi.fn();
    render(
      <ResourcesCard
        trackedResources={mockResources}
        featuresNotes=""
        onUpdateResources={handleUpdate}
      />
    );

    const chip = screen.getByText('Lucky').closest('[data-testid="tracked-resource-item"]');
    fireEvent.click(chip);

    const editBtn = screen.getByLabelText('Edit Lucky');
    fireEvent.click(editBtn);

    const deleteBtn = screen.getByRole('button', { name: 'Delete Lucky' });
    expect(deleteBtn).toHaveAttribute('aria-label', 'Delete Lucky');

    // First click arms the button
    fireEvent.click(deleteBtn);
    expect(deleteBtn).toHaveAttribute('aria-label', 'Click again to delete Lucky');
    expect(handleUpdate).not.toHaveBeenCalled();

    // Second click deletes the resource
    fireEvent.click(deleteBtn);
    expect(handleUpdate).toHaveBeenCalledWith([]);
  });

  it('includes description/notes textarea in Add Resource form', () => {
    const handleUpdate = vi.fn();
    render(
      <ResourcesCard
        trackedResources={mockResources}
        featuresNotes=""
        isEditing={true}
        onUpdateResources={handleUpdate}
      />
    );

    const openAddBtn = screen.getByRole('button', { name: /\+ Add Tracked Resource/i });
    fireEvent.click(openAddBtn);

    const nameInput = screen.getByLabelText('Resource Name');
    const noteInput = screen.getByLabelText('Resource Description');
    fireEvent.change(nameInput, { target: { value: 'Bardic Inspiration' } });
    fireEvent.change(noteInput, { target: { value: 'Add 1d6 to a roll within 10 minutes.' } });

    const saveBtn = screen.getByRole('button', { name: /save resource/i });
    fireEvent.click(saveBtn);

    expect(handleUpdate).toHaveBeenCalledWith([
      ...mockResources,
      expect.objectContaining({
        name: 'Bardic Inspiration',
        note: 'Add 1d6 to a roll within 10 minutes.',
      }),
    ]);
  });

  it('dynamically expands description textarea in edit form matching line buckets', () => {
    render(
      <ResourcesCard
        trackedResources={mockResources}
        featuresNotes=""
        onUpdateResources={() => {}}
      />
    );

    const chip = screen.getByText('Lucky').closest('[data-testid="tracked-resource-item"]');
    fireEvent.click(chip);

    const editBtn = screen.getByLabelText('Edit Lucky');
    fireEvent.click(editBtn);

    const descInput = screen.getByLabelText('Edit Resource Description');
    // Lucky has 'Eldritch Adept' (1 line -> bucket 4)
    expect(descInput).toHaveAttribute('rows', '4');
    expect(descInput.style.minHeight).toBe('90px');
    expect(descInput.className).toContain('leading-relaxed');

    // Type 6 lines -> bucket 8 (8 * 19.5 + 12 = 168px)
    fireEvent.change(descInput, { target: { value: '1\n2\n3\n4\n5\n6' } });
    expect(descInput).toHaveAttribute('rows', '8');
    expect(descInput.style.minHeight).toBe('168px');

    // Type 10 lines -> bucket 12 (12 * 19.5 + 12 = 246px)
    fireEvent.change(descInput, { target: { value: '1\n2\n3\n4\n5\n6\n7\n8\n9\n10' } });
    expect(descInput).toHaveAttribute('rows', '12');
    expect(descInput.style.minHeight).toBe('246px');
  });

  it('dynamically expands description textarea in add form matching line buckets', () => {
    render(
      <ResourcesCard
        trackedResources={mockResources}
        featuresNotes=""
        isEditing={true}
        onUpdateResources={() => {}}
      />
    );

    const openAddBtn = screen.getByRole('button', { name: /\+ Add Tracked Resource/i });
    fireEvent.click(openAddBtn);

    const noteInput = screen.getByLabelText('Resource Description');
    expect(noteInput).toHaveAttribute('rows', '4');
    expect(noteInput.style.minHeight).toBe('90px');

    // Type 6 lines -> bucket 8
    fireEvent.change(noteInput, { target: { value: '1\n2\n3\n4\n5\n6' } });
    expect(noteInput).toHaveAttribute('rows', '8');
    expect(noteInput.style.minHeight).toBe('168px');
  });

  it('allows picking a color tag when adding a tracked resource', () => {
    const handleUpdate = vi.fn();
    render(
      <ResourcesCard
        trackedResources={mockResources}
        featuresNotes=""
        isEditing={true}
        onUpdateResources={handleUpdate}
      />
    );

    const openAddBtn = screen.getByRole('button', { name: /\+ Add Tracked Resource/i });
    fireEvent.click(openAddBtn);

    // Open color dropdown and pick amber
    const colorDropdownBtn = screen.getByRole('button', { name: /select color tag/i });
    fireEvent.click(colorDropdownBtn);

    const amberSwatch = screen.getByRole('button', { name: 'Select amber' });
    fireEvent.click(amberSwatch);

    const nameInput = screen.getByLabelText('Resource Name');
    fireEvent.change(nameInput, { target: { value: 'Amber Amulet' } });

    const saveBtn = screen.getByRole('button', { name: /save resource/i });
    fireEvent.click(saveBtn);

    expect(handleUpdate).toHaveBeenCalledWith([
      ...mockResources,
      expect.objectContaining({
        name: 'Amber Amulet',
        color: 'amber',
      }),
    ]);
  });

  it('allows editing a resource color tag and displays color in viewer and chip gradient', () => {
    const handleUpdate = vi.fn();
    const coloredResource = [
      { id: 'res_col', name: 'Sorcery Points', current: 5, max: 5, resetOn: 'LR', color: 'purple', note: 'Metamagic fuel' },
    ];
    render(
      <ResourcesCard
        trackedResources={coloredResource}
        featuresNotes=""
        onUpdateResources={handleUpdate}
      />
    );

    // Chip has right gradient with purple glow
    const chip = screen.getByTestId('tracked-resource-item');
    const gradient = chip.querySelector('[data-testid="resource-right-gradient"]');
    expect(gradient.style.background).toContain('rgba(168, 85, 247');

    // Click chip to view details
    fireEvent.click(chip);
    const viewerCard = screen.getByTestId('resource-viewer-card');
    expect(viewerCard.className).toContain('bg-purple-950/40');
    expect(viewerCard.className).toContain('text-purple-300');

    // Click edit and change color to emerald
    const editBtn = screen.getByLabelText('Edit Sorcery Points');
    fireEvent.click(editBtn);

    const colorDropdownBtn = screen.getByRole('button', { name: /select color tag/i });
    fireEvent.click(colorDropdownBtn);

    const emeraldSwatch = screen.getByRole('button', { name: 'Select emerald' });
    fireEvent.click(emeraldSwatch);

    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveBtn);

    expect(handleUpdate).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'res_col',
        color: 'emerald',
      }),
    ]);
  });

  it('supports no-color option and defaults chips without color to none gradient', () => {
    const handleUpdate = vi.fn();
    const noColorResource = [
      { id: 'res_none', name: 'Standard Ability', current: 1, max: 1, resetOn: 'LR', color: 'none' },
    ];
    render(
      <ResourcesCard
        trackedResources={noColorResource}
        featuresNotes=""
        onUpdateResources={handleUpdate}
      />
    );

    // Chip has background: none
    const chip = screen.getByTestId('tracked-resource-item');
    const gradient = chip.querySelector('[data-testid="resource-right-gradient"]');
    expect(gradient.style.background).toBe('none');

    // Click chip to view details
    fireEvent.click(chip);
    const viewerCard = screen.getByTestId('resource-viewer-card');
    expect(viewerCard.className).toContain('bg-dnd-card');
    expect(viewerCard.className).toContain('text-slate-200');
  });

  it('renders dropdown with right-0 alignment and displays all swatches including none and blue (sky)', () => {
    render(
      <ResourcesCard
        trackedResources={mockResources}
        featuresNotes=""
        isEditing={true}
      />
    );

    const openAddBtn = screen.getByRole('button', { name: /\+ Add Tracked Resource/i });
    fireEvent.click(openAddBtn);

    const colorDropdownBtn = screen.getByRole('button', { name: /select color tag/i });
    fireEvent.click(colorDropdownBtn);

    // Verify all swatches exist in dropdown
    expect(screen.getByRole('button', { name: 'Select none' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select slate' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select emerald' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select sky' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select purple' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select amber' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select rose' })).toBeInTheDocument();

    // Verify right-0 alignment class on dropdown menu
    const menu = screen.getByRole('button', { name: 'Select none' }).parentElement;
    expect(menu.className).toContain('right-0');
  });

  it('displays "Drag items to reorder" hint only when isEditing is true with resources', () => {
    const { rerender } = render(
      <ResourcesCard
        trackedResources={mockResources}
        featuresNotes=""
        isEditing={false}
      />
    );

    expect(screen.queryByText(/Drag items to reorder/i)).not.toBeInTheDocument();

    rerender(
      <ResourcesCard
        trackedResources={mockResources}
        featuresNotes=""
        isEditing={true}
      />
    );

    expect(screen.getByText(/Drag items to reorder/i)).toBeInTheDocument();

    rerender(
      <ResourcesCard
        trackedResources={[]}
        featuresNotes=""
        isEditing={true}
      />
    );

    expect(screen.queryByText(/Drag items to reorder/i)).not.toBeInTheDocument();
  });
});
