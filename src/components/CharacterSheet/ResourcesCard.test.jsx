import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ResourcesCard from './ResourcesCard';

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
    expect(screen.getByText('2 / 3')).toBeInTheDocument();

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

  it('hides add and remove controls when isEditing is false', () => {
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
    // Add buttons should not be present
    expect(screen.queryByRole('button', { name: /\+ Add Tracked Resource/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^\+ Add$/i })).not.toBeInTheDocument();
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

  it('renders Feats subdivision and allows adding and removing feats when isEditing is true', () => {
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

    const submitBtn = screen.getByRole('button', { name: /^Add$/i });
    fireEvent.click(submitBtn);

    expect(handleUpdateFeats).toHaveBeenCalledWith(['War Caster', 'Alert', 'Fey Touched']);

    // Remove feat
    const removeBtn = screen.getByLabelText('Remove feat Alert');
    fireEvent.click(removeBtn);
    expect(handleUpdateFeats).toHaveBeenCalledWith(['War Caster']);
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
});
