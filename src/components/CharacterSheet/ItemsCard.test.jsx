import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ItemsCard from './ItemsCard';

describe('ItemsCard', () => {
  const mockItems = [
    {
      id: 'itm_1',
      name: 'The Tuvala Sundial',
      requiresAttunement: true,
      attuned: true,
      category: 'magic',
      quantity: 1,
    },
    {
      id: 'itm_2',
      name: 'Gauntlets of Ogre Power',
      requiresAttunement: true,
      attuned: false,
      category: 'magic',
      quantity: 1,
    },
    {
      id: 'itm_3',
      name: 'Potion of Greater Healing',
      requiresAttunement: false,
      attuned: false,
      category: 'consumable',
      quantity: 2,
    },
  ];

  it('renders items with attunement count and bookmark glow on attuned items', () => {
    render(<ItemsCard items={mockItems} maxAttunement={3} onUpdateItems={() => {}} />);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    expect(screen.getByText('The Tuvala Sundial')).toBeInTheDocument();

    const attunedChip = screen.getByTestId('item-chip-itm_1');
    const bookmark = attunedChip.querySelector('[data-testid="attunement-bookmark-strip"]');
    expect(bookmark.className).toContain('bg-[#EFE9E0]');
  });

  it('toggles attunement when in Manage Attunement mode', () => {
    const handleUpdate = vi.fn();
    render(<ItemsCard items={mockItems} maxAttunement={3} onUpdateItems={handleUpdate} />);
    const manageBtn = screen.getByRole('button', { name: /manage attunement/i });
    fireEvent.click(manageBtn);

    const unattunedChip = screen.getByTestId('item-chip-itm_2');
    fireEvent.click(unattunedChip);

    expect(handleUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 'itm_2', attuned: true }),
      ])
    );
  });

  it('does not toggle attunement on click when not in attunement mode', () => {
    const handleUpdate = vi.fn();
    render(<ItemsCard items={mockItems} maxAttunement={3} onUpdateItems={handleUpdate} />);
    const unattunedChip = screen.getByTestId('item-chip-itm_2');
    fireEvent.click(unattunedChip);
    expect(handleUpdate).not.toHaveBeenCalled();
  });

  it('allows adding a new item with category and attunement requirement', () => {
    const handleUpdate = vi.fn();
    render(<ItemsCard items={mockItems} maxAttunement={3} onUpdateItems={handleUpdate} />);
    const openAddBtn = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(openAddBtn);

    const nameInput = screen.getByLabelText('Item Name');
    fireEvent.change(nameInput, { target: { value: 'Cloak of Protection' } });

    const attuneCheck = screen.getByLabelText('Requires Attunement');
    fireEvent.click(attuneCheck);

    const saveBtn = screen.getByRole('button', { name: /save item/i });
    fireEvent.click(saveBtn);

    expect(handleUpdate).toHaveBeenCalledWith([
      ...mockItems,
      expect.objectContaining({
        name: 'Cloak of Protection',
        requiresAttunement: true,
        attuned: false,
      }),
    ]);
  });

  it('requires two clicks to delete an item chip', () => {
    const handleUpdate = vi.fn();
    render(<ItemsCard items={mockItems} maxAttunement={3} onUpdateItems={handleUpdate} />);

    const deleteBtn = screen.getByRole('button', { name: 'Delete The Tuvala Sundial' });
    expect(deleteBtn).toHaveAttribute('title', 'Delete The Tuvala Sundial');

    // First click: arms delete button, does not delete
    fireEvent.click(deleteBtn);
    expect(handleUpdate).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Click again to delete The Tuvala Sundial' })).toBeInTheDocument();

    // Second click: executes deletion
    const armedBtn = screen.getByRole('button', { name: 'Click again to delete The Tuvala Sundial' });
    fireEvent.click(armedBtn);

    expect(handleUpdate).toHaveBeenCalledWith([
      mockItems[1],
      mockItems[2],
    ]);
  });

  it('allows editing max attunement in managing attunement state and clearing value while typing', () => {
    const handleUpdateMax = vi.fn();
    render(
      <ItemsCard
        items={mockItems}
        maxAttunement={3}
        onUpdateMaxAttunement={handleUpdateMax}
        onUpdateItems={() => {}}
      />
    );
    const manageBtn = screen.getByRole('button', { name: /manage attunement/i });
    fireEvent.click(manageBtn);

    const input = screen.getByLabelText('Max Attunement');
    expect(input).toHaveValue(3);

    // Can delete/clear without being locked to previous number
    fireEvent.change(input, { target: { value: '' } });
    expect(input).toHaveValue(null);

    // Type new value
    fireEvent.change(input, { target: { value: '5' } });
    expect(handleUpdateMax).toHaveBeenCalledWith(5);

    // Blurring when empty falls back safely
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    expect(handleUpdateMax).toHaveBeenCalledWith(3);
  });
});
