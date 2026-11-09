import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ItemsCard, {
  getLineBucket,
  calculateTotalGold,
  CurrencyTracker,
  isCurrencySearchMatch,
  doesCurrencyFitSingleLine,
} from './ItemsCard';

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

  it('renders items with attunement count and compact attunement icon', () => {
    render(<ItemsCard items={mockItems} maxAttunement={3} onUpdateItems={() => {}} />);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    expect(screen.getByText('The Tuvala Sundial')).toBeInTheDocument();

    const attunedChip = screen.getByTestId('item-chip-itm_1');
    const attuneIcon = attunedChip.querySelector('[data-testid="attunement-icon"]');
    expect(attuneIcon).toBeInTheDocument();
    expect(attuneIcon.className).toContain('text-white');
    // Does not have wide text badge on chip
    expect(attunedChip.textContent).not.toContain('(attunable)');

    // Ease-out gradient originates from the right side and ends at the 2/3 mark
    const rightGradient = attunedChip.querySelector('[data-testid="item-right-gradient"]');
    expect(rightGradient).toBeInTheDocument();
    expect(rightGradient.style.background).toContain('linear-gradient(to left');
    expect(rightGradient.style.background).toContain('transparent 33.3%');
    expect(attunedChip.className).not.toContain('border-b');
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

    // Shows expanded details: description, category, edit pencil, and attune button (without duplicate invisible delete button in viewer)
    expect(screen.getByText('Deals radiant damage, emits bright sunlight.')).toBeInTheDocument();
    expect(screen.getAllByText('Magic Item').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: 'Edit Sunblade' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Attune Sunblade' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Delete Sunblade' })).toHaveLength(1);
  });

  it('allows editing an item via the edit pencil button in expanded card directly in its category section', () => {
    const handleUpdate = vi.fn();
    const customItems = [
      {
        id: 'itm_gear_1',
        name: 'Rope',
        category: 'gear',
        quantity: 1,
      },
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

    // Form opens in "Edit Item" mode inside the Magic Item category section, NOT at top above categories
    expect(screen.getByText('Edit Item')).toBeInTheDocument();
    const editForm = screen.getByTestId('item-edit-form');
    expect(editForm).toBeInTheDocument();
    
    // Check form is inside category detail viewer / category section
    const magicHeader = screen.getAllByText('Magic Item').find((el) => el.tagName === 'SPAN');
    const magicSection = magicHeader.closest('div.space-y-1\\.5');
    expect(magicSection).toContainElement(editForm);

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
      expect.objectContaining({ id: 'itm_gear_1', name: 'Rope' }),
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

    it('filters visible items by search query matching name or notes, and clears search', () => {
      const searchItems = [
        { id: 's1', name: 'Ring of Spell Storing', category: 'magic', note: 'Holds up to 5 levels of spells' },
        { id: 's2', name: 'Pearl of Power', category: 'magic', note: 'Restores a slot' },
        { id: 's3', name: 'Rations', category: 'consumable', note: 'Dry meat' },
      ];
      render(<ItemsCard items={searchItems} maxAttunement={3} onUpdateItems={() => {}} />);

      const searchInput = screen.getByPlaceholderText(/search inventory/i);
      expect(searchInput).toBeInTheDocument();

      // Search by note content
      fireEvent.change(searchInput, { target: { value: 'meat' } });
      expect(screen.getByText('Rations')).toBeInTheDocument();
      expect(screen.queryByText('Ring of Spell Storing')).not.toBeInTheDocument();
      expect(screen.queryByText('Pearl of Power')).not.toBeInTheDocument();

      // Clear search via clear button
      const clearBtn = screen.getByRole('button', { name: /clear search/i });
      fireEvent.click(clearBtn);
      expect(screen.getByText('Ring of Spell Storing')).toBeInTheDocument();
      expect(screen.getByText('Pearl of Power')).toBeInTheDocument();
      expect(screen.getByText('Rations')).toBeInTheDocument();

      // Search matching nothing displays empty state
      fireEvent.change(searchInput, { target: { value: 'vorpal' } });
      expect(screen.getByText(/no items matching "vorpal"/i)).toBeInTheDocument();
    });

    it('renders the detail viewer inside the item category subsection and moves when selecting item in another category', () => {
      const categoryItems = [
        { id: 'm1', name: 'Wand of Magic Missiles', category: 'magic', note: 'Fires 3 darts.' },
        { id: 'c1', name: 'Potion of Invisibility', category: 'consumable', note: 'Turn invisible.' },
      ];
      render(<ItemsCard items={categoryItems} maxAttunement={3} onUpdateItems={() => {}} />);

      // Click wand (magic item)
      fireEvent.click(screen.getByTestId('item-chip-m1'));
      const viewer = screen.getByTestId('item-viewer-card');
      expect(viewer).toBeInTheDocument();
      expect(viewer.textContent).toContain('Wand of Magic Missiles');

      // Animated wrapper has accordion expand animation
      const wrapper = screen.getByTestId('item-viewer-wrapper');
      expect(wrapper.className).toContain('animate-accordion-down');

      // Card element has animated height transition
      expect(viewer.className).toContain('transition-[height,background-color]');
      expect(viewer.style.height).toBe('142px'); // 64px header/paddings + 4 lines * 19.5px

      // Header does not have redundant color dot
      expect(viewer.querySelector('.w-2.h-2.rounded-full')).toBeNull();

      // Click potion (consumable item)
      fireEvent.click(screen.getByTestId('item-chip-c1'));
      expect(screen.getByTestId('item-viewer-card')).toBeInTheDocument();
      expect(screen.getByTestId('item-viewer-card').textContent).toContain('Potion of Invisibility');

      // Close viewer
      const closeBtn = screen.getByRole('button', { name: 'Close Potion of Invisibility details' });
      fireEvent.click(closeBtn);
      // In JSDOM useAccordionMount unmounts synchronously
      expect(screen.queryByTestId('item-viewer-card')).toBeNull();
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

  describe('CurrencyTracker & calculateTotalGold', () => {
    it('correctly calculates total wealth in gold pieces (gp)', () => {
      expect(calculateTotalGold({ cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 })).toBe(0);
      expect(calculateTotalGold({ cp: 100, sp: 10, ep: 2, gp: 5, pp: 1 })).toBe(18);
      expect(calculateTotalGold({ cp: 50 })).toBe(0.5);
      expect(calculateTotalGold({ pp: 3, gp: 25 })).toBe(55);
      expect(calculateTotalGold({ cp: -10, sp: 'invalid' })).toBe(0);
    });

    it('renders all currency denomination inputs and displays total wealth with category styling', () => {
      const currency = { cp: 50, sp: 20, ep: 4, gp: 10, pp: 2 };
      const { container } = render(<CurrencyTracker currency={currency} onUpdateCurrency={() => {}} />);

      // Category title and Coins icon
      expect(screen.getByText('Currency')).toBeInTheDocument();
      expect(container.querySelector('.lucide-coins')).toBeInTheDocument();

      expect(screen.getByLabelText('Copper Pieces (CP)')).toHaveValue(50);
      expect(screen.getByLabelText('Silver Pieces (SP)')).toHaveValue(20);
      expect(screen.getByLabelText('Electrum Pieces (EP)')).toHaveValue(4);
      expect(screen.getByLabelText('Gold Pieces (GP)')).toHaveValue(10);
      expect(screen.getByLabelText('Platinum Pieces (PP)')).toHaveValue(2);

      // Total: (2 * 10) + 10 + (4 * 0.5) + (20 * 0.1) + (50 * 0.01) = 20 + 10 + 2 + 2 + 0.5 = 34.5 gp
      const totalAmount = screen.getByText('34.50 gp');
      expect(totalAmount).toBeInTheDocument();
      expect(totalAmount).toHaveClass('text-dnd-gold');
    });

    it('updates currency on input change and blur', () => {
      const handleUpdate = vi.fn();
      const currency = { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 };
      render(<ItemsCard items={[]} currency={currency} onUpdateCurrency={handleUpdate} maxAttunement={3} />);

      const gpInput = screen.getByLabelText('Gold Pieces (GP)');
      expect(gpInput).toHaveValue(10);

      fireEvent.change(gpInput, { target: { value: '45' } });
      fireEvent.blur(gpInput);

      expect(handleUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          gp: 45,
        })
      );
    });

    it('matches currency search queries accurately with isCurrencySearchMatch', () => {
      expect(isCurrencySearchMatch('')).toBe(true);
      expect(isCurrencySearchMatch('gold')).toBe(true);
      expect(isCurrencySearchMatch('gp')).toBe(true);
      expect(isCurrencySearchMatch('silver')).toBe(true);
      expect(isCurrencySearchMatch('sp')).toBe(true);
      expect(isCurrencySearchMatch('coins')).toBe(true);
      expect(isCurrencySearchMatch('currency')).toBe(true);
      expect(isCurrencySearchMatch('spear')).toBe(false);
      expect(isCurrencySearchMatch('apple')).toBe(false);
      expect(isCurrencySearchMatch('vorpal')).toBe(false);
    });

    it('integrates Currency into category search behavior with uniform separation', () => {
      const items = [
        { id: 'itm_gold_ring', name: 'Gold Ring', category: 'gear' },
        { id: 'itm_iron_dagger', name: 'Iron Dagger', category: 'gear' },
      ];
      const currency = { cp: 10, sp: 5, ep: 0, gp: 100, pp: 1 };

      const { container } = render(
        <ItemsCard items={items} currency={currency} maxAttunement={3} onUpdateItems={() => {}} />
      );

      const searchInput = screen.getByPlaceholderText(/search inventory/i);

      // Search "gold" -> both Currency category and Gold Ring appear, Iron Dagger is hidden
      fireEvent.change(searchInput, { target: { value: 'gold' } });
      expect(screen.getByTestId('currency-tracker')).toBeInTheDocument();
      expect(screen.getByText('Gold Ring')).toBeInTheDocument();
      expect(screen.queryByText('Iron Dagger')).not.toBeInTheDocument();
      expect(screen.getByText('1 item')).toBeInTheDocument();

      // Divider exists between Currency and the matching item category
      expect(container.querySelector('.border-t.border-white\\/10')).toBeInTheDocument();

      // Search "dagger" -> Currency category is hidden, Iron Dagger appears
      fireEvent.change(searchInput, { target: { value: 'dagger' } });
      expect(screen.queryByTestId('currency-tracker')).not.toBeInTheDocument();
      expect(screen.getByText('Iron Dagger')).toBeInTheDocument();
      expect(screen.queryByText('Gold Ring')).not.toBeInTheDocument();

      // Search "vorpal" -> neither Currency nor items match, shows empty search state
      fireEvent.change(searchInput, { target: { value: 'vorpal' } });
      expect(screen.queryByTestId('currency-tracker')).not.toBeInTheDocument();
      expect(screen.getByText(/no items matching "vorpal"/i)).toBeInTheDocument();
    });

    it('renders single-line compact horizontal coin entries for standard values', () => {
      const currency = { cp: 10, sp: 20, ep: 0, gp: 50, pp: 2 };
      const { container } = render(<CurrencyTracker currency={currency} onUpdateCurrency={() => {}} />);

      const tracker = container.querySelector('[data-testid="currency-tracker"]');
      const labels = tracker.querySelectorAll('label');
      expect(labels).toHaveLength(5);

      labels.forEach((lbl) => {
        // Single-line flex layout
        expect(lbl.className).toContain('flex');
        expect(lbl.className).toContain('items-center');
        expect(lbl.className).toContain('justify-between');
        expect(lbl.className).not.toContain('flex-col');
        // Visual ordering: value input has order-1, unit span has order-2
        const span = lbl.querySelector('span');
        const input = lbl.querySelector('input');
        expect(span.className).toContain('order-2');
        expect(input.className).toContain('order-1');
      });
    });

    it('switches all denominations uniformly to two-line format when any currency overflows', () => {
      const currency = { cp: 10000, sp: 233, ep: 1, gp: 233, pp: 0 };
      const { container } = render(<CurrencyTracker currency={currency} onUpdateCurrency={() => {}} />);

      const tracker = container.querySelector('[data-testid="currency-tracker"]');
      const labels = tracker.querySelectorAll('label');
      expect(labels).toHaveLength(5);

      // All 5 denominations become two-line flex-col uniformly
      labels.forEach((lbl) => {
        expect(lbl.className).toContain('flex-col');
        expect(lbl.className).toContain('items-center');
        expect(lbl.className).toContain('justify-center');
        const span = lbl.querySelector('span');
        const input = lbl.querySelector('input');
        expect(span.className).toContain('order-1');
        expect(input.className).toContain('order-2');
      });

      const cpInput = screen.getByLabelText('Copper Pieces (CP)');
      expect(cpInput).toHaveValue(10000);
      expect(cpInput.className).toContain('text-[11px]');
    });

    it('responsively decides single-line fit based on container/card width', () => {
      // Wide card width (100px): 4 digits (1000) fits with plenty of space on 1 line
      expect(doesCurrencyFitSingleLine(1000, 100)).toBe(true);
      expect(doesCurrencyFitSingleLine(9999, 100)).toBe(true);

      // Narrow card width (58px, narrowed aspect ratio / mobile): 4 digits (1000) wraps to 2-line to prevent culling
      expect(doesCurrencyFitSingleLine(1000, 58)).toBe(false);
      // But 2 or 3 digits still fit in 58px
      expect(doesCurrencyFitSingleLine(233, 58)).toBe(true);
      expect(doesCurrencyFitSingleLine(50, 58)).toBe(true);

      // Standard card width (75px): 4 digits fits on 1 line, huge 6 digits wraps
      expect(doesCurrencyFitSingleLine(1000, 75)).toBe(true);
      expect(doesCurrencyFitSingleLine(100000, 75)).toBe(false);
    });

    it('handles giant edge case numbers with proportional font scaling', () => {
      const currency = { cp: 10000000, sp: 0, ep: 0, gp: 500000000, pp: 0 };
      render(<CurrencyTracker currency={currency} onUpdateCurrency={() => {}} />);

      const cpInput = screen.getByLabelText('Copper Pieces (CP)');
      expect(cpInput.className).toContain('text-[10px]'); // 8 digits

      const gpInput = screen.getByLabelText('Gold Pieces (GP)');
      expect(gpInput.className).toContain('text-[9px]'); // 9 digits
    });
  });
});
