import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ItemsCard, { getLineBucket } from './ItemsCard';

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
        color: 'slate',
        category: 'gear',
      }),
    ]);
  });

  it('allows picking a color tag when adding an item', () => {
    const handleUpdate = vi.fn();
    render(<ItemsCard items={mockItems} maxAttunement={3} onUpdateItems={handleUpdate} />);
    const openAddBtn = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(openAddBtn);

    const nameInput = screen.getByLabelText('Item Name');
    fireEvent.change(nameInput, { target: { value: 'Staff of the Magi' } });

    // Open color dropdown and pick amber color swatch
    const colorDropdownBtn = screen.getByRole('button', { name: /Select color tag/i });
    fireEvent.click(colorDropdownBtn);

    const amberOption = screen.getByRole('button', { name: 'Select amber' });
    fireEvent.click(amberOption);

    const saveBtn = screen.getByRole('button', { name: /save item/i });
    fireEvent.click(saveBtn);

    expect(handleUpdate).toHaveBeenCalledWith([
      ...mockItems,
      expect.objectContaining({
        name: 'Staff of the Magi',
        color: 'amber',
      }),
    ]);
  });

  it('filters items by category and color tag using accordion toggle', () => {
    const customItems = [
      { id: 'i1', name: 'Magic Wand', category: 'magic', color: 'sky', requiresAttunement: false },
      { id: 'i2', name: 'Healing Potion', category: 'consumable', color: 'slate', requiresAttunement: false },
      { id: 'i3', name: 'Rope of Climbing', category: 'general', color: 'emerald', requiresAttunement: false },
    ];
    render(<ItemsCard items={customItems} maxAttunement={3} onUpdateItems={() => {}} />);

    // Initially all are visible
    expect(screen.getByText('Magic Wand')).toBeInTheDocument();
    expect(screen.getByText('Healing Potion')).toBeInTheDocument();
    expect(screen.getByText('Rope of Climbing')).toBeInTheDocument();

    // Filters are collapsed by default
    expect(screen.queryByRole('button', { name: 'Filter by Consumables' })).not.toBeInTheDocument();

    // Open filter accordion
    const filterToggle = screen.getByRole('button', { name: /Toggle Items Filters/i });
    fireEvent.click(filterToggle);

    // Filter by category 'Consumables'
    const consumableFilter = screen.getByRole('button', { name: 'Filter by Consumables' });
    fireEvent.click(consumableFilter);
    expect(screen.queryByText('Magic Wand')).not.toBeInTheDocument();
    expect(screen.getByText('Healing Potion')).toBeInTheDocument();
    expect(screen.queryByText('Rope of Climbing')).not.toBeInTheDocument();

    // Filter by category 'Gear' (verifies legacy 'general' maps to 'gear')
    const gearFilter = screen.getByRole('button', { name: 'Filter by Gear' });
    fireEvent.click(gearFilter);
    expect(screen.queryByText('Magic Wand')).not.toBeInTheDocument();
    expect(screen.queryByText('Healing Potion')).not.toBeInTheDocument();
    expect(screen.getByText('Rope of Climbing')).toBeInTheDocument();

    // Reset category filter
    const allCategoryFilter = screen.getByRole('button', { name: 'Filter by All categories' });
    fireEvent.click(allCategoryFilter);
    expect(screen.getByText('Magic Wand')).toBeInTheDocument();

    // Filter by color 'Sky'
    const skyFilter = screen.getByRole('button', { name: 'Filter by Sky' });
    fireEvent.click(skyFilter);
    expect(screen.getByText('Magic Wand')).toBeInTheDocument();
    expect(screen.queryByText('Healing Potion')).not.toBeInTheDocument();
    expect(screen.queryByText('Rope of Climbing')).not.toBeInTheDocument();
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

  it('expands item chip on click to show description and edit pencil button', () => {
    const customItems = [
      {
        id: 'itm_desc',
        name: 'Sunblade',
        requiresAttunement: true,
        attuned: false,
        category: 'magic',
        quantity: 1,
        note: 'Deals radiant damage, emits bright sunlight.',
      },
    ];
    render(<ItemsCard items={customItems} maxAttunement={3} onUpdateItems={() => {}} />);

    // Description is not displayed before expansion
    expect(screen.queryByText('Deals radiant damage, emits bright sunlight.')).not.toBeInTheDocument();

    // Click item chip to expand
    fireEvent.click(screen.getByTestId('item-chip-itm_desc'));

    // Shows expanded details: description, category, edit pencil, and attune button
    expect(screen.getByText('Deals radiant damage, emits bright sunlight.')).toBeInTheDocument();
    expect(screen.getAllByText('Magic Item').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: 'Edit Sunblade' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Attune Sunblade' })).toBeInTheDocument();
  });

  it('allows editing an item via the edit pencil button in expanded card', () => {
    const handleUpdate = vi.fn();
    const customItems = [
      {
        id: 'itm_edit',
        name: 'Sunblade',
        requiresAttunement: true,
        attuned: false,
        category: 'magic',
        color: 'slate',
        quantity: 1,
        note: 'Deals radiant damage.',
      },
    ];
    render(<ItemsCard items={customItems} maxAttunement={3} onUpdateItems={handleUpdate} />);

    // Expand item
    fireEvent.click(screen.getByTestId('item-chip-itm_edit'));

    // Click edit pencil button
    const editBtn = screen.getByRole('button', { name: 'Edit Sunblade' });
    fireEvent.click(editBtn);

    // Form opens in "Edit Item" mode
    expect(screen.getByText('Edit Item')).toBeInTheDocument();
    const nameInput = screen.getByLabelText('Item Name');
    expect(nameInput).toHaveValue('Sunblade');
    const noteInput = screen.getByLabelText('Item Description');
    expect(noteInput).toHaveValue('Deals radiant damage.');

    // Edit name and note
    fireEvent.change(nameInput, { target: { value: 'Sunblade +1' } });
    fireEvent.change(noteInput, { target: { value: 'Deals radiant damage +1.' } });

    // Click Update Item
    const updateBtn = screen.getByRole('button', { name: /update item/i });
    fireEvent.click(updateBtn);

    expect(handleUpdate).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'itm_edit',
        name: 'Sunblade +1',
        note: 'Deals radiant damage +1.',
        requiresAttunement: true,
        category: 'magic',
      }),
    ]);
  });

  it('allows attuning/unattuning from within the expanded card', () => {
    const handleUpdate = vi.fn();
    const customItems = [
      {
        id: 'itm_attune',
        name: 'Sunblade',
        requiresAttunement: true,
        attuned: false,
        category: 'magic',
        quantity: 1,
      },
    ];
    render(<ItemsCard items={customItems} maxAttunement={3} onUpdateItems={handleUpdate} />);

    // Expand
    fireEvent.click(screen.getByTestId('item-chip-itm_attune'));

    // Click Attune button in expanded card
    const attuneBtn = screen.getByRole('button', { name: 'Attune Sunblade' });
    fireEvent.click(attuneBtn);

    expect(handleUpdate).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'itm_attune',
        attuned: true,
      }),
    ]);
  });

  it('highlights the active item chip and closes viewer with close button or re-clicking', () => {
    const customItems = [
      {
        id: 'itm_view',
        name: 'Bag of Holding',
        category: 'magic',
        color: 'purple',
        note: 'Holds 500 lbs.',
      },
    ];
    render(<ItemsCard items={customItems} maxAttunement={3} onUpdateItems={() => {}} />);

    const chip = screen.getByTestId('item-chip-itm_view');
    expect(chip.className).not.toContain('ring-2');

    // Click chip: viewer opens, chip gets highlighted ring
    fireEvent.click(chip);
    expect(screen.getByTestId('item-viewer-card')).toBeInTheDocument();
    expect(chip.className).toContain('ring-2');

    // Click close button on viewer: closes viewer and clears highlight
    const closeBtn = screen.getByRole('button', { name: 'Close Bag of Holding details' });
    fireEvent.click(closeBtn);
    expect(screen.queryByTestId('item-viewer-card')).not.toBeInTheDocument();
    expect(chip.className).not.toContain('ring-2');

    // Re-clicking chip opens and then toggles closed
    fireEvent.click(chip);
    expect(screen.getByTestId('item-viewer-card')).toBeInTheDocument();
    fireEvent.click(chip);
    expect(screen.queryByTestId('item-viewer-card')).not.toBeInTheDocument();
  });

  it('separates categories and sorts items by color order within each category', () => {
    const customItems = [
      { id: 'i1', name: 'Z-Potion', category: 'consumable', color: 'rose' },
      { id: 'i2', name: 'A-Elixir', category: 'consumable', color: 'slate' },
      { id: 'i3', name: 'B-Flask', category: 'consumable', color: 'emerald' },
      { id: 'i4', name: 'Wand', category: 'magic', color: 'sky' },
    ];
    const { container } = render(<ItemsCard items={customItems} maxAttunement={3} onUpdateItems={() => {}} />);

    // Horizontal divider exists between magic and consumable groups
    const dividers = container.querySelectorAll('.border-t.border-white\\/10');
    expect(dividers.length).toBeGreaterThanOrEqual(1);

    // In consumable group, slate (A-Elixir) comes before emerald (B-Flask), which comes before rose (Z-Potion)
    const chips = screen.getAllByTestId(/^item-chip-/);
    const chipNames = chips.map((c) => c.querySelector('.font-semibold').textContent);
    // Magic category comes before consumables:
    // Magic: Wand
    // Consumables: A-Elixir (slate), B-Flask (emerald), Z-Potion (rose)
    expect(chipNames).toEqual(['Wand', 'A-Elixir', 'B-Flask', 'Z-Potion']);
  });

  describe('getLineBucket & stepped heights', () => {
    it('buckets text into 4, 8, 12, or 16 lines', () => {
      expect(getLineBucket('')).toBe(4);
      expect(getLineBucket('Short line')).toBe(4);
      expect(getLineBucket('1\n2\n3\n4')).toBe(4);
      expect(getLineBucket('1\n2\n3\n4\n5')).toBe(8);
      expect(getLineBucket('1\n2\n3\n4\n5\n6\n7\n8')).toBe(8);
      expect(getLineBucket('1\n2\n3\n4\n5\n6\n7\n8\n9')).toBe(12);
      expect(getLineBucket('1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12')).toBe(12);
      expect(getLineBucket('1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13')).toBe(16);
      expect(getLineBucket('1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13\n14\n15\n16\n17\n18\n19\n20')).toBe(16);
      // Direct numeric line count inputs
      expect(getLineBucket(1)).toBe(4);
      expect(getLineBucket(4)).toBe(4);
      expect(getLineBucket(5)).toBe(8);
      expect(getLineBucket(8)).toBe(8);
      expect(getLineBucket(9)).toBe(12);
      expect(getLineBucket(12)).toBe(12);
      expect(getLineBucket(13)).toBe(16);
      expect(getLineBucket(20)).toBe(16);
    });

    it('expands edit textarea rows to match line bucket when editing an 8-line item', () => {
      const customItems = [
        {
          id: 'itm_long',
          name: 'Long Scroll',
          category: 'scroll',
          note: 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7',
        },
      ];
      render(<ItemsCard items={customItems} maxAttunement={3} onUpdateItems={() => {}} />);

      // Click to view, then click edit pencil
      fireEvent.click(screen.getByTestId('item-chip-itm_long'));
      fireEvent.click(screen.getByRole('button', { name: 'Edit Long Scroll' }));

      // Textarea has rows={8} matching the bucket
      const textarea = screen.getByLabelText('Item Description');
      expect(textarea).toHaveAttribute('rows', '8');
    });
  });
});
