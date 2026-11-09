import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  BowArrow,
  Wand,
  Amphora,
  ScrollText,
  LayoutGridCircles,
  Plus,
  X,
  ChevronDown,
  Blend,
  Waypoints,
  Pencil,
  Circle,
  Search,
} from 'lucide-react';
import useTwoClickConfirm from '../../hooks/useTwoClickConfirm';
import useClickOutside from '../../hooks/useClickOutside';
import useAutoScrollOnExpand from '../../hooks/useAutoScrollOnExpand';
import useAccordionMount from '../../hooks/useAccordionMount';

export function OctahedronIcon({ size = 16, className = '', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12.859 21.652l8.845 -8.949a.984 .984 0 0 0 0 -1.407l-8.845 -8.948a1.233 1.233 0 0 0 -1.718 0l-8.845 8.949a.984 .984 0 0 0 0 1.407l8.845 8.949a1.234 1.234 0 0 0 1.718 -.001" />
      <path d="M2 12c.004 .086 .103 .178 .296 .246l8.845 2.632c.459 .163 1.259 .163 1.718 0l8.845 -2.632c.195 -.07 .294 -.156 .296 -.243" />
      <path d="M12 2.12v19.76" />
    </svg>
  );
}

export const ITEM_COLORS = [
  {
    id: 'slate',
    label: 'Slate',
    bg: 'bg-slate-800/40',
    text: 'text-slate-300',
    dot: 'bg-slate-400',
    color: '#94a3b8',
    glow: 'linear-gradient(to left, rgba(148, 163, 184, 0.3) 0%, rgba(148, 163, 184, 0.22) 10%, rgba(148, 163, 184, 0.13) 18%, rgba(148, 163, 184, 0.05) 25%, transparent 33.3%)',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-300',
    dot: 'bg-emerald-400',
    color: '#10b981',
    glow: 'linear-gradient(to left, rgba(16, 185, 129, 0.35) 0%, rgba(16, 185, 129, 0.25) 10%, rgba(16, 185, 129, 0.15) 18%, rgba(16, 185, 129, 0.06) 25%, transparent 33.3%)',
  },
  {
    id: 'sky',
    label: 'Sky',
    bg: 'bg-sky-950/40',
    text: 'text-sky-300',
    dot: 'bg-sky-400',
    color: '#0ea5e9',
    glow: 'linear-gradient(to left, rgba(14, 165, 233, 0.35) 0%, rgba(14, 165, 233, 0.25) 10%, rgba(14, 165, 233, 0.15) 18%, rgba(14, 165, 233, 0.06) 25%, transparent 33.3%)',
  },
  {
    id: 'purple',
    label: 'Purple',
    bg: 'bg-purple-950/40',
    text: 'text-purple-300',
    dot: 'bg-purple-400',
    color: '#a855f7',
    glow: 'linear-gradient(to left, rgba(168, 85, 247, 0.35) 0%, rgba(168, 85, 247, 0.25) 10%, rgba(168, 85, 247, 0.15) 18%, rgba(168, 85, 247, 0.06) 25%, transparent 33.3%)',
  },
  {
    id: 'amber',
    label: 'Amber',
    bg: 'bg-amber-950/60',
    text: 'text-amber-300',
    dot: 'bg-amber-400',
    color: '#f59e0b',
    glow: 'linear-gradient(to left, rgba(245, 158, 11, 0.4) 0%, rgba(245, 158, 11, 0.29) 10%, rgba(245, 158, 11, 0.17) 18%, rgba(245, 158, 11, 0.07) 25%, transparent 33.3%)',
  },
  {
    id: 'rose',
    label: 'Rose',
    bg: 'bg-rose-950/40',
    text: 'text-rose-300',
    dot: 'bg-rose-400',
    color: '#f43f5e',
    glow: 'linear-gradient(to left, rgba(244, 63, 94, 0.4) 0%, rgba(244, 63, 94, 0.29) 10%, rgba(244, 63, 94, 0.17) 18%, rgba(244, 63, 94, 0.07) 25%, transparent 33.3%)',
  },
];

export const RESOURCE_COLORS = [
  {
    id: 'none',
    label: 'No Color',
    bg: 'bg-dnd-card',
    text: 'text-slate-200',
    dot: 'border border-slate-500/80 bg-transparent',
    color: 'transparent',
    glow: 'none',
  },
  ...ITEM_COLORS,
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
  { id: 'component', label: 'Spell Components', shortLabel: 'Components', icon: OctahedronIcon },
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
  if (colorId === 'none') {
    return RESOURCE_COLORS[0];
  }
  const legacyMap = {
    common: 'slate',
    uncommon: 'emerald',
    rare: 'sky',
    very_rare: 'purple',
    legendary: 'amber',
    artifact: 'rose',
    blue: 'sky',
  };
  const resolved = legacyMap[colorId] || colorId;
  return (
    ITEM_COLORS.find((c) => c.id === resolved) ||
    RESOURCE_COLORS.find((c) => c.id === resolved) ||
    ITEM_COLORS[0]
  );
}

export function ColorDropdown({
  color,
  setColor,
  isOpen,
  setIsOpen,
  dropdownRef,
  colors = ITEM_COLORS,
  align = 'right',
  className = '',
}) {
  const selectedConfig = colors.find((c) => c.id === color) || getColorConfig(color);
  const isNone = selectedConfig.id === 'none';
  const gridClass = colors.length > 6 ? 'grid-cols-4 w-[110px]' : 'grid-cols-3 w-[84px]';
  const alignClass = align === 'left' ? 'left-0' : 'right-0';

  return (
    <div className={`w-11 shrink-0 relative ${className}`} ref={dropdownRef}>
      <label className="block text-[10px] text-slate-400 mb-0.5 text-center">
        Color
      </label>
      <button
        type="button"
        aria-label="Select color tag"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-1 py-1 rounded bg-dnd-panel text-slate-200 text-xs flex items-center justify-center gap-1 hover:bg-dnd-panel/90 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors h-[26px]"
      >
        {isNone ? (
          <span className="w-3.5 h-3.5 rounded-full border border-slate-500/80 bg-transparent flex items-center justify-center relative overflow-hidden shadow-sm shrink-0">
            <span className="w-full h-[1.5px] bg-red-400/80 -rotate-45 block" />
          </span>
        ) : (
          <span className={`w-3.5 h-3.5 rounded-full ${selectedConfig.dot} shadow-sm shrink-0`} />
        )}
        <ChevronDown size={10} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute ${alignClass} top-full mt-1.5 p-1.5 rounded-lg bg-dnd-card shadow-lg ring-1 ring-white/10 z-30 grid ${gridClass} gap-1.5`}>
          {colors.map((c) => {
            const isSelected = color === c.id || (!color && c.id === 'none');
            const isSwatchNone = c.id === 'none';
            return (
              <button
                key={c.id}
                type="button"
                aria-label={`Select ${c.id}`}
                title={c.label}
                onClick={() => {
                  setColor(c.id);
                  setIsOpen(false);
                }}
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? 'ring-2 ring-white scale-110 shadow-sm'
                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                }`}
              >
                {isSwatchNone ? (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-500/80 bg-transparent flex items-center justify-center relative overflow-hidden">
                    <span className="w-full h-[1.5px] bg-red-400/80 -rotate-45 block" />
                  </span>
                ) : (
                  <span className={`w-3.5 h-3.5 rounded-full ${c.dot}`} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
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
          ? 'text-red-500 bg-red-950/70 ring-1 ring-red-500/60'
          : 'text-slate-600 hover:text-red-400'
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

function CategoryDetailViewer({
  viewingItem,
  groupCategory,
  editingItemId,
  editFormProps,
  onClose,
  onStartEdit,
  onToggleAttune,
}) {
  const isMatch =
    Boolean(viewingItem) &&
    (viewingItem.category === groupCategory ||
      (viewingItem.category === 'general' && groupCategory === 'gear'));

  const isEditingThisItem = isMatch && Boolean(editingItemId) && editingItemId === viewingItem?.id;

  const { shouldRender, isClosing } = useAccordionMount(isMatch, 200);

  // Keep rendering item data while accordion is collapsing
  const cachedItemRef = useRef(viewingItem);
  if (isMatch && viewingItem) {
    cachedItemRef.current = viewingItem;
  }
  const itemToDisplay = isMatch ? viewingItem : cachedItemRef.current;

  if (!shouldRender || !itemToDisplay) return null;

  return (
    <ItemDetailViewer
      viewingItem={itemToDisplay}
      isEditing={isEditingThisItem}
      editFormProps={editFormProps}
      isClosing={isClosing}
      onClose={onClose}
      onStartEdit={onStartEdit}
      onToggleAttune={onToggleAttune}
    />
  );
}

function ItemDetailViewer({
  viewingItem,
  isEditing = false,
  editFormProps,
  isClosing = false,
  onClose,
  onStartEdit,
  onToggleAttune,
}) {
  if (!viewingItem) return null;

  if (isEditing && editFormProps) {
    return (
      <div
        data-testid="item-viewer-wrapper"
        className={isClosing ? 'animate-accordion-up' : 'animate-accordion-down'}
      >
        <div className="overflow-hidden p-0.5 pb-2">
          <ItemForm {...editFormProps} />
        </div>
      </div>
    );
  }

  const viewerColorCfg = getColorConfig(viewingItem.color || viewingItem.rarity);
  const viewerCatCfg = getCategoryConfig(viewingItem.category);
  const ViewerCategoryIcon = viewerCatCfg.icon;
  const isViewerAttuned = Boolean(viewingItem.attuned && viewingItem.requiresAttunement);

  const noteText = viewingItem.note || viewingItem.description || '';
  const bucket = getLineBucket(noteText);
  // Base card header + paddings + border is ~64px; notes area is bucket * 19.5px
  const totalViewerHeight = Math.round(64 + bucket * 19.5);

  return (
    <div
      data-testid="item-viewer-wrapper"
      className={isClosing ? 'animate-accordion-up' : 'animate-accordion-down'}
    >
      <div className="overflow-hidden p-0.5 pb-2">
        <div
          data-testid="item-viewer-card"
          style={{ height: `${totalViewerHeight}px` }}
          className={`p-3 rounded-lg flex flex-col justify-between text-xs shadow-sm ring-1 ring-white/10 ${viewerColorCfg.bg} ${viewerColorCfg.text} transition-[height,background-color] duration-300 ease-in-out overflow-hidden`}
        >
          <div className="flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center space-x-2 min-w-0">
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
                  onClick={() => onToggleAttune(viewingItem.id)}
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
                onClick={(e) => onStartEdit(viewingItem, e)}
                className="p-1 rounded text-slate-400 hover:text-dnd-gold hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Pencil size={12} />
              </button>

              <button
                type="button"
                aria-label={`Close ${viewingItem.name} details`}
                title="Close details"
                onClick={onClose}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          <div
            data-testid="item-viewer-notes"
            className="flex-1 min-h-0 pt-2 mt-2 border-t border-white/5 text-slate-300 text-xs overflow-y-auto pr-1"
          >
            {viewingItem.note || viewingItem.description ? (
              <p className="whitespace-pre-wrap leading-relaxed text-slate-300">
                {viewingItem.note || viewingItem.description}
              </p>
            ) : (
              <p className="text-slate-500 italic text-[11px] leading-relaxed">
                No description or notes recorded.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemForm({
  formRef,
  editingItemId,
  name,
  setName,
  nameError,
  setNameError,
  quantity,
  setQuantity,
  color,
  setColor,
  isColorMenuOpen,
  setIsColorMenuOpen,
  colorDropdownRef,
  selectedColorConfig,
  category,
  setCategory,
  note,
  setNote,
  editBucket,
  requiresAttunement,
  setRequiresAttunement,
  onSubmit,
  onCancel,
}) {
  return (
    <form
      ref={formRef}
      noValidate
      data-testid={editingItemId ? 'item-edit-form' : 'item-add-form'}
      onSubmit={onSubmit}
      className="p-2.5 rounded-lg bg-dnd-card space-y-2 text-xs shadow-sm ring-1 ring-dnd-gold/30 animate-fadeIn"
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-dnd-gold text-[11px]">
          {editingItemId ? 'Edit Item' : 'Add New Item'}
        </span>
        <button
          type="button"
          aria-label="Cancel"
          onClick={onCancel}
          className="text-slate-400 hover:text-white"
        >
          <X size={13} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2">
        {/* Item Name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <label htmlFor={editingItemId ? `itm-name-${editingItemId}` : 'itm-name'} className="block text-[10px] text-slate-400">
              Item Name
            </label>
            {nameError && (
              <span className="text-[9px] text-red-400 font-semibold">Name required</span>
            )}
          </div>
          <input
            id={editingItemId ? `itm-name-${editingItemId}` : 'itm-name'}
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
          <label htmlFor={editingItemId ? `itm-qty-${editingItemId}` : 'itm-qty'} className="block text-[10px] text-slate-400 mb-0.5 text-center">
            Qty
          </label>
          <input
            id={editingItemId ? `itm-qty-${editingItemId}` : 'itm-qty'}
            aria-label="Quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-1.5 py-1 rounded bg-dnd-panel text-slate-200 text-xs text-center focus:outline-none focus:ring-1 focus:ring-white/20 h-[26px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {/* Color Tag Dropdown */}
        <ColorDropdown
          color={color}
          setColor={setColor}
          isOpen={isColorMenuOpen}
          setIsOpen={setIsColorMenuOpen}
          dropdownRef={colorDropdownRef}
        />

        {/* Category */}
        <div className="w-40 shrink-0">
          <label htmlFor={editingItemId ? `itm-cat-${editingItemId}` : 'itm-cat'} className="block text-[10px] text-slate-400 mb-0.5">
            Category
          </label>
          <select
            id={editingItemId ? `itm-cat-${editingItemId}` : 'itm-cat'}
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
        <label htmlFor={editingItemId ? `itm-note-${editingItemId}` : 'itm-note'} className="block text-[10px] text-slate-400 mb-0.5">
          Description / Notes
        </label>
        <textarea
          id={editingItemId ? `itm-note-${editingItemId}` : 'itm-note'}
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
            onClick={onCancel}
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
  const [searchQuery, setSearchQuery] = useState('');

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

  const addFormRef = useAutoScrollOnExpand(Boolean(isAdding && !editingItemId));
  const editFormRef = useAutoScrollOnExpand(Boolean(editingItemId));
  const filtersRef = useAutoScrollOnExpand(Boolean(showFilters));

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
    const query = searchQuery.trim().toLowerCase();
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
      if (query) {
        const nameMatch = (item.name || '').toLowerCase().includes(query);
        const noteMatch = (item.note || item.description || '').toLowerCase().includes(query);
        if (!nameMatch && !noteMatch) {
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
  }, [safeItems, selectedCategory, selectedColor, searchQuery]);

  const selectedColorConfig = getColorConfig(color);

  return (
    <div className="space-y-2.5">
      {/* Search Bar & Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            aria-label="Search inventory"
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-7 py-1 text-xs rounded-lg bg-dnd-card text-slate-200 placeholder-slate-500 border border-white/5 focus:outline-none focus:ring-1 focus:ring-dnd-gold/60"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

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

      {/* Inline Add Item Form (New items only) */}
      {isAdding && !editingItemId && (
        <ItemForm
          formRef={addFormRef}
          editingItemId={null}
          name={name}
          setName={setName}
          nameError={nameError}
          setNameError={setNameError}
          quantity={quantity}
          setQuantity={setQuantity}
          color={color}
          setColor={setColor}
          isColorMenuOpen={isColorMenuOpen}
          setIsColorMenuOpen={setIsColorMenuOpen}
          colorDropdownRef={colorDropdownRef}
          selectedColorConfig={selectedColorConfig}
          category={category}
          setCategory={setCategory}
          note={note}
          setNote={setNote}
          editBucket={editBucket}
          requiresAttunement={requiresAttunement}
          setRequiresAttunement={setRequiresAttunement}
          onSubmit={handleSaveItem}
          onCancel={handleCancel}
        />
      )}

      {/* Expandable Items Filter Accordion */}
      {showFilters && (
        <div ref={filtersRef} className="flex flex-wrap items-center justify-between gap-1.5 text-xs py-1 px-1.5 rounded-lg bg-dnd-card shadow-sm animate-fadeIn">
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

      {/* Items Inventory List */}
      <div className="space-y-3 min-h-[22px]">
        {safeItems.length === 0 && !isAdding && (
          <span className="text-[10px] text-slate-500 italic">No items recorded</span>
        )}

        {safeItems.length > 0 && totalFilteredCount === 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 italic">
              {searchQuery ? `No items matching "${searchQuery}"` : 'No items match current filters'}
            </span>
            <button
              type="button"
              onClick={() => {
                setFilters({ category: 'all', color: 'all' });
                setSearchQuery('');
              }}
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

              {/* Inline Item Detail Viewer or In-Place Edit Form for this category */}
              <CategoryDetailViewer
                viewingItem={viewingItem}
                groupCategory={group.category}
                editingItemId={editingItemId}
                editFormProps={{
                  formRef: editFormRef,
                  editingItemId,
                  name,
                  setName,
                  nameError,
                  setNameError,
                  quantity,
                  setQuantity,
                  color,
                  setColor,
                  isColorMenuOpen,
                  setIsColorMenuOpen,
                  colorDropdownRef,
                  selectedColorConfig,
                  category,
                  setCategory,
                  note,
                  setNote,
                  editBucket,
                  requiresAttunement,
                  setRequiresAttunement,
                  onSubmit: handleSaveItem,
                  onCancel: handleCancel,
                }}
                onClose={() => {
                  setViewingItemId(null);
                  if (editingItemId) handleCancel();
                }}
                onStartEdit={handleStartEdit}
                onToggleAttune={toggleAttune}
              />

              {/* Grid of Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-1.5">
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
                      className={`group relative flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs select-none transition-all shadow-sm cursor-pointer overflow-hidden ${
                        isViewing
                          ? 'bg-dnd-card ring-2 ring-white/80 shadow-[0_0_12px_rgba(255,255,255,0.18)] brightness-110'
                          : isAttuned
                          ? 'bg-dnd-card hover:bg-dnd-hover'
                          : 'bg-dnd-card hover:bg-dnd-hover text-slate-300'
                      }`}
                    >
                      {/* Ease-out gradient originating from the right side and ending at the 2/3 mark */}
                      <div
                        aria-hidden="true"
                        data-testid="item-right-gradient"
                        style={{
                          background: colorCfg.glow,
                        }}
                        className="absolute inset-0 pointer-events-none rounded-lg"
                      />

                      {/* Left: Item Name */}
                      <div className="relative z-10 flex items-center space-x-1.5 min-w-0">
                        <span
                          className={`font-semibold truncate ${
                            isViewing ? 'text-white' : isAttuned ? 'text-slate-100' : 'text-slate-200'
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>

                      {/* Right: Quantity + Compact Attunement Ring Icon + Delete */}
                      <div className="relative z-10 flex items-center space-x-1.5 shrink-0 ml-2">
                        {item.quantity > 1 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                            x{item.quantity}
                          </span>
                        )}
                        {item.requiresAttunement && (
                          <span
                            data-testid="attunement-icon"
                            title={isAttuned ? 'Attuned' : 'Requires Attunement'}
                            aria-label={isAttuned ? 'Attuned' : 'Requires attunement'}
                            className={`flex items-center justify-center transition-colors ${
                              isAttuned
                                ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]'
                                : 'text-slate-600 group-hover:text-slate-400'
                            }`}
                          >
                            <Circle
                              size={11}
                              strokeWidth={isAttuned ? 2.5 : 2}
                              className={isAttuned ? 'fill-white/20' : ''}
                            />
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
