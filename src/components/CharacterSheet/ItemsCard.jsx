import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  BowArrow,
  Wand,
  Amphora,
  ScrollText,
  Stone,
  LayoutGridCircles,
  Plus,
  X,
  ChevronDown,
  Blend,
  Waypoints,
  Pencil,
} from 'lucide-react';
import useTwoClickConfirm from '../../hooks/useTwoClickConfirm';
import useClickOutside from '../../hooks/useClickOutside';

export const ITEM_COLORS = [
  { id: 'slate', label: 'Slate', bg: 'bg-slate-800/40', text: 'text-slate-300', dot: 'bg-slate-400' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-950/40', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  { id: 'sky', label: 'Sky', bg: 'bg-sky-950/40', text: 'text-sky-300', dot: 'bg-sky-400' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-950/40', text: 'text-purple-300', dot: 'bg-purple-400' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-950/60', text: 'text-amber-300', dot: 'bg-amber-400' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-950/40', text: 'text-rose-300', dot: 'bg-rose-400' },
];

export const COLOR_ORDER = {
  slate: 0,
  emerald: 1,
  sky: 2,
  purple: 3,
  amber: 4,
  rose: 5,
};

export const CATEGORY_ORDER = ['gear', 'magic', 'consumable', 'scroll', 'component', 'other'];

export const ITEM_CATEGORIES = [
  { id: 'gear', label: 'Gear & Equipment', shortLabel: 'Gear', icon: BowArrow },
  { id: 'magic', label: 'Magic Item', shortLabel: 'Magic', icon: Wand },
  { id: 'consumable', label: 'Consumables', shortLabel: 'Consumables', icon: Amphora },
  { id: 'scroll', label: 'Spell Scrolls', shortLabel: 'Scrolls', icon: ScrollText },
  { id: 'component', label: 'Spell Components', shortLabel: 'Components', icon: Stone },
  { id: 'other', label: 'Other', shortLabel: 'Other', icon: LayoutGridCircles },
];

export function getCategoryConfig(categoryId) {
  const resolved = categoryId === 'general' ? 'gear' : categoryId;
  return ITEM_CATEGORIES.find((c) => c.id === resolved) || ITEM_CATEGORIES[0];
}

export function getCategoryIcon(category) {
  return getCategoryConfig(category).icon;
}

// Maps legacy rarity IDs to colors if present, or resolves color directly
export function getColorConfig(colorId) {
  const legacyMap = {
    common: 'slate',
    uncommon: 'emerald',
    rare: 'sky',
    very_rare: 'purple',
    legendary: 'amber',
    artifact: 'rose',
  };
  const resolved = legacyMap[colorId] || colorId;
  return ITEM_COLORS.find((c) => c.id === resolved) || ITEM_COLORS[0];
}

// ponytail: discrete buckets 4, 8, 12, 16 lines for stepped height transitions
export function estimateLinesFromText(text) {
  if (!text || typeof text !== 'string' || !text.trim()) return 1;
  const rawLines = text.split('\n');
  let totalLines = 0;
  for (const line of rawLines) {
    // Desktop layout fits ~95-100 chars per line for text-xs leading-relaxed
    const wrapped = Math.max(1, Math.ceil(line.length / 98));
    totalLines += wrapped;
  }
  return totalLines;
}

export function getLineBucket(input) {
  const lineCount = typeof input === 'number' ? input : estimateLinesFromText(input);
  if (lineCount <= 4) return 4;
  if (lineCount <= 8) return 8;
  if (lineCount <= 12) return 12;
  return 16;
}

// ponytail: extracted so useTwoClickConfirm hook works per-row inside .map()
function ItemDeleteButton({ item, onDelete }) {
  const { armed, handleClick } = useTwoClickConfirm(() => {
    onDelete?.(item.id);
  });

  return (
    <button
      type="button"
      aria-label={armed ? `Click again to delete ${item.name}` : `Delete ${item.name}`}
      title={armed ? `Click again to delete ${item.name}` : `Delete ${item.name}`}
      onClick={(e) => {
        e.stopPropagation();
        handleClick();
      }}
      className={`ml-1.5 p-0.5 rounded transition-all cursor-pointer ${
        armed
          ? 'opacity-100 text-red-500 bg-red-950/70 ring-1 ring-red-500/60'
          : 'opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400'
      }`}
    >
      <X size={10} />
    </button>
  );
}

export function MaxAttunementInput({ value, onChange }) {
  const [draft, setDraft] = useState(String(value ?? 3));

  useEffect(() => {
    setDraft(String(value ?? 3));
  }, [value]);

  const commit = (rawVal) => {
    const candidate = rawVal !== undefined ? rawVal : draft;
    const parsed = parseInt(candidate, 10);
    const valid = Number.isNaN(parsed) ? (value ?? 3) : Math.max(1, Math.min(20, parsed));
    setDraft(String(valid));
    onChange?.(valid);
  };

  return (
    <input
      type="number"
      aria-label="Max Attunement"
      min="1"
      max="20"
      value={draft}
      onFocus={(e) => e.target.select()}
      onChange={(e) => {
        const next = e.target.value;
        setDraft(next);
        if (next !== '') {
          const parsed = parseInt(next, 10);
          if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 20) {
            onChange?.(parsed);
          }
        }
      }}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          commit(e.currentTarget.value);
          e.currentTarget.blur();
        }
      }}
      className="w-7 text-center rounded bg-dnd-panel text-dnd-gold font-bold text-[11px] focus:outline-none focus:ring-1 focus:ring-white/20 ml-1 py-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
}

export default function ItemsCard({
  items = [],
  maxAttunement = 3,
  onUpdateMaxAttunement,
  isAttuneMode: externalIsAttuneMode,
  onToggleAttuneMode,
  isAdding: externalIsAdding,
  onSetIsAdding,
  showFilters: externalShowFilters,
  onToggleFilters,
  filters: externalFilters,
  onFilterChange,
  hideHeaderActions = false,
  onUpdateItems,
}) {
  const [internalIsAttuneMode, setInternalIsAttuneMode] = useState(false);
  const [internalIsAdding, setInternalIsAdding] = useState(false);
  const [internalShowFilters, setInternalShowFilters] = useState(false);
  const [internalFilters, setInternalFilters] = useState({ category: 'all', color: 'all' });

  const isAttuneMode =
    externalIsAttuneMode !== undefined ? externalIsAttuneMode : internalIsAttuneMode;
  const setIsAttuneMode = onToggleAttuneMode || setInternalIsAttuneMode;
  const isAdding = externalIsAdding !== undefined ? externalIsAdding : internalIsAdding;
  const setIsAdding = onSetIsAdding || setInternalIsAdding;

  const showFilters =
    externalShowFilters !== undefined ? externalShowFilters : internalShowFilters;
  const setShowFilters = onToggleFilters || (() => setInternalShowFilters((prev) => !prev));

  const filters = externalFilters !== undefined ? externalFilters : internalFilters;
  const setFilters = onFilterChange || setInternalFilters;

  const selectedCategory = filters.category || 'all';
  const selectedColor = filters.color || 'all';
  const isFiltered = selectedCategory !== 'all' || selectedColor !== 'all';

  // Active viewed item & edit state
  const [viewingItemId, setViewingItemId] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);

  // New/Edit item form state
  const [name, setName] = useState('');
  const [requiresAttunement, setRequiresAttunement] = useState(false);
  const [category, setCategory] = useState('gear');
  const [color, setColor] = useState('slate');
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [nameError, setNameError] = useState(false);

  const colorDropdownRef = useClickOutside(isColorMenuOpen, () => setIsColorMenuOpen(false));

  const safeItems = Array.isArray(items) ? items : [];
  const attunedCount = safeItems.filter((i) => i.requiresAttunement && i.attuned).length;
  const editBucket = getLineBucket(note);

  const viewingItem = useMemo(() => {
    if (!viewingItemId) return null;
    return safeItems.find((i) => i.id === viewingItemId) || null;
  }, [safeItems, viewingItemId]);

  const viewerTextRef = useRef(null);
  const [measuredViewerLines, setMeasuredViewerLines] = useState(null);

  useEffect(() => {
    if (!viewingItemId || !viewerTextRef.current) {
      setMeasuredViewerLines(null);
      return;
    }
    const update = () => {
      if (viewerTextRef.current) {
        const computed = window.getComputedStyle(viewerTextRef.current);
        const lh = parseFloat(computed.lineHeight) || 19.5;
        const sh = viewerTextRef.current.scrollHeight;
        if (sh > 0) {
          const lines = Math.max(1, Math.round(sh / lh));
          setMeasuredViewerLines(lines);
        }
      }
    };
    update();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    if (ro && viewerTextRef.current) ro.observe(viewerTextRef.current);
    return () => ro?.disconnect();
  }, [viewingItemId, safeItems]);

  const toggleAttune = (itemId) => {
    const updated = safeItems.map((item) => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        attuned: !item.attuned,
      };
    });
    onUpdateItems?.(updated);
  };

  const handleStartEdit = (item, e) => {
    e?.stopPropagation?.();
    setName(item.name || '');
    setQuantity(item.quantity || 1);
    setColor(item.color || 'slate');
    setCategory(item.category === 'general' ? 'gear' : item.category || 'gear');
    setRequiresAttunement(Boolean(item.requiresAttunement));
    setNote(item.note || item.description || '');
    setEditingItemId(item.id);
    setNameError(false);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setName('');
    setQuantity(1);
    setColor('slate');
    setCategory('gear');
    setRequiresAttunement(false);
    setNote('');
    setNameError(false);
    setEditingItemId(null);
    setIsAdding(false);
  };

  const handleDeleteItem = (itemId, e) => {
    e?.stopPropagation?.();
    if (viewingItemId === itemId) setViewingItemId(null);
    if (editingItemId === itemId) handleCancel();
    const updated = safeItems.filter((i) => i.id !== itemId);
    onUpdateItems?.(updated);
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      return;
    }

    if (editingItemId) {
      const updated = safeItems.map((item) => {
        if (item.id !== editingItemId) return item;
        return {
          ...item,
          name: name.trim(),
          requiresAttunement: Boolean(requiresAttunement),
          category,
          color: color || 'slate',
          quantity: Math.max(1, Number(quantity) || 1),
          note: note.trim(),
        };
      });
      onUpdateItems?.(updated);
      setViewingItemId(editingItemId);
      setEditingItemId(null);
    } else {
      const newItem = {
        id: `itm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: name.trim(),
        requiresAttunement: Boolean(requiresAttunement),
        attuned: false,
        category,
        color: color || 'slate',
        quantity: Math.max(1, Number(quantity) || 1),
        note: note.trim(),
      };
      onUpdateItems?.([...safeItems, newItem]);
    }

    setName('');
    setRequiresAttunement(false);
    setCategory('gear');
    setColor('slate');
    setIsColorMenuOpen(false);
    setQuantity(1);
    setNote('');
    setNameError(false);
    setIsAdding(false);
  };

  const { groupedItems, totalFilteredCount } = useMemo(() => {
    const filtered = safeItems.filter((item) => {
      if (selectedCategory !== 'all') {
        const itemCat = item.category === 'general' ? 'gear' : item.category;
        if (itemCat !== selectedCategory) {
          return false;
        }
      }
      if (selectedColor !== 'all') {
        const itemColor = getColorConfig(item.color || item.rarity).id;
        if (itemColor !== selectedColor) {
          return false;
        }
      }
      return true;
    });

    const groups = [];
    CATEGORY_ORDER.forEach((catKey) => {
      const itemsInCat = filtered
        .filter((item) => {
          const cat = item.category === 'general' ? 'gear' : item.category;
          return cat === catKey;
        })
        .sort((a, b) => {
          const colorA = getColorConfig(a.color || a.rarity).id;
          const colorB = getColorConfig(b.color || b.rarity).id;
          const orderA = COLOR_ORDER[colorA] ?? 99;
          const orderB = COLOR_ORDER[colorB] ?? 99;
          if (orderA !== orderB) return orderA - orderB;
          return a.name.localeCompare(b.name);
        });

      if (itemsInCat.length > 0) {
        groups.push({
          category: catKey,
          config: getCategoryConfig(catKey),
          items: itemsInCat,
        });
      }
    });

    return {
      groupedItems: groups,
      totalFilteredCount: filtered.length,
    };
  }, [safeItems, selectedCategory, selectedColor]);

  const selectedColorConfig = getColorConfig(color);

  return (
    <div className="space-y-2.5">
      {/* Header action bar (fallback when not mounted in AccordionSection) */}
      {!hideHeaderActions && (
        <div className="flex items-center justify-end pb-1 border-b border-white/5 text-xs">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              aria-label="Manage Attunement"
              onClick={() => setIsAttuneMode(!isAttuneMode)}
              className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-lg text-xs transition-colors shadow-sm cursor-pointer ${
                isAttuneMode
                  ? 'bg-dnd-gold text-slate-950 font-semibold shadow-sm'
                  : 'bg-dnd-card hover:bg-dnd-hover hover:ring-1 hover:ring-dnd-gold/40 text-slate-300'
              }`}
              title={isAttuneMode ? 'Finish managing attunement' : 'Click to manage attunement slots'}
            >
              <Waypoints size={11} className={isAttuneMode ? 'text-slate-950' : 'text-dnd-gold'} />
              <span className={`text-[11px] ${isAttuneMode ? 'text-slate-900 font-semibold' : 'text-slate-300'}`}>
                Attune:
              </span>
              <span
                className={`text-[11px] font-bold ${
                  isAttuneMode
                    ? 'text-slate-950'
                    : attunedCount > maxAttunement
                    ? 'text-red-400'
                    : 'text-dnd-gold'
                }`}
              >
                {attunedCount} /{' '}
                {isAttuneMode ? (
                  <MaxAttunementInput
                    value={maxAttunement}
                    onChange={(val) => onUpdateMaxAttunement?.(val)}
                  />
                ) : (
                  maxAttunement
                )}
              </span>
            </button>

            <button
              type="button"
              aria-label="Toggle Items Filters"
              onClick={() => setShowFilters((prev) => !prev)}
              className={`relative flex items-center space-x-1 bg-dnd-card rounded-lg px-2 py-0.5 text-xs transition-colors ${
                isFiltered ? 'ring-1 ring-dnd-gold/50 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Filter items in inventory"
            >
              <Blend size={11} className="text-dnd-gold" />
              <span className="text-[11px] font-semibold text-slate-200">Filters</span>
              <ChevronDown size={10} className={`text-slate-400 transition-transform duration-200 ${showFilters ? '' : '-rotate-90'}`} />
            </button>

            <button
              type="button"
              aria-label="Add Item"
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-dnd-card hover:bg-dnd-hover text-dnd-gold hover:text-dnd-gold-light text-xs transition-colors"
            >
              <Plus size={11} />
              <span className="text-[11px]">Add</span>
            </button>
          </div>
        </div>
      )}

      {/* Attunement Mode Subtle Tip */}
      {isAttuneMode && (
        <p className="text-[11px] text-slate-500 italic px-0.5 animate-fadeIn">
          Click any attunable item chip below to attune or unattune.
        </p>
      )}

      {/* Inline Add / Edit Item Form */}
      {isAdding && (
        <form
          noValidate
          onSubmit={handleSaveItem}
          className="p-2.5 rounded-lg bg-dnd-card space-y-2 text-xs shadow-sm ring-1 ring-dnd-gold/30 animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-dnd-gold text-[11px]">
              {editingItemId ? 'Edit Item' : 'Add New Item'}
            </span>
            <button
              type="button"
              aria-label="Cancel"
              onClick={handleCancel}
              className="text-slate-400 hover:text-white"
            >
              <X size={13} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2">
            {/* Item Name (takes all remaining flex space) */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <label htmlFor="itm-name" className="block text-[10px] text-slate-400">
                  Item Name
                </label>
                {nameError && (
                  <span className="text-[9px] text-red-400 font-semibold">Name required</span>
                )}
              </div>
              <input
                id="itm-name"
                aria-label="Item Name"
                type="text"
                placeholder="e.g. Ring of Spell Storing"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError(false);
                }}
                className={`w-full px-2 py-1 rounded bg-dnd-panel text-slate-200 text-xs focus:outline-none transition-colors ${
                  nameError
                    ? 'border border-red-500/60 ring-1 ring-red-500/40'
                    : 'focus:ring-1 focus:ring-white/20'
                }`}
              />
            </div>

            {/* Quantity */}
            <div className="w-14 shrink-0">
              <label htmlFor="itm-qty" className="block text-[10px] text-slate-400 mb-0.5 text-center">
                Qty
              </label>
              <input
                id="itm-qty"
                aria-label="Quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-1.5 py-1 rounded bg-dnd-panel text-slate-200 text-xs text-center focus:outline-none focus:ring-1 focus:ring-white/20 h-[26px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            {/* Color Tag Dropdown (to the left of Category) */}
            <div className="w-11 shrink-0 relative" ref={colorDropdownRef}>
              <label className="block text-[10px] text-slate-400 mb-0.5 text-center">
                Color
              </label>
              <button
                type="button"
                aria-label="Select color tag"
                onClick={() => setIsColorMenuOpen((prev) => !prev)}
                className="w-full px-1 py-1 rounded bg-dnd-panel text-slate-200 text-xs flex items-center justify-center gap-1 hover:bg-dnd-panel/90 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors h-[26px]"
              >
                <span className={`w-3.5 h-3.5 rounded-full ${selectedColorConfig.dot} shadow-sm shrink-0`} />
                <ChevronDown size={10} className={`text-slate-400 transition-transform ${isColorMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isColorMenuOpen && (
                <div className="absolute left-0 top-full mt-1.5 p-1.5 rounded-lg bg-dnd-card shadow-lg ring-1 ring-white/10 z-30 grid grid-cols-3 gap-1.5 w-[84px]">
                  {ITEM_COLORS.map((c) => {
                    const isSelected = color === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        aria-label={`Select ${c.id}`}
                        onClick={() => {
                          setColor(c.id);
                          setIsColorMenuOpen(false);
                        }}
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'ring-2 ring-white scale-110 shadow-sm'
                            : 'opacity-70 hover:opacity-100 hover:scale-105'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${c.dot}`} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Category */}
            <div className="w-40 shrink-0">
              <label htmlFor="itm-cat" className="block text-[10px] text-slate-400 mb-0.5">
                Category
              </label>
              <select
                id="itm-cat"
                aria-label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2 py-1 rounded bg-dnd-panel text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-white/20 h-[26px]"
              >
                <option value="gear">Gear & Equipment</option>
                <option value="magic">Magic Item</option>
                <option value="consumable">Consumables</option>
                <option value="scroll">Spell Scrolls</option>
                <option value="component">Spell Components</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Description / Notes */}
          <div>
            <label htmlFor="itm-note" className="block text-[10px] text-slate-400 mb-0.5">
              Description / Notes
            </label>
            <textarea
              id="itm-note"
              aria-label="Item Description"
              rows={editBucket}
              placeholder="Effects, charges, properties, or details..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{
                minHeight: `${editBucket * 20 + 16}px`,
                maxHeight: `${Math.max(editBucket, 16) * 20 + 16}px`,
              }}
              className="w-full px-2 py-1.5 rounded bg-dnd-panel text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-white/20 transition-[min-height,height] duration-300 ease-in-out resize-y"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 text-slate-300 text-xs cursor-pointer select-none">
              <input
                type="checkbox"
                aria-label="Requires Attunement"
                checked={requiresAttunement}
                onChange={(e) => setRequiresAttunement(e.target.checked)}
                className="rounded bg-dnd-panel text-dnd-gold focus:ring-0"
              />
              <span>Requires Attunement</span>
            </label>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-2.5 py-1 rounded bg-dnd-panel text-slate-300 text-xs hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-dnd-gold text-slate-950 font-bold hover:bg-dnd-gold-light text-xs"
              >
                {editingItemId ? 'Update Item' : 'Save Item'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Expandable Items Filter Accordion */}
      {showFilters && (
        <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs py-1 px-1.5 rounded-lg bg-dnd-card shadow-sm animate-fadeIn">
          {/* Category Filters */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Filter by All categories"
              onClick={() => setFilters({ ...filters, category: 'all' })}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-dnd-gold text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-dnd-panel/60'
              }`}
            >
              All
            </button>
            {ITEM_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  aria-label={`Filter by ${cat.shortLabel}`}
                  onClick={() =>
                    setFilters({ ...filters, category: isSelected ? 'all' : cat.id })
                  }
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    isSelected
                      ? 'bg-dnd-gold text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-dnd-panel/60'
                  }`}
                >
                  <Icon size={10} />
                  <span>{cat.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Color Filter Dots */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Filter by All colors"
              title="All Colors"
              onClick={() => setFilters({ ...filters, color: 'all' })}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                selectedColor === 'all'
                  ? 'text-dnd-gold font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              All Colors
            </button>
            {ITEM_COLORS.map((c) => {
              const isSelected = selectedColor === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-label={`Filter by ${c.label}`}
                  title={`Filter by ${c.label}`}
                  onClick={() =>
                    setFilters({ ...filters, color: isSelected ? 'all' : c.id })
                  }
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'ring-2 ring-white ring-offset-1 ring-offset-dnd-card scale-110'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Persistent Item Viewer (Accordion Grid Animation + Stepped Line Buckets 4/8/12/16) */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          viewingItem && !isAdding ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          {viewingItem && !isAdding && (() => {
            const viewerColorCfg = getColorConfig(viewingItem.color || viewingItem.rarity);
            const viewerCatCfg = getCategoryConfig(viewingItem.category);
            const ViewerCategoryIcon = viewerCatCfg.icon;
            const isViewerAttuned = Boolean(viewingItem.attuned && viewingItem.requiresAttunement);
            const noteText = viewingItem.note || viewingItem.description || '';
            const rawLines = measuredViewerLines !== null ? measuredViewerLines : estimateLinesFromText(noteText);
            const viewerBucket = getLineBucket(rawLines);
            const noteHeightPx = viewerBucket * 19.5;

            return (
              <div className="pb-3">
                <div
                  data-testid="item-viewer-card"
                  className={`p-3 rounded-lg flex flex-col justify-between text-xs shadow-sm ring-1 ring-white/10 ${viewerColorCfg.bg} ${viewerColorCfg.text}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full ${viewerColorCfg.dot} shadow-sm shrink-0`} />
                      <ViewerCategoryIcon size={14} className="shrink-0 text-dnd-gold opacity-90" />
                      <span className="font-bold text-sm text-slate-100 truncate">
                        {viewingItem.name}
                      </span>
                      {viewingItem.quantity > 1 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-200">
                          x{viewingItem.quantity}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-medium">
                        {viewerCatCfg.label}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      {viewingItem.requiresAttunement && (
                        <button
                          type="button"
                          aria-label={isViewerAttuned ? `Unattune ${viewingItem.name}` : `Attune ${viewingItem.name}`}
                          onClick={() => toggleAttune(viewingItem.id)}
                          className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                            isViewerAttuned
                              ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
                              : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isViewerAttuned
                                ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                                : 'bg-slate-500'
                            }`}
                          />
                          <span>{isViewerAttuned ? 'Attuned' : 'Attune'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        aria-label={`Edit ${viewingItem.name}`}
                        title={`Edit ${viewingItem.name}`}
                        onClick={(e) => handleStartEdit(viewingItem, e)}
                        className="p-1 rounded text-slate-400 hover:text-dnd-gold hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <Pencil size={12} />
                      </button>

                      <ItemDeleteButton item={viewingItem} onDelete={handleDeleteItem} />

                      <button
                        type="button"
                        aria-label={`Close ${viewingItem.name} details`}
                        title="Close details"
                        onClick={() => setViewingItemId(null)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      minHeight: `${noteHeightPx}px`,
                      maxHeight: `${noteHeightPx}px`,
                    }}
                    className="pt-1.5 mt-1 border-t border-white/5 text-slate-300 text-xs overflow-y-auto pr-1 transition-[min-height,max-height] duration-300 ease-in-out"
                  >
                    {viewingItem.note || viewingItem.description ? (
                      <p ref={viewerTextRef} className="whitespace-pre-wrap leading-relaxed text-slate-300">
                        {viewingItem.note || viewingItem.description}
                      </p>
                    ) : (
                      <p ref={viewerTextRef} className="text-slate-500 italic text-[11px] leading-relaxed">
                        No description or notes recorded.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Items Inventory List */}
      <div className="space-y-3 min-h-[22px]">
        {safeItems.length === 0 && !isAdding && (
          <span className="text-[10px] text-slate-500 italic">No items recorded</span>
        )}

        {safeItems.length > 0 && totalFilteredCount === 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 italic">No items match current filters</span>
            <button
              type="button"
              onClick={() => setFilters({ category: 'all', color: 'all' })}
              className="text-[10px] text-dnd-gold hover:underline"
            >
              Reset
            </button>
          </div>
        )}

        {groupedItems.map((group, groupIdx) => {
          const CategoryIcon = group.config.icon;

          return (
            <div key={group.category} className="space-y-1.5">
              {groupIdx > 0 && <div className="border-t border-white/10 my-3" />}

              {/* Category Header */}
              <div className="flex items-center justify-between text-xs px-1 text-slate-400 font-medium">
                <div className="flex items-center space-x-1.5">
                  <CategoryIcon size={12} className="text-dnd-gold opacity-90" />
                  <span className="text-[11px] font-semibold text-slate-300 tracking-wide">
                    {group.config.label}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium px-1.5 py-0.2 rounded bg-white/5">
                  {group.items.length}
                </span>
              </div>

              {/* Grid of Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-1.5">
                {group.items.map((item) => {
                  const isAttuned = Boolean(item.attuned && item.requiresAttunement);
                  const colorCfg = getColorConfig(item.color || item.rarity);
                  const isViewing = viewingItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`View ${item.name}`}
                      data-testid={`item-chip-${item.id}`}
                      onClick={() => {
                        if (isAttuneMode) {
                          toggleAttune(item.id);
                        } else {
                          setViewingItemId((prev) => (prev === item.id ? null : item.id));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          if (isAttuneMode) {
                            toggleAttune(item.id);
                          } else {
                            setViewingItemId((prev) => (prev === item.id ? null : item.id));
                          }
                        }
                      }}
                      className={`group relative flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs select-none transition-all shadow-sm cursor-pointer ${
                        isViewing
                          ? 'bg-dnd-card ring-2 ring-white/80 shadow-[0_0_12px_rgba(255,255,255,0.18)] brightness-110'
                          : isAttuned
                          ? 'bg-dnd-card/90 hover:bg-dnd-hover/90 ring-1 ring-white/20'
                          : 'bg-dnd-card/60 hover:bg-dnd-hover/80 text-slate-300'
                      }`}
                    >
                      {/* Glowing Bookmark Strip (Spellbook prepared card style) */}
                      {item.requiresAttunement && (
                        <div
                          data-testid="attunement-bookmark-strip"
                          aria-hidden="true"
                          className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg transition-all duration-300 ${
                            isAttuned
                              ? 'bg-[#EFE9E0] shadow-[0_0_8px_rgba(239,233,224,0.65)]'
                              : 'bg-white/10'
                          }`}
                        />
                      )}

                      {/* Left: Color dot + Item Name */}
                      <div className={`flex items-center space-x-2 min-w-0 ${item.requiresAttunement ? 'pl-1' : ''}`}>
                        <span className={`w-2 h-2 rounded-full shrink-0 ${colorCfg.dot}`} />
                        <span
                          className={`font-semibold truncate ${
                            isViewing ? 'text-white' : isAttuned ? 'text-slate-100' : 'text-slate-200'
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>

                      {/* Right: Quantity + Attuned Badge + Delete */}
                      <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                        {item.quantity > 1 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                            x{item.quantity}
                          </span>
                        )}
                        {item.requiresAttunement && (
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                              isAttuned
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'text-slate-500 group-hover:text-slate-400'
                            }`}
                          >
                            {isAttuned ? 'Attuned' : '(attunable)'}
                          </span>
                        )}
                        <ItemDeleteButton item={item} onDelete={handleDeleteItem} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
