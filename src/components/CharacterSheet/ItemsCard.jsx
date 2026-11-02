import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Plus, X, Trash2 } from 'lucide-react';
import useTwoClickConfirm from '../../hooks/useTwoClickConfirm';
import { scrollIntoViewOnExpand } from '../../hooks/useAutoScrollOnExpand';

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

export default function ItemsCard({
  items = [],
  maxAttunement = 3,
  isAttuneMode: externalIsAttuneMode,
  onToggleAttuneMode,
  isAdding: externalIsAdding,
  onSetIsAdding,
  hideHeaderActions = false,
  onUpdateItems,
}) {
  const [internalIsAttuneMode, setInternalIsAttuneMode] = useState(false);
  const [internalIsAdding, setInternalIsAdding] = useState(false);

  const isAttuneMode =
    externalIsAttuneMode !== undefined ? externalIsAttuneMode : internalIsAttuneMode;
  const setIsAttuneMode = onToggleAttuneMode || setInternalIsAttuneMode;
  const isAdding = externalIsAdding !== undefined ? externalIsAdding : internalIsAdding;
  const setIsAdding = onSetIsAdding || setInternalIsAdding;

  // New item form state
  const [name, setName] = useState('');
  const [requiresAttunement, setRequiresAttunement] = useState(false);
  const [category, setCategory] = useState('magic'); // 'magic' | 'consumable' | 'general'
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [nameError, setNameError] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isAttuneMode || isAdding) {
      const frame = requestAnimationFrame(() => {
        scrollIntoViewOnExpand(containerRef.current);
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [isAttuneMode, isAdding]);

  const safeItems = Array.isArray(items) ? items : [];
  const attunedCount = safeItems.filter((i) => i.requiresAttunement && i.attuned).length;

  const toggleAttune = (itemId) => {
    if (!isAttuneMode) return;
    const updated = safeItems.map((item) => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        attuned: !item.attuned,
      };
    });
    onUpdateItems?.(updated);
  };

  const handleDeleteItem = (itemId, e) => {
    e?.stopPropagation?.();
    const updated = safeItems.filter((i) => i.id !== itemId);
    onUpdateItems?.(updated);
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      return;
    }

    const newItem = {
      id: `itm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      requiresAttunement: Boolean(requiresAttunement),
      attuned: false,
      category,
      quantity: Math.max(1, Number(quantity) || 1),
      note: note.trim(),
    };

    onUpdateItems?.([...safeItems, newItem]);
    setName('');
    setRequiresAttunement(false);
    setCategory('magic');
    setQuantity(1);
    setNote('');
    setNameError(false);
    setIsAdding(false);
  };

  return (
    <div ref={containerRef} className="space-y-2.5">
      {/* Header action bar (fallback when not mounted in AccordionSection) */}
      {!hideHeaderActions && (
        <div className="flex items-center justify-end pb-1 border-b border-white/5 text-xs">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-dnd-card text-xs shadow-sm">
              <span className="text-[11px] text-slate-400">Attuned:</span>
              <span
                className={`text-[11px] font-semibold ${
                  attunedCount > maxAttunement ? 'text-red-400' : 'text-dnd-gold'
                }`}
              >
                {attunedCount} / {maxAttunement}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsAttuneMode(!isAttuneMode)}
              className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-lg text-xs transition-colors ${
                isAttuneMode
                  ? 'bg-dnd-gold text-slate-950 font-medium'
                  : 'bg-dnd-card hover:bg-dnd-hover text-slate-300 hover:text-white'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isAttuneMode ? 'bg-slate-950 animate-pulse' : 'bg-dnd-gold'
                }`}
              />
              <span className="text-[11px]">{isAttuneMode ? 'Finish Attuning' : 'Manage Attunement'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-dnd-card hover:bg-dnd-hover text-dnd-gold hover:text-dnd-gold-light text-xs transition-colors"
            >
              <Plus size={11} />
              <span className="text-[11px]">Add Item</span>
            </button>
          </div>
        </div>
      )}

      {/* Attunement Mode Banner */}
      {isAttuneMode && (
        <div className="p-2 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between animate-fadeIn">
          <span>⚡ Attunement Mode Active: Click any attunable item chip below to attune/unattune.</span>
          <button
            type="button"
            onClick={() => setIsAttuneMode(false)}
            className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold text-[11px]"
          >
            Done
          </button>
        </div>
      )}

      {/* Inline Add Item Form */}
      {isAdding && (
        <form
          noValidate
          onSubmit={handleSaveItem}
          className="p-2.5 rounded-lg bg-dnd-card space-y-2 text-xs shadow-sm ring-1 ring-dnd-gold/30"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-dnd-gold text-[11px]">Add New Item</span>
            <button
              type="button"
              onClick={() => {
                setNameError(false);
                setIsAdding(false);
              }}
              className="text-slate-400 hover:text-white"
            >
              <X size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div className="sm:col-span-2">
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

            <div>
              <label htmlFor="itm-cat" className="block text-[10px] text-slate-400 mb-0.5">
                Category
              </label>
              <select
                id="itm-cat"
                aria-label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2 py-1 rounded bg-dnd-panel text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-white/20"
              >
                <option value="magic">Magic Item</option>
                <option value="consumable">Consumable / Scroll</option>
                <option value="general">Mundane / General</option>
              </select>
            </div>

            <div>
              <label htmlFor="itm-qty" className="block text-[10px] text-slate-400 mb-0.5">
                Quantity
              </label>
              <input
                id="itm-qty"
                aria-label="Quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-2 py-1 rounded bg-dnd-panel text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-white/20"
              />
            </div>
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
                onClick={() => setIsAdding(false)}
                className="px-2.5 py-1 rounded bg-dnd-panel text-slate-300 text-xs hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-dnd-gold text-slate-950 font-bold hover:bg-dnd-gold-light text-xs"
              >
                Save Item
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Items Inventory List */}
      <div className="flex flex-wrap gap-1.5 min-h-[22px]">
        {safeItems.length === 0 && !isAdding && (
          <span className="text-[10px] text-slate-500 italic">No items recorded</span>
        )}

        {safeItems.map((item) => {
          const isAttuned = Boolean(item.attuned && item.requiresAttunement);
          const isConsumable = item.category === 'consumable';
          return (
            <div
              key={item.id}
              data-testid={`item-chip-${item.id}`}
              onClick={() => toggleAttune(item.id)}
              className={`group relative flex items-center pr-2 py-1 rounded-lg text-xs select-none transition-all shadow-sm ${
                item.requiresAttunement ? 'pl-3.5 cursor-pointer' : 'px-2.5'
              } ${
                isAttuned
                  ? 'bg-dnd-card text-amber-300 ring-1 ring-white/20 shadow-[0_0_12px_rgba(255,255,255,0.08)]'
                  : isConsumable
                  ? 'bg-purple-950/30 ring-1 ring-purple-500/30 text-purple-200'
                  : 'bg-dnd-card text-slate-300 hover:bg-dnd-hover'
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

              <span className="font-semibold">{item.name}</span>
              {item.quantity > 1 && (
                <span
                  className={`ml-1 text-[10px] font-bold ${
                    isConsumable ? 'text-purple-300' : 'text-slate-400'
                  }`}
                >
                  x{item.quantity}
                </span>
              )}
              {item.requiresAttunement && (
                <span
                  className={`ml-1.5 text-[9px] px-1 py-0.2 rounded font-medium ${
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
          );
        })}
      </div>
    </div>
  );
}
