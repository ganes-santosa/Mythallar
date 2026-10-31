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
    const textarea = screen.getByLabelText('Features, Feats & Notes');
    fireEvent.change(textarea, { target: { value: 'New features note' } });
    expect(handleNotes).toHaveBeenCalledWith('New features note');
  });

  it('allows adding a new resource via inline form', () => {
    const handleUpdate = vi.fn();
    render(
      <ResourcesCard
        trackedResources={mockResources}
        featuresNotes=""
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
});
